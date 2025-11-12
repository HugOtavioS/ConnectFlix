<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->query('query');
        $type = $request->query('type', 'all');

        if (!$query) {
            return response()->json([
                'message' => 'Query parameter is required'
            ], 422);
        }

        $results = [];

        if ($type === 'media' || $type === 'all') {
            $media = Media::where('title', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->with(['categories', 'actors'])
                ->get();
            
            $results['media'] = $media;
        }

        if ($type === 'users' || $type === 'all') {
            $users = User::where('username', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->select('id', 'username', 'city', 'state', 'country', 'level', 'xp')
                ->get();
            
            $results['users'] = $users;
        }

        return response()->json($results);
    }
}

