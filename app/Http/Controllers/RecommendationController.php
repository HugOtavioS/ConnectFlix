<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\UserPreference;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function roulette(Request $request)
    {
        $user = $request->user();
        $preferences = UserPreference::where('user_id', $user->id)->first();

        $query = Media::query();

        // Filter by user preferences if available
        if ($preferences) {
            if (!empty($preferences->favorite_categories)) {
                $query->whereHas('categories', function ($q) use ($preferences) {
                    $q->whereIn('categories.id', $preferences->favorite_categories);
                });
            }

            if (!empty($preferences->favorite_actors)) {
                $query->whereHas('actors', function ($q) use ($preferences) {
                    $q->whereIn('actors.id', $preferences->favorite_actors);
                });
            }
        }

        // Get random media
        $media = $query->inRandomOrder()->first();

        if (!$media) {
            // If no media found with preferences, get any random media
            $media = Media::inRandomOrder()->first();
        }

        if (!$media) {
            return response()->json([
                'message' => 'No media available'
            ], 404);
        }

        $media->load(['categories', 'actors']);

        return response()->json($media);
    }

    public function similar($media_id)
    {
        $media = Media::with(['categories', 'actors'])->findOrFail($media_id);

        $categoryIds = $media->categories->pluck('id');
        $actorIds = $media->actors->pluck('id');

        $similarMedia = Media::where('id', '!=', $media_id)
            ->where(function ($query) use ($categoryIds, $actorIds) {
                $query->whereHas('categories', function ($q) use ($categoryIds) {
                    $q->whereIn('categories.id', $categoryIds);
                })->orWhereHas('actors', function ($q) use ($actorIds) {
                    $q->whereIn('actors.id', $actorIds);
                });
            })
            ->with(['categories', 'actors'])
            ->limit(10)
            ->get();

        return response()->json($similarMedia);
    }
}

