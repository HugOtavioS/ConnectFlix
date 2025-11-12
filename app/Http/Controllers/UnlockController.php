<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UnlockController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        $unlockedMedia = $user->unlockedMedia()->with(['categories', 'actors'])->get();
        
        return response()->json($unlockedMedia);
    }

    public function check($media_id)
    {
        $user = request()->user();
        $media = Media::findOrFail($media_id);

        // Check if already unlocked
        $alreadyUnlocked = DB::table('user_unlocked_media')
            ->where('user_id', $user->id)
            ->where('media_id', $media_id)
            ->exists();

        if ($alreadyUnlocked) {
            return response()->json([
                'message' => 'Media already unlocked',
                'unlocked' => true
            ]);
        }

        // Check unlock criteria based on similar consumption
        // Get user's watched media
        $watchedMediaIds = DB::table('user_activities')
            ->where('user_id', $user->id)
            ->where('activity_type', 'watch')
            ->whereNotNull('media_id')
            ->distinct()
            ->pluck('media_id');

        if ($watchedMediaIds->isEmpty()) {
            return response()->json([
                'message' => 'Unlock criteria not met',
                'unlocked' => false
            ]);
        }

        // Get categories and actors from watched media
        $watchedCategories = DB::table('media_categories')
            ->whereIn('media_id', $watchedMediaIds)
            ->distinct()
            ->pluck('category_id');

        $watchedActors = DB::table('media_actors')
            ->whereIn('media_id', $watchedMediaIds)
            ->distinct()
            ->pluck('actor_id');

        // Check if target media shares categories or actors
        $mediaCategories = DB::table('media_categories')
            ->where('media_id', $media_id)
            ->pluck('category_id');

        $mediaActors = DB::table('media_actors')
            ->where('media_id', $media_id)
            ->pluck('actor_id');

        $hasSharedCategory = $watchedCategories->intersect($mediaCategories)->isNotEmpty();
        $hasSharedActor = $watchedActors->intersect($mediaActors)->isNotEmpty();

        if ($hasSharedCategory || $hasSharedActor) {
            // Unlock the media
            DB::table('user_unlocked_media')->insert([
                'user_id' => $user->id,
                'media_id' => $media_id,
                'unlocked_at' => now(),
            ]);

            return response()->json([
                'message' => 'Media unlocked successfully',
                'unlocked' => true
            ]);
        }

        return response()->json([
            'message' => 'Unlock criteria not met',
            'unlocked' => false
        ]);
    }
}

