<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YouTubeService
{
    private $apiKey;
    private $baseUrl = 'https://www.googleapis.com/youtube/v3';

    public function __construct()
    {
        $this->apiKey = env('YOUTUBE_API_KEY', 'AIzaSyBzzA-ysxp6kvfydsBJlLvVSxfF_Pls2Fo');
    }

    /**
     * Mapear categorias para termos de busca no YouTube
     */
    private function getSearchQueryForCategory($categoryName): string
    {
        $categoryMap = [
            'Ação' => 'filmes de ação completos',
            'Comédia' => 'filmes de comédia completos',
            'Drama' => 'filmes de drama completos',
            'Terror' => 'filmes de terror completos',
            'Romance' => 'filmes de romance completos',
            'Ficção Científica' => 'filmes de ficção científica completos',
            'Sci-Fi' => 'filmes de ficção científica completos',
            'Animação' => 'filmes de animação completos',
            'Documentário' => 'documentários completos',
            'Suspense' => 'filmes de suspense completos',
            'Faroeste' => 'filmes de faroeste completos',
            'Musical' => 'filmes musicais completos',
            'Super-Herói' => 'filmes de super-herói completos',
        ];

        return $categoryMap[$categoryName] ?? $categoryName . ' filmes completos';
    }

    /**
     * Buscar vídeos do YouTube por categoria
     */
    public function searchVideosByCategory($categoryName, $maxResults = 5): array
    {
        $query = $this->getSearchQueryForCategory($categoryName);

        try {
            $response = Http::get($this->baseUrl . '/search', [
                'key' => $this->apiKey,
                'part' => 'snippet',
                'q' => $query,
                'maxResults' => $maxResults,
                'type' => 'video',
                'order' => 'viewCount',
                'videoDuration' => 'long',
                'regionCode' => 'BR',
                'relevanceLanguage' => 'pt',
            ]);

            if ($response->successful()) {
                $items = $response->json('items', []);
                
                return array_map(function ($item) {
                    return [
                        'youtube_id' => $item['id']['videoId'] ?? null,
                        'title' => $item['snippet']['title'] ?? '',
                        'description' => $item['snippet']['description'] ?? '',
                        'thumbnail' => $item['snippet']['thumbnails']['high']['url'] ?? '',
                        'channel_title' => $item['snippet']['channelTitle'] ?? '',
                        'published_at' => $item['snippet']['publishedAt'] ?? '',
                    ];
                }, $items);
            }

            Log::warning('YouTube API error: ' . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error('YouTube API exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Buscar vídeos do YouTube por múltiplas categorias
     * Retorna 2-4 vídeos por categoria
     */
    public function searchVideosByCategories(array $categoryNames, $maxResultsPerCategory = 3): array
    {
        $allVideos = [];
        
        // Buscar 2-4 vídeos por categoria (aleatório)
        foreach ($categoryNames as $categoryName) {
            $videosPerCategory = rand(2, 4);
            $videos = $this->searchVideosByCategory($categoryName, $videosPerCategory);
            $allVideos = array_merge($allVideos, $videos);
        }

        // Remover duplicatas baseado no youtube_id
        $uniqueVideos = [];
        $seenIds = [];

        foreach ($allVideos as $video) {
            if (!empty($video['youtube_id']) && !in_array($video['youtube_id'], $seenIds)) {
                $uniqueVideos[] = $video;
                $seenIds[] = $video['youtube_id'];
            }
        }

        // Limitar ao número máximo desejado (se especificado)
        if ($maxResultsPerCategory > 0) {
            return array_slice($uniqueVideos, 0, $maxResultsPerCategory);
        }
        
        return $uniqueVideos;
    }

    /**
     * Obter detalhes completos de um vídeo
     */
    public function getVideoDetails($videoId): ?array
    {
        try {
            $response = Http::get($this->baseUrl . '/videos', [
                'key' => $this->apiKey,
                'part' => 'snippet,statistics,contentDetails',
                'id' => $videoId,
            ]);

            if ($response->successful() && !empty($response->json('items'))) {
                $item = $response->json('items.0');
                
                return [
                    'youtube_id' => $item['id'],
                    'title' => $item['snippet']['title'] ?? '',
                    'description' => $item['snippet']['description'] ?? '',
                    'thumbnail' => $item['snippet']['thumbnails']['maxres']['url'] ?? $item['snippet']['thumbnails']['high']['url'] ?? '',
                    'channel_title' => $item['snippet']['channelTitle'] ?? '',
                    'published_at' => $item['snippet']['publishedAt'] ?? '',
                    'view_count' => $item['statistics']['viewCount'] ?? '0',
                    'duration' => $item['contentDetails']['duration'] ?? '',
                ];
            }

            return null;
        } catch (\Exception $e) {
            Log::error('YouTube API exception: ' . $e->getMessage());
            return null;
        }
    }
}

