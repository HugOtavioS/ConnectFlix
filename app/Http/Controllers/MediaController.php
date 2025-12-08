<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Category;
use App\Models\Actor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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
        
        // Buscar mídias similares (mesma categoria)
        $similarMedia = [];
        if ($media->categories->isNotEmpty()) {
            $categoryIds = $media->categories->pluck('id');
            $similarMedia = Media::whereHas('categories', function ($q) use ($categoryIds) {
                $q->whereIn('categories.id', $categoryIds);
            })
            ->where('id', '!=', $media->id)
            ->with(['categories'])
            ->limit(6)
            ->get();
        }
        
        return response()->json([
            'media' => $media,
            'similar' => $similarMedia,
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

    /**
     * Buscar ou criar mídia baseada no YouTube ID
     * POST /media/find-or-create
     */
    public function findOrCreateByYoutubeId(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'youtube_id' => 'required|string|max:50',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'poster_url' => 'nullable|url|max:500',
            'type' => 'nullable|in:movie,series',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $youtubeId = $request->youtube_id;

        // Buscar mídia existente pelo youtube_id
        $media = Media::where('youtube_id', $youtubeId)->first();

        if ($media) {
            return response()->json([
                'message' => 'Media found',
                'media' => $media->load(['categories', 'actors']),
                'created' => false
            ]);
        }

        // Criar nova mídia se não existir
        $mediaData = [
            'youtube_id' => $youtubeId,
            'title' => $request->title ?? 'Vídeo do YouTube',
            'type' => $request->type ?? 'movie',
            'description' => $request->description,
            'poster_url' => $request->poster_url,
        ];

        $media = Media::create($mediaData);

        return response()->json([
            'message' => 'Media created successfully',
            'media' => $media->load(['categories', 'actors']),
            'created' => true
        ], 201);
    }

    /**
     * GET /media/explorer
     * Retorna mídias com status de desbloqueio para o explorador
     */
    public function explorer(Request $request)
    {
        $user = $request->user();
        $query = Media::with(['categories', 'actors']);

        // Filtros
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        if ($request->has('category_name')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.name', 'like', "%{$request->category_name}%");
            });
        }

        // Ordenação
        $orderBy = $request->query('order_by', 'created_at');
        $orderDir = $request->query('order_dir', 'desc');
        
        if ($orderBy === 'rating') {
            $query->orderBy('rating', $orderDir);
        } elseif ($orderBy === 'title') {
            $query->orderBy('title', $orderDir);
        } else {
            $query->orderBy('created_at', $orderDir);
        }

        $limit = $request->query('limit', 24);
        $media = $query->limit($limit)->get();

        // Verificar quais mídias estão desbloqueadas
        $unlockedMediaIds = [];
        if ($user) {
            $unlockedMediaIds = DB::table('user_unlocked_media')
                ->where('user_id', $user->id)
                ->pluck('media_id')
                ->toArray();
        }

        // Adicionar status de desbloqueio
        $mediaWithUnlockStatus = $media->map(function ($item) use ($unlockedMediaIds) {
            $item->is_unlocked = in_array($item->id, $unlockedMediaIds);
            return $item;
        });

        return response()->json([
            'media' => $mediaWithUnlockStatus,
            'total' => $mediaWithUnlockStatus->count()
        ]);
    }
}



