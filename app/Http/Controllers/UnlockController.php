<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Media;
use App\Models\MediaUnlockRequirement;
use App\Services\YouTubeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UnlockController extends Controller
{
    protected $youtubeService;

    public function __construct(YouTubeService $youtubeService)
    {
        $this->youtubeService = $youtubeService;
    }
    public function me(Request $request)
    {
        $user = $request->user();
        $unlockedMedia = $user->unlockedMedia()->with(['categories', 'actors'])->get();
        
        return response()->json($unlockedMedia);
    }

    public function check(Request $request, $media_id)
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

        // Buscar categorias da mídia bloqueada
        $mediaCategories = DB::table('media_categories')
            ->where('media_id', $media_id)
            ->pluck('category_id');

        if ($mediaCategories->isEmpty()) {
            return response()->json([
                'message' => 'Unlock criteria not met - no categories found',
                'unlocked' => false
            ]);
        }

        // Allow the client to pass a specific list of youtube_ids to validate
        $inputYoutubeIds = $request->input('youtube_ids', []);
        if (!empty($inputYoutubeIds)) {
            // Verificar se o usuário assistiu os vídeos do YouTube requisitados
            $watchedYoutubeIds = DB::table('user_activities')
                ->join('media', 'user_activities.media_id', '=', 'media.id')
                ->where('user_activities.user_id', $user->id)
                ->where('user_activities.activity_type', 'watch')
                ->whereIn('media.youtube_id', $inputYoutubeIds)
                ->whereNotNull('media.youtube_id')
                ->distinct()
                ->pluck('media.youtube_id')
                ->toArray();

            $allRequirementsMet = !empty($inputYoutubeIds) && 
                count($watchedYoutubeIds) >= min(3, count($inputYoutubeIds)); // Pelo menos 3 ou todos se menos que 3

            if ($allRequirementsMet) {
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
                'message' => 'Unlock criteria not met - requirements not fulfilled',
                'unlocked' => false,
                'requirements_count' => count($inputYoutubeIds),
                'watched_count' => count($watchedYoutubeIds),
            ]);
        }

        // Fallback: Check unlock criteria based on similar consumption (categorias/atores)
        // Verificar se o usuário assistiu vídeos do YouTube com as mesmas categorias
        
        // Buscar categorias da mídia bloqueada
        $mediaCategories = DB::table('media_categories')
            ->where('media_id', $media_id)
            ->pluck('category_id');

        if ($mediaCategories->isEmpty()) {
            return response()->json([
                'message' => 'Unlock criteria not met - no categories found',
                'unlocked' => false
            ]);
        }

        // Buscar mídias assistidas pelo usuário que têm youtube_id
        $watchedMediaIds = DB::table('user_activities')
            ->join('media', 'user_activities.media_id', '=', 'media.id')
            ->where('user_activities.user_id', $user->id)
            ->where('user_activities.activity_type', 'watch')
            ->whereNotNull('media.youtube_id')
            ->distinct()
            ->pluck('media.id')
            ->toArray();

        if (empty($watchedMediaIds)) {
            return response()->json([
                'message' => 'Unlock criteria not met',
                'unlocked' => false
            ]);
        }

        // Verificar se alguma mídia assistida compartilha categorias com a mídia bloqueada
        $watchedCategories = DB::table('media_categories')
            ->whereIn('media_id', $watchedMediaIds)
            ->distinct()
            ->pluck('category_id');

        $hasSharedCategory = $watchedCategories->intersect($mediaCategories)->isNotEmpty();

        if ($hasSharedCategory) {
            // Desbloquear a mídia
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

    /**
     * GET /unlocks/requirements/{media_id}
     * Retorna as mídias do YouTube que precisam ser assistidas para desbloquear uma mídia
     * Baseado nas categorias da mídia bloqueada
     */
    public function requirements($media_id)
    {
        $user = request()->user();
        $media = Media::with('categories')->findOrFail($media_id);

        // Buscar categorias da mídia bloqueada
        $categoryNames = $media->categories->pluck('name')->toArray();

        // Se não houver categorias, usar um termo genérico
        if (empty($categoryNames)) {
            $categoryNames = ['filmes completos'];
        }

        // Buscar 2-4 vídeos do YouTube por categoria
        // Cada categoria retorna entre 2-4 vídeos, garantindo requisitos únicos por mídia
        $youtubeVideos = [];
        foreach ($categoryNames as $categoryName) {
            $videosPerCategory = rand(2, 4);
            $categoryVideos = $this->youtubeService->searchVideosByCategory($categoryName, $videosPerCategory);
            $youtubeVideos = array_merge($youtubeVideos, $categoryVideos);
        }
        
        // Remover duplicatas baseado no youtube_id
        $uniqueVideos = [];
        $seenIds = [];
        foreach ($youtubeVideos as $video) {
            if (!empty($video['youtube_id']) && !in_array($video['youtube_id'], $seenIds)) {
                $uniqueVideos[] = $video;
                $seenIds[] = $video['youtube_id'];
            }
        }
        
        // Limitar a 4 vídeos no máximo, mas garantir pelo menos 2
        if (count($uniqueVideos) > 4) {
            $uniqueVideos = array_slice($uniqueVideos, 0, 4);
        }
        
        $youtubeVideos = $uniqueVideos;

        // Buscar youtube_ids dos vídeos que o usuário já assistiu
        $watchedYoutubeIds = DB::table('user_activities')
            ->join('media', 'user_activities.media_id', '=', 'media.id')
            ->where('user_activities.user_id', $user->id)
            ->where('user_activities.activity_type', 'watch')
            ->whereNotNull('media.youtube_id')
            ->distinct()
            ->pluck('media.youtube_id')
            ->toArray();

        // Mapear vídeos do YouTube com status de assistido
        $requirementsWithStatus = array_map(function ($video) use ($watchedYoutubeIds) {
            $isWatched = in_array($video['youtube_id'], $watchedYoutubeIds);
            
            return [
                'youtube_id' => $video['youtube_id'],
                'title' => $video['title'],
                'description' => $video['description'] ?? '',
                'thumbnail' => $video['thumbnail'],
                'channel_title' => $video['channel_title'] ?? '',
                'is_watched' => $isWatched,
            ];
        }, $youtubeVideos);

        // Verificar se todos os requisitos foram atendidos
        $allWatched = !empty($requirementsWithStatus) && collect($requirementsWithStatus)->every(function ($req) {
            return $req['is_watched'];
        });

        return response()->json([
            'target_media' => [
                'id' => $media->id,
                'title' => $media->title,
            ],
            'requirements' => $requirementsWithStatus,
            'all_requirements_met' => $allWatched,
            'total_required' => count($requirementsWithStatus),
            'watched_count' => collect($requirementsWithStatus)->filter(fn($r) => $r['is_watched'])->count(),
        ]);
    }
}

