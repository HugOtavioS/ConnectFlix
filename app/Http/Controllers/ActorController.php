<?php

namespace App\Http\Controllers;

use App\Models\Actor;
use Illuminate\Http\Request;

class ActorController extends Controller
{
    public function index(Request $request)
    {
        $query = Actor::query();

        if ($request->has('query')) {
            $query->where('name', 'like', "%{$request->query('query')}%");
        }

        $actors = $query->get();
        
        return response()->json($actors);
    }
}

