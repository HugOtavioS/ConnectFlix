<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RankingController extends Controller
{
    public function national(Request $request)
    {
        $period = $request->query('period', 'week');
        $limit = (int) $request->query('limit', 100); // Aumentar limite para garantir que temos dados
        $sortBy = $request->query('sort_by', 'level'); // level, xp, cards, hours

        // Buscar todos os usuários com suas estatísticas
        $rankings = User::select('users.id', 'users.username', 'users.city', 'users.state', 'users.country', 'users.level', 'users.xp')
            ->selectRaw('COALESCE((SELECT COUNT(*) FROM user_collectibles WHERE user_collectibles.user_id = users.id), 0) as collectibles_count')
            ->selectRaw('COALESCE((SELECT total_seconds FROM user_watch_time WHERE user_watch_time.user_id = users.id), 0) as total_watch_time_seconds')
            ->get();

        // Se não houver usuários, retornar array vazio
        if ($rankings->isEmpty()) {
            return response()->json([]);
        }

        // Ordenar baseado no sort_by
        $rankings = $this->sortRankings($rankings, $sortBy);

        // Adicionar campos calculados
        $rankings = $rankings->map(function ($user) {
            $user->total_watch_time = round($user->total_watch_time_seconds / 3600, 2);
            $user->experience = $user->xp ?? 0;
            $user->collectibles_count = $user->collectibles_count ?? 0;
            $user->total_watch_time_seconds = $user->total_watch_time_seconds ?? 0;
            return $user;
        });

        // Limitar após ordenação
        return response()->json($rankings->take($limit)->values());
    }

    private function sortRankings($rankings, $sortBy)
    {
        return $rankings->sort(function ($a, $b) use ($sortBy) {
            switch ($sortBy) {
                case 'xp':
                    return $b->xp <=> $a->xp;
                case 'cards':
                    return $b->collectibles_count <=> $a->collectibles_count;
                case 'hours':
                    return $b->total_watch_time_seconds <=> $a->total_watch_time_seconds;
                case 'level':
                default:
                    return $b->level <=> $a->level;
            }
        })->values();
    }

    public function state(Request $request)
    {
        $state = $request->query('state');
        $period = $request->query('period', 'week');
        $limit = (int) $request->query('limit', 10);

        if (!$state) {
            return response()->json([
                'message' => 'State parameter is required'
            ], 422);
        }

        $startDate = $this->getStartDate($period);

        $rankings = User::select('users.id', 'users.username', 'users.city', 'users.state', 'users.country', 'users.level', 'users.xp')
            ->selectRaw('COALESCE(SUM(user_activities.duration_seconds), 0) as total_duration')
            ->leftJoin('user_activities', function ($join) use ($startDate) {
                $join->on('users.id', '=', 'user_activities.user_id')
                     ->where('user_activities.timestamp', '>=', $startDate);
            })
            ->where('users.state', $state)
            ->groupBy('users.id', 'users.username', 'users.city', 'users.state', 'users.country', 'users.level', 'users.xp')
            ->orderBy('total_duration', 'desc')
            ->orderBy('users.xp', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($rankings);
    }

    public function regional(Request $request)
    {
        $city = $request->query('city');
        $period = $request->query('period', 'week');
        $limit = (int) $request->query('limit', 10);

        if (!$city) {
            return response()->json([
                'message' => 'City parameter is required'
            ], 422);
        }

        $startDate = $this->getStartDate($period);

        $rankings = User::select('users.id', 'users.username', 'users.city', 'users.state', 'users.country', 'users.level', 'users.xp')
            ->selectRaw('COALESCE(SUM(user_activities.duration_seconds), 0) as total_duration')
            ->leftJoin('user_activities', function ($join) use ($startDate) {
                $join->on('users.id', '=', 'user_activities.user_id')
                     ->where('user_activities.timestamp', '>=', $startDate);
            })
            ->where('users.city', $city)
            ->groupBy('users.id', 'users.username', 'users.city', 'users.state', 'users.country', 'users.level', 'users.xp')
            ->orderBy('total_duration', 'desc')
            ->orderBy('users.xp', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($rankings);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        // National ranking
        $nationalRank = $this->getUserRank($user->id, null, null);
        
        // State ranking
        $stateRank = $this->getUserRank($user->id, $user->state, null);
        
        // Regional ranking
        $regionalRank = $this->getUserRank($user->id, $user->state, $user->city);

        return response()->json([
            'national_rank' => $nationalRank,
            'state_rank' => $stateRank,
            'regional_rank' => $regionalRank,
        ]);
    }

    private function getUserRank($userId, $state = null, $city = null)
    {
        $query = User::select('users.id')
            ->selectRaw('COALESCE(SUM(user_activities.duration_seconds), 0) as total_duration')
            ->leftJoin('user_activities', 'users.id', '=', 'user_activities.user_id')
            ->groupBy('users.id')
            ->orderBy('total_duration', 'desc')
            ->orderBy('users.xp', 'desc');

        if ($city) {
            $query->where('users.city', $city);
        } elseif ($state) {
            $query->where('users.state', $state);
        }

        $users = $query->get();
        $rank = $users->search(function ($user) use ($userId) {
            return $user->id == $userId;
        });

        return $rank !== false ? $rank + 1 : null;
    }

    private function getStartDate($period)
    {
        return match ($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'all' => now()->subYears(100), // Very old date to get all
            default => now()->subWeek(),
        };
    }
}



