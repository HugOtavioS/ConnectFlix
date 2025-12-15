<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Media;
use App\Models\MediaUnlockRequirement;
use App\Models\UserUnlockProgress;
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

    /**
     * GET /unlocks/in-progress
     * Retorna as mídias que o usuário está em processo de desbloqueio
     */
    public function inProgress(Request $request)
    {
        $user = $request->user();

        $inProgressMedia = UserUnlockProgress::where('user_id', $user->id)
            ->where('progress_percentage', '>', 0)
            ->where('progress_percentage', '<', 100)
            ->with(['targetMedia' => function ($query) {
                $query->select('id', 'youtube_id', 'title', 'poster_url', 'rating');
            }])
            ->orderBy('last_activity_at', 'desc')
            ->get()
            ->map(function ($progress) {
                return [
                    'id' => $progress->target_media_id,
                    'youtube_id' => $progress->targetMedia->youtube_id ?? null,
                    'title' => $progress->targetMedia->title ?? 'Mídia não encontrada',
                    'thumbnail' => $progress->targetMedia->poster_url ?? null,
                    'rating' => $progress->targetMedia->rating ?? 0,
                    'progress' => $progress->progress_percentage,
                    'watched_requirement_ids' => $progress->watched_requirement_ids ?? [],
                    'started_at' => $progress->started_at,
                    'last_activity_at' => $progress->last_activity_at,
                ];
            });

        return response()->json($inProgressMedia);
    }

    /**
     * POST /unlocks/progress/{media_id}
     * Atualiza o progresso de desbloqueio de uma mídia
     */
    public function updateProgress(Request $request, $media_id)
    {
        $user = $request->user();
        $media = Media::findOrFail($media_id);

        $watchedYoutubeId = $request->input('watched_youtube_id');
        $totalRequired = $request->input('total_required', 3);

        // Buscar ou criar registro de progresso
        $progress = UserUnlockProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'target_media_id' => $media_id,
            ],
            [
                'watched_requirement_ids' => [],
                'progress_percentage' => 0,
                'started_at' => now(),
            ]
        );

        // Atualizar lista de vídeos assistidos
        $watchedIds = $progress->watched_requirement_ids ?? [];
        if ($watchedYoutubeId && !in_array($watchedYoutubeId, $watchedIds)) {
            $watchedIds[] = $watchedYoutubeId;
        }

        // Calcular novo progresso
        $progressPercentage = $totalRequired > 0 
            ? min(100, round((count($watchedIds) / $totalRequired) * 100))
            : 0;

        $progress->watched_requirement_ids = $watchedIds;
        $progress->progress_percentage = $progressPercentage;
        $progress->last_activity_at = now();
        $progress->save();

        // Se completou 100%, verificar e desbloquear
        if ($progressPercentage >= 100) {
            // Desbloquear a mídia se ainda não foi desbloqueada
            $alreadyUnlocked = DB::table('user_unlocked_media')
                ->where('user_id', $user->id)
                ->where('media_id', $media_id)
                ->exists();

            if (!$alreadyUnlocked) {
                DB::table('user_unlocked_media')->insert([
                    'user_id' => $user->id,
                    'media_id' => $media_id,
                    'unlocked_at' => now(),
                ]);

                // Deletar o progresso (não é mais necessário)
                $progress->delete();

                return response()->json([
                    'message' => 'Media unlocked successfully!',
                    'unlocked' => true,
                    'progress' => 100,
                ]);
            }
        }

        return response()->json([
            'message' => 'Progress updated',
            'unlocked' => false,
            'progress' => $progressPercentage,
            'watched_count' => count($watchedIds),
            'total_required' => $totalRequired,
        ]);
    }

    /**
     * POST /unlocks/start-progress/{media_id}
     * Inicia o rastreamento de progresso de desbloqueio de uma mídia
     */
    public function startProgress(Request $request, $media_id)
    {
        $user = $request->user();
        $media = Media::findOrFail($media_id);

        // Verificar se já está desbloqueada
        $alreadyUnlocked = DB::table('user_unlocked_media')
            ->where('user_id', $user->id)
            ->where('media_id', $media_id)
            ->exists();

        if ($alreadyUnlocked) {
            return response()->json([
                'message' => 'Media already unlocked',
                'started' => false,
            ]);
        }

        // Criar ou buscar registro de progresso
        $progress = UserUnlockProgress::firstOrCreate(
            [
                'user_id' => $user->id,
                'target_media_id' => $media_id,
            ],
            [
                'watched_requirement_ids' => [],
                'progress_percentage' => 0,
                'started_at' => now(),
                'last_activity_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Progress tracking started',
            'started' => true,
            'progress_id' => $progress->id,
            'media' => [
                'id' => $media->id,
                'title' => $media->title,
                'youtube_id' => $media->youtube_id,
            ],
        ]);
    }

    /**
     * DELETE /unlocks/progress/{media_id}
     * Remove o rastreamento de progresso de uma mídia
     */
    public function removeProgress(Request $request, $media_id)
    {
        $user = $request->user();

        $deleted = UserUnlockProgress::where('user_id', $user->id)
            ->where('target_media_id', $media_id)
            ->delete();

        return response()->json([
            'message' => $deleted ? 'Progress removed' : 'No progress found',
            'removed' => $deleted > 0,
        ]);
    }
}

