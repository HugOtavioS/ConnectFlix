<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use App\Models\User;
use App\Models\UserWatchTime;
use App\Models\MediaUnlockRequirement;
use App\Services\ActivityService;
use App\Services\XPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    protected $xpService;

    public function __construct(XPService $xpService)
    {
        $this->xpService = $xpService;
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'media_id' => 'nullable|exists:media,id',
            'activity_type' => 'required|in:watch,stay',
            'duration_seconds' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $newDuration = $request->duration_seconds;

        // Se houver media_id, verificar e limpar registros inconsistentes
        if ($request->media_id) {
            // Buscar a última atividade deste vídeo para este usuário
            $lastActivity = UserActivity::where('user_id', $user->id)
                ->where('media_id', $request->media_id)
                ->where('activity_type', 'watch')
                ->orderBy('timestamp', 'desc')
                ->first();

            // Se a nova duração for menor que a última, apagar todos os registros com duração maior
            if ($lastActivity && $newDuration < $lastActivity->duration_seconds) {
                UserActivity::where('user_id', $user->id)
                    ->where('media_id', $request->media_id)
                    ->where('activity_type', 'watch')
                    ->where('duration_seconds', '>', $newDuration)
                    ->delete();
            }
        }

        // Calcular e adicionar XP baseado em tempo assistido (ANTES de criar a atividade)
        $xpGained = 0;
        if ($request->activity_type === 'watch' && $request->duration_seconds > 0) {
            // Obter ou criar registro de tempo assistido do usuário
            $watchTime = UserWatchTime::getOrCreateForUser($user->id);
            
            // Buscar a última atividade deste vídeo para calcular apenas o incremento
            $lastActivity = null;
            if ($request->media_id) {
                $lastActivity = UserActivity::where('user_id', $user->id)
                    ->where('media_id', $request->media_id)
                    ->where('activity_type', 'watch')
                    ->orderBy('timestamp', 'desc')
                    ->first();
            }
            
            // Calcular apenas o tempo incrementado desde a última atividade
            $incrementalSeconds = $request->duration_seconds;
            if ($lastActivity && $lastActivity->duration_seconds < $request->duration_seconds) {
                // Apenas o tempo adicional desde a última atividade
                $incrementalSeconds = $request->duration_seconds - $lastActivity->duration_seconds;
            } elseif ($lastActivity && $lastActivity->duration_seconds >= $request->duration_seconds) {
                // Se o tempo atual é menor ou igual, não há incremento (usuário voltou no vídeo)
                $incrementalSeconds = 0;
            }
            
            // Só processa se houver incremento positivo
            if ($incrementalSeconds > 0) {
                // Calcular tempo total assistido ANTES desta atividade (em minutos)
                $totalWatchTimeMinutes = floor($watchTime->total_seconds / 60);
                
                // Calcular minutos assistidos nesta sessão (apenas o incremento)
                $minutesAssisted = $incrementalSeconds / 60;
                
                // Calcular XP ganho baseado no tempo total ANTES desta sessão
                // Passar minutos decimais para cálculo proporcional
                $xpGained = $this->xpService->calculateWatchTimeXPFromSeconds($incrementalSeconds, $totalWatchTimeMinutes);
                
                // Adicionar XP ao usuário
                $this->xpService->addXP($user->fresh(), $xpGained);
                
                // Incrementar apenas o tempo adicional na tabela dedicada
                $watchTime->addSeconds($incrementalSeconds);
            }
        }

        $activity = UserActivity::create([
            'user_id' => $user->id,
            'media_id' => $request->media_id,
            'activity_type' => $request->activity_type,
            'duration_seconds' => $request->duration_seconds,
            'timestamp' => now(),
        ]);

        // Verificar se esta mídia assistida desbloqueia outras mídias
        if ($request->activity_type === 'watch' && $request->media_id) {
            $this->checkUnlockRequirements($user->id, $request->media_id);
        }

        return response()->json([
            'message' => 'Activity recorded successfully',
            'activity' => $activity,
            'xp_gained' => $xpGained ?? 0
        ], 201);
    }

    /**
     * Verifica se uma mídia assistida desbloqueia outras mídias
     * Agora verifica por categorias compartilhadas (sistema baseado em YouTube)
     */
    private function checkUnlockRequirements($userId, $watchedMediaId)
    {
        // Buscar a mídia assistida e suas categorias
        $watchedMedia = Media::with('categories')->find($watchedMediaId);
        
        if (!$watchedMedia || $watchedMedia->categories->isEmpty()) {
            return;
        }

        $watchedCategoryIds = $watchedMedia->categories->pluck('id')->toArray();

        // Buscar todas as mídias bloqueadas que compartilham categorias com a mídia assistida
        $targetMedias = DB::table('media')
            ->join('media_categories', 'media.id', '=', 'media_categories.media_id')
            ->whereIn('media_categories.category_id', $watchedCategoryIds)
            ->whereNotIn('media.id', function ($query) use ($userId) {
                $query->select('media_id')
                    ->from('user_unlocked_media')
                    ->where('user_id', $userId);
            })
            ->distinct()
            ->pluck('media.id')
            ->toArray();

        foreach ($targetMedias as $targetMediaId) {
            // Verificar se o usuário assistiu vídeos suficientes com as mesmas categorias
            $targetMedia = Media::with('categories')->find($targetMediaId);
            
            if (!$targetMedia) continue;

            $targetCategoryIds = $targetMedia->categories->pluck('id')->toArray();
            
            // Verificar quantos vídeos com essas categorias o usuário assistiu
            $watchedMediaIds = DB::table('user_activities')
                ->join('media', 'user_activities.media_id', '=', 'media.id')
                ->join('media_categories', 'media.id', '=', 'media_categories.media_id')
                ->where('user_activities.user_id', $userId)
                ->where('user_activities.activity_type', 'watch')
                ->whereIn('media_categories.category_id', $targetCategoryIds)
                ->whereNotNull('media.youtube_id')
                ->distinct()
                ->pluck('media.id')
                ->toArray();

            // Se assistiu pelo menos 3 vídeos com essas categorias, desbloquear
            if (count($watchedMediaIds) >= 3) {
                // Verificar se já não está desbloqueado
                $alreadyUnlocked = DB::table('user_unlocked_media')
                    ->where('user_id', $userId)
                    ->where('media_id', $targetMediaId)
                    ->exists();

                if (!$alreadyUnlocked) {
                    // Desbloquear automaticamente
                    DB::table('user_unlocked_media')->insert([
                        'user_id' => $userId,
                        'media_id' => $targetMediaId,
                        'unlocked_at' => now(),
                    ]);
                }
            }
        }
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $type = $request->query('type');

        $query = UserActivity::where('user_id', $user->id)
            ->whereNotNull('media_id');

        if ($type) {
            $query->where('activity_type', $type);
        }

        // Buscar todas as atividades e agrupar por media_id, pegando apenas a mais recente de cada mídia
        $allActivities = $query
            ->with('media')
            ->orderBy('timestamp', 'desc')
            ->get();

        // Agrupar por media_id e pegar apenas a mais recente de cada mídia
        $uniqueActivities = $allActivities
            ->groupBy('media_id')
            ->map(function ($group) {
                return $group->first(); // Pega a primeira (mais recente devido ao orderBy)
            })
            ->take(20)
            ->values();

        return response()->json([
            'data' => $uniqueActivities,
            'total' => $uniqueActivities->count(),
        ]);
    }

    /**
     * GET /activities/stats/me
     * Retorna estatísticas de atividade do usuário logado
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        // Usar a tabela user_watch_time para tempo total (mais preciso)
        $watchTime = UserWatchTime::getOrCreateForUser($user->id);
        $totalWatchTimeSeconds = $watchTime->total_seconds;
        
        // Contar mídias únicas assistidas
        $mediaWatched = UserActivity::where('user_id', $user->id)
            ->where('activity_type', 'watch')
            ->whereNotNull('media_id')
            ->distinct('media_id')
            ->count('media_id');
        
        // Contar total de atividades (sem duplicatas por mídia no mesmo timestamp)
        $totalActivities = UserActivity::where('user_id', $user->id)
            ->where('activity_type', 'watch')
            ->whereNotNull('media_id')
            ->distinct('media_id', 'timestamp')
            ->count();
        
        $stats = [
            'total_watch_time_seconds' => $totalWatchTimeSeconds,
            'total_watch_time_hours' => round($totalWatchTimeSeconds / 3600, 2),
            'media_watched' => $mediaWatched,
            'total_activities' => $totalActivities,
        ];

        return response()->json([
            'message' => 'User activity statistics',
            'stats' => $stats
        ]);
    }

    /**
     * GET /activities/top-media/me
     * Retorna mídias mais assistidas pelo usuário
     */
    public function topMedia(Request $request)
    {
        $user = $request->user();
        $limit = $request->query('limit', 10);

        $topMedia = UserActivity::where('user_id', $user->id)
            ->where('activity_type', 'watch')
            ->whereNotNull('media_id')
            ->select('media_id', DB::raw('SUM(duration_seconds) as total_time'), DB::raw('COUNT(*) as watch_count'))
            ->groupBy('media_id')
            ->orderBy('total_time', 'desc')
            ->with('media')
            ->limit($limit)
            ->get();

        return response()->json([
            'message' => 'Top watched media',
            'media' => $topMedia
        ]);
    }

    /**
     * GET /activities/by-period/me
     * Retorna atividades em período específico
     */
    public function byPeriod(Request $request)
    {
        $user = $request->user();
        $period = $request->query('period', 'week'); // day, week, month, year
        $type = $request->query('type'); // watch, stay

        $dateFrom = match($period) {
            'day' => now()->subDay(),
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'year' => now()->subYear(),
            default => now()->subWeek(),
        };

        $query = UserActivity::where('user_id', $user->id)
            ->where('timestamp', '>=', $dateFrom);

        if ($type) {
            $query->where('activity_type', $type);
        }

        $activities = $query->orderBy('timestamp', 'desc')->get();

        return response()->json([
            'message' => 'Activities by period',
            'period' => $period,
            'type' => $type,
            'count' => $activities->count(),
            'activities' => $activities->load('media')
        ]);
    }

    /**
     * GET /activities/last-watch/{media_id}
     * Retorna a última atividade de watch de um vídeo específico
     */
    public function lastWatch(Request $request, $media_id)
    {
        $user = $request->user();

        $lastActivity = UserActivity::where('user_id', $user->id)
            ->where('media_id', $media_id)
            ->where('activity_type', 'watch')
            ->orderBy('timestamp', 'desc')
            ->first();

        if (!$lastActivity) {
            return response()->json([
                'message' => 'No watch activity found',
                'duration_seconds' => 0
            ]);
        }

        return response()->json([
            'message' => 'Last watch activity found',
            'activity' => $lastActivity,
            'duration_seconds' => $lastActivity->duration_seconds
        ]);
    }

    /**
     * GET /activities/continue-watching
     * Retorna mídias que o usuário começou a assistir (tem atividades registradas)
     */
    public function continueWatching(Request $request)
    {
        $user = $request->user();
        $limit = $request->query('limit', 10);

        // Buscar mídias únicas que têm atividades de watch
        $mediaIds = UserActivity::where('user_id', $user->id)
            ->where('activity_type', 'watch')
            ->whereNotNull('media_id')
            ->distinct()
            ->pluck('media_id')
            ->take($limit);

        // Buscar a última atividade de cada mídia
        $continueWatching = [];
        foreach ($mediaIds as $mediaId) {
            $lastActivity = UserActivity::where('user_id', $user->id)
                ->where('media_id', $mediaId)
                ->where('activity_type', 'watch')
                ->orderBy('timestamp', 'desc')
                ->first();

            if ($lastActivity && $lastActivity->media) {
                $continueWatching[] = [
                    'media' => $lastActivity->media,
                    'last_watch' => [
                        'duration_seconds' => $lastActivity->duration_seconds,
                        'timestamp' => $lastActivity->timestamp,
                    ]
                ];
            }
        }

        // Ordenar por timestamp mais recente
        usort($continueWatching, function($a, $b) {
            return strtotime($b['last_watch']['timestamp']) - strtotime($a['last_watch']['timestamp']);
        });

        return response()->json([
            'message' => 'Continue watching media',
            'count' => count($continueWatching),
            'media' => array_slice($continueWatching, 0, $limit)
        ]);
    }
}




