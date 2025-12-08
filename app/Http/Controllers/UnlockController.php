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

        // Buscar vídeos do YouTube que são requisitos (mesmas categorias) ou usar lista enviada pelo frontend
        $categoryNames = DB::table('categories')
            ->whereIn('id', $mediaCategories)
            ->pluck('name')
            ->toArray();

        // If front-end sent a specific set of youtube ids, use these
        $requiredYoutubeIds = $request->input('required_youtube_ids', []);
        if (empty($requiredYoutubeIds) && !empty($categoryNames)) {
            $requiredYoutubeVideos = $this->youtubeService->searchVideosByCategories($categoryNames, 5);
            $requiredYoutubeIds = array_column($requiredYoutubeVideos, 'youtube_id');
        }

        if (!empty($requiredYoutubeIds)) {
            // Verificar se o usuário assistiu os vídeos do YouTube requisitados
            $watchedYoutubeIds = DB::table('user_activities')
                ->join('media', 'user_activities.media_id', '=', 'media.id')
                ->where('user_activities.user_id', $user->id)
                ->where('user_activities.activity_type', 'watch')
                ->whereIn('media.youtube_id', $requiredYoutubeIds)
                ->whereNotNull('media.youtube_id')
                ->distinct()
                ->pluck('media.youtube_id')
                ->toArray();

            // Verificar se todos os vídeos requisitados foram assistidos
            $minRequired = min(3, max(1, count($requiredYoutubeIds)));
            $allRequirementsMet = !empty($requiredYoutubeIds) && 
                count($watchedYoutubeIds) >= $minRequired; // Pelo menos 3 ou todos se menos que 3

            if ($allRequirementsMet) {
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
                'message' => 'Unlock criteria not met - requirements not fulfilled',
                'unlocked' => false,
                'requirements_count' => count($requiredYoutubeIds),
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

        // Retornar apenas as categorias e os IDs de vídeos que o usuário já assistiu
        // A busca por vídeos do YouTube é feita pelo frontend (Next.js)

        // Buscar youtube_ids dos vídeos que o usuário já assistiu
        $watchedYoutubeIds = DB::table('user_activities')
            ->join('media', 'user_activities.media_id', '=', 'media.id')
            ->where('user_activities.user_id', $user->id)
            ->where('user_activities.activity_type', 'watch')
            ->whereNotNull('media.youtube_id')
            ->distinct()
            ->pluck('media.youtube_id')
            ->toArray();

        return response()->json([
            'target_media' => [
                'id' => $media->id,
                'title' => $media->title,
            ],
            'categories' => $media->categories->map(function ($c) { return ['id' => $c->id, 'name' => $c->name]; }),
            'watched_youtube_ids' => $watchedYoutubeIds,
        ]);
    }
}

