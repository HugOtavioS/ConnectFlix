<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('preferences');
        
        return response()->json($user);
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
        
        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'city' => $user->city,
            'state' => $user->state,
            'country' => $user->country,
            'level' => $user->level,
            'xp' => $user->xp,
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
            ->select('id', 'username', 'city', 'state', 'country', 'level', 'xp')
            ->get();

        return response()->json($users);
    }
}


