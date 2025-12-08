<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserConnection;
use App\Models\UserWatchTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('preferences');
        
        // Obter tempo total assistido da tabela dedicada
        $watchTime = UserWatchTime::getOrCreateForUser($user->id);
        $totalWatchTimeSeconds = $watchTime->total_seconds;
        $totalWatchTimeHours = round($totalWatchTimeSeconds / 3600, 2);
        
        // Calcular estatísticas
        $collectiblesCount = $user->collectibles()->count();
        $mediaWatched = $user->activities()
            ->where('activity_type', 'watch')
            ->whereNotNull('media_id')
            ->distinct('media_id')
            ->count('media_id');
        
        $connectionsCount = $user->connectionsAsUser1()
            ->where('status', 'accepted')
            ->count() + $user->connectionsAsUser2()
            ->where('status', 'accepted')
            ->count();
        
        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'city' => $user->city,
            'state' => $user->state,
            'country' => $user->country,
            'level' => $user->level ?? 1,
            'xp' => $user->xp ?? 0,
            'collectibles_count' => $collectiblesCount,
            'media_watched' => $mediaWatched,
            'total_watch_time' => $totalWatchTimeHours,
            'total_watch_time_seconds' => $totalWatchTimeSeconds,
            'connections_count' => $connectionsCount,
            'preferences' => $user->preferences,
        ]);
    }

    public function updateMe(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|string|max:50|unique:users,username,' . $user->id,
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['username', 'city', 'state', 'country']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function show($user_id)
    {
        $user = User::findOrFail($user_id);
        
        // Calcular estatísticas
        $collectiblesCount = $user->collectibles()->count();
        $mediaWatched = $user->activities()
            ->where('activity_type', 'watch')
            ->whereNotNull('media_id')
            ->distinct('media_id')
            ->count('media_id');
        
        // Obter tempo total assistido da tabela dedicada
        $watchTime = UserWatchTime::getOrCreateForUser($user->id);
        $totalWatchTimeSeconds = $watchTime->total_seconds;
        $totalWatchTimeHours = round($totalWatchTimeSeconds / 3600, 2);
        
        $connectionsCount = $user->connectionsAsUser1()
            ->where('status', 'accepted')
            ->count() + $user->connectionsAsUser2()
            ->where('status', 'accepted')
            ->count();
        
        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->username, // Alias para compatibilidade
            'city' => $user->city,
            'state' => $user->state,
            'country' => $user->country,
            'level' => $user->level ?? 1,
            'xp' => $user->xp ?? 0,
            'collectibles_count' => $collectiblesCount,
            'media_watched' => $mediaWatched,
            'total_watch_time' => $totalWatchTimeHours,
            'total_watch_time_seconds' => $totalWatchTimeSeconds,
            'connections_count' => $connectionsCount,
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->query('q') ?? $request->query('query');
        
        if (!$query) {
            return response()->json([
                'message' => 'Query parameter (q) is required'
            ], 422);
        }

        $users = User::where('username', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            // ->select('id', 'username', 'city', 'state', 'country', 'level', 'xp')
            ->get();

        return response()->json($users);
    }

    /**
     * Busca avançada de usuários com filtros
     * GET /users/search/advanced
     */
    public function searchAdvanced(Request $request)
    {
        $query = User::query();

        // Busca por texto (username ou email)
        if ($request->has('q') || $request->has('query')) {
            $searchTerm = $request->query('q') ?? $request->query('query');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('username', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }

        // Filtros por região
        if ($request->has('city')) {
            $query->where('city', 'like', "%{$request->city}%");
        }

        if ($request->has('state')) {
            $query->where('state', 'like', "%{$request->state}%");
        }

        if ($request->has('country')) {
            $query->where('country', 'like', "%{$request->country}%");
        }

        // Filtros por level
        if ($request->has('min_level')) {
            $query->where('level', '>=', $request->min_level);
        }

        if ($request->has('max_level')) {
            $query->where('level', '<=', $request->max_level);
        }

        // Filtros por XP
        if ($request->has('min_xp')) {
            $query->where('xp', '>=', $request->min_xp);
        }

        if ($request->has('max_xp')) {
            $query->where('xp', '<=', $request->max_xp);
        }

        // Ordenação
        $orderBy = $request->query('order_by', 'username');
        $orderDir = $request->query('order_dir', 'asc');

        $allowedOrderBy = ['username', 'level', 'xp', 'created_at'];
        if (in_array($orderBy, $allowedOrderBy)) {
            $query->orderBy($orderBy, $orderDir);
        }

        // Paginação
        $limit = $request->query('limit', 20);
        $page = $request->query('page', 1);

        $users = $query->select('id', 'username', 'city', 'state', 'country', 'level', 'xp', 'created_at')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json($users);
    }

    /**
     * Verificar status de conexão com outro usuário
     * GET /users/{user_id}/connection-status
     */
    public function connectionStatus(Request $request, $user_id)
    {
        $user = $request->user();
        $targetUser = User::findOrFail($user_id);

        if ($user->id == $user_id) {
            return response()->json([
                'status' => 'self',
                'message' => 'Cannot connect to yourself'
            ]);
        }

        $connection = UserConnection::where(function ($query) use ($user, $user_id) {
            $query->where('user_id1', $user->id)
                  ->where('user_id2', $user_id)
                  ->orWhere(function ($q) use ($user, $user_id) {
                      $q->where('user_id1', $user_id)
                        ->where('user_id2', $user->id);
                  });
        })->first();

        if (!$connection) {
            return response()->json([
                'status' => 'none',
                'can_request' => true
            ]);
        }

        if ($connection->status === 'pending') {
            if ($connection->user_id1 == $user->id) {
                return response()->json([
                    'status' => 'pending_sent',
                    'can_request' => false,
                    'connection_id' => $connection->id
                ]);
            } else {
                return response()->json([
                    'status' => 'pending_received',
                    'can_request' => false,
                    'connection_id' => $connection->id
                ]);
            }
        }

        if ($connection->status === 'accepted') {
            return response()->json([
                'status' => 'connected',
                'can_request' => false,
                'connection_id' => $connection->id
            ]);
        }

        return response()->json([
            'status' => 'none',
            'can_request' => true
        ]);
    }
}



