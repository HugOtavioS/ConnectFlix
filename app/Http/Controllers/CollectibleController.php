<?php

namespace App\Http\Controllers;

use App\Models\UserCollectible;
use App\Models\Card;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CollectibleController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        $collectibles = UserCollectible::where('user_id', $user->id)
            ->with(['card', 'media'])
            ->get();

        // Group by card and count
        $grouped = $collectibles->groupBy('card_id')->map(function ($items) {
            return [
                'card' => $items->first()->card,
                'count' => $items->count(),
                'counters' => $items->first()->counters,
            ];
        })->values();

        return response()->json($grouped);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'media_id' => 'required|exists:media,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $media = Media::with(['categories', 'actors'])->findOrFail($request->media_id);

        // Generate counters based on media
        $counters = [
            'media_id' => $media->id,
            'media_title' => $media->title,
            'categories' => $media->categories->pluck('id')->toArray(),
            'actors' => $media->actors->pluck('id')->toArray(),
            'collected_at' => now()->toDateTimeString(),
        ];

        // Find or create a card for this media
        $card = Card::firstOrCreate(
            [
                'type' => 'media',
                'related_id' => $media->id,
            ],
            [
                'name' => $media->title,
                'description' => $media->description,
                'rarity' => 'common',
                'points_value' => 10,
                'image_url' => $media->poster_url,
            ]
        );

        // Create collectible
        $collectible = UserCollectible::create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'media_id' => $media->id,
            'counters' => $counters,
        ]);

        return response()->json([
            'message' => 'Collectible added successfully',
            'collectible' => $collectible->load(['card', 'media'])
        ], 201);
    }

    public function show($collectible_id)
    {
        $collectible = UserCollectible::with(['card', 'media', 'user'])->findOrFail($collectible_id);
        
        return response()->json($collectible);
    }
}


