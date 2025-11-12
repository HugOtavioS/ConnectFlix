<?php

namespace App\Http\Controllers;

use App\Models\UserConnection;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConnectionController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        
        $connections = UserConnection::where(function ($query) use ($user) {
            $query->where('user_id1', $user->id)
                  ->orWhere('user_id2', $user->id);
        })
        ->where('status', 'accepted')
        ->with(['user1', 'user2'])
        ->get()
        ->map(function ($connection) use ($user) {
            $otherUser = $connection->user_id1 == $user->id ? $connection->user2 : $connection->user1;
            return [
                'id' => $connection->id,
                'user' => $otherUser,
                'status' => $connection->status,
                'created_at' => $connection->created_at,
            ];
        });

        return response()->json($connections);
    }

    public function pending(Request $request)
    {
        $user = $request->user();
        
        $connections = UserConnection::where('user_id2', $user->id)
            ->where('status', 'pending')
            ->with('user1')
            ->get()
            ->map(function ($connection) {
                return [
                    'id' => $connection->id,
                    'user' => $connection->user1,
                    'status' => $connection->status,
                    'created_at' => $connection->created_at,
                ];
            });

        return response()->json($connections);
    }

    public function request($user_id)
    {
        $user = request()->user();
        
        if ($user->id == $user_id) {
            return response()->json([
                'message' => 'Cannot send connection request to yourself'
            ], 422);
        }

        $targetUser = User::findOrFail($user_id);

        // Check if connection already exists
        $existing = UserConnection::where(function ($query) use ($user, $user_id) {
            $query->where('user_id1', $user->id)
                  ->where('user_id2', $user_id)
                  ->orWhere(function ($q) use ($user, $user_id) {
                      $q->where('user_id1', $user_id)
                        ->where('user_id2', $user->id);
                  });
        })->first();

        if ($existing) {
            return response()->json([
                'message' => 'Connection already exists'
            ], 422);
        }

        $connection = UserConnection::create([
            'user_id1' => $user->id,
            'user_id2' => $user_id,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Connection request sent',
            'connection' => $connection->load('user2')
        ], 201);
    }

    public function accept($connection_id)
    {
        $user = request()->user();
        
        $connection = UserConnection::where('id', $connection_id)
            ->where('user_id2', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $connection->update(['status' => 'accepted']);

        return response()->json([
            'message' => 'Connection accepted',
            'connection' => $connection->load(['user1', 'user2'])
        ]);
    }

    public function reject($connection_id)
    {
        $user = request()->user();
        
        $connection = UserConnection::where('id', $connection_id)
            ->where('user_id2', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $connection->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Connection rejected'
        ]);
    }

    public function destroy($connection_id)
    {
        $user = request()->user();
        
        $connection = UserConnection::where('id', $connection_id)
            ->where(function ($query) use ($user) {
                $query->where('user_id1', $user->id)
                      ->orWhere('user_id2', $user->id);
            })
            ->firstOrFail();

        $connection->delete();

        return response()->json([
            'message' => 'Connection removed'
        ]);
    }

    public function sharedInterests($user_id)
    {
        $user = request()->user();
        $targetUser = User::findOrFail($user_id);

        $userPrefs = UserPreference::where('user_id', $user->id)->first();
        $targetPrefs = UserPreference::where('user_id', $user_id)->first();

        $sharedCategories = [];
        $sharedActors = [];

        if ($userPrefs && $targetPrefs) {
            $sharedCategories = array_intersect(
                $userPrefs->favorite_categories ?? [],
                $targetPrefs->favorite_categories ?? []
            );
            
            $sharedActors = array_intersect(
                $userPrefs->favorite_actors ?? [],
                $targetPrefs->favorite_actors ?? []
            );
        }

        return response()->json([
            'shared_categories' => array_values($sharedCategories),
            'shared_actors' => array_values($sharedActors),
        ]);
    }
}


