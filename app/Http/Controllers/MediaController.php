<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Category;
use App\Models\Actor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::with(['categories', 'actors']);

        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        if ($request->has('actor_id')) {
            $query->whereHas('actors', function ($q) use ($request) {
                $q->where('actors.id', $request->actor_id);
            });
        }

        $media = $query->paginate(20);

        return response()->json($media);
    }

    public function show($media_id)
    {
        $media = Media::with(['categories', 'actors'])->findOrFail($media_id);
        
        return response()->json($media);
    }

    public function search(Request $request)
    {
        $query = $request->query('q') ?? $request->query('query');
        
        if (!$query) {
            return response()->json([
                'message' => 'Query parameter (q) is required'
            ], 422);
        }

        $media = Media::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->with(['categories', 'actors'])
            ->get();

        return response()->json($media);
    }

    public function categories($media_id)
    {
        $media = Media::findOrFail($media_id);
        $categories = $media->categories;
        
        return response()->json($categories);
    }

    public function actors($media_id)
    {
        $media = Media::findOrFail($media_id);
        $actors = $media->actors;
        
        return response()->json($actors);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|in:movie,series',
            'description' => 'nullable|string',
            'year' => 'nullable|integer',
            'duration' => 'nullable|integer',
            'rating' => 'nullable|numeric|min:0|max:10',
            'poster_url' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $media = Media::create($request->all());

        return response()->json([
            'message' => 'Media created successfully',
            'media' => $media
        ], 201);
    }

    public function update(Request $request, $media_id)
    {
        $media = Media::findOrFail($media_id);
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:movie,series',
            'description' => 'nullable|string',
            'year' => 'nullable|integer',
            'duration' => 'nullable|integer',
            'rating' => 'nullable|numeric|min:0|max:10',
            'poster_url' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $media->update($request->all());

        return response()->json([
            'message' => 'Media updated successfully',
            'media' => $media
        ]);
    }

    public function destroy($media_id)
    {
        $media = Media::findOrFail($media_id);
        $media->delete();

        return response()->json([
            'message' => 'Media deleted successfully'
        ]);
    }
}


