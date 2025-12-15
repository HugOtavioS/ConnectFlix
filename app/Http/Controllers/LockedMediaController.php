<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\UserUnlockProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LockedMediaController extends Controller
{
    public function getDefaultLockedMedia(Request $request)
    {
        $user = $request->user();
        
        $unlockedIds = DB::table('user_unlocked_media')
            ->where('user_id', $user->id)
            ->pluck('media_id')
            ->toArray();

        $lockedMedia = Media::whereNotIn('id', $unlockedIds)
            ->whereNotNull('youtube_id')
            ->limit(20)
            ->get();

        return response()->json($lockedMedia);
    }

    public function getUserProgress(Request $request, $lockedMediaId)
    {
        $user = $request->user();
        
        $progress = UserUnlockProgress::where('user_id', $user->id)
            ->where('target_media_id', $lockedMediaId)
            ->first();

        if (!$progress) {
            return response()->json([
                'progress' => 0,
                'watched_requirement_ids' => [],
            ]);
        }

        return response()->json([
            'progress' => $progress->progress_percentage,
            'watched_requirement_ids' => $progress->watched_requirement_ids ?? [],
            'started_at' => $progress->started_at,
            'last_activity_at' => $progress->last_activity_at,
        ]);
    }

    public function getInProgressMedia(Request $request)
    {
        $user = $request->user();

        $inProgress = UserUnlockProgress::where('user_id', $user->id)
            ->where('progress_percentage', '>', 0)
            ->where('progress_percentage', '<', 100)
            ->with('targetMedia')
            ->orderBy('last_activity_at', 'desc')
            ->get()
            ->map(function ($progress) {
                return [
                    'id' => $progress->target_media_id,
                    'youtube_id' => $progress->targetMedia->youtube_id ?? null,
                    'title' => $progress->targetMedia->title ?? 'Mídia',
                    'thumbnail' => $progress->targetMedia->poster_url ?? null,
                    'rating' => $progress->targetMedia->rating ?? 0,
                    'progress' => $progress->progress_percentage,
                ];
            });

        return response()->json($inProgress);
    }

    public function updateProgress(Request $request, $lockedMediaId)
    {
        $user = $request->user();
        $watchedYoutubeId = $request->input('watched_youtube_id');
        $totalRequired = $request->input('total_required', 3);

        $progress = UserUnlockProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'target_media_id' => $lockedMediaId,
            ],
            [
                'watched_requirement_ids' => [],
                'progress_percentage' => 0,
                'started_at' => now(),
            ]
        );

        $watchedIds = $progress->watched_requirement_ids ?? [];
        if ($watchedYoutubeId && !in_array($watchedYoutubeId, $watchedIds)) {
            $watchedIds[] = $watchedYoutubeId;
        }

        $progressPercentage = $totalRequired > 0 
            ? min(100, round((count($watchedIds) / $totalRequired) * 100))
            : 0;

        $progress->watched_requirement_ids = $watchedIds;
        $progress->progress_percentage = $progressPercentage;
        $progress->last_activity_at = now();
        $progress->save();

        return response()->json([
            'progress' => $progressPercentage,
            'watched_count' => count($watchedIds),
        ]);
    }

    public function unlockMedia(Request $request, $lockedMediaId)
    {
        $user = $request->user();

        $alreadyUnlocked = DB::table('user_unlocked_media')
            ->where('user_id', $user->id)
            ->where('media_id', $lockedMediaId)
            ->exists();

        if ($alreadyUnlocked) {
            return response()->json([
                'message' => 'Already unlocked',
                'unlocked' => true,
            ]);
        }

        DB::table('user_unlocked_media')->insert([
            'user_id' => $user->id,
            'media_id' => $lockedMediaId,
            'unlocked_at' => now(),
        ]);

        UserUnlockProgress::where('user_id', $user->id)
            ->where('target_media_id', $lockedMediaId)
            ->delete();

        return response()->json([
            'message' => 'Media unlocked successfully',
            'unlocked' => true,
        ]);
    }
}
