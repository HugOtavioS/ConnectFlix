<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ActorController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\CollectibleController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\UnlockController;
use App\Http\Controllers\RadioController;
use App\Http\Controllers\SearchController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/actors', [ActorController::class, 'index']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // User routes
    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'updateMe']);
    Route::get('/users/{user_id}', [UserController::class, 'show']);
    Route::get('/users/search', [UserController::class, 'search']);
    
    // Preferences routes
    Route::get('/preferences/me', [PreferenceController::class, 'me']);
    Route::put('/preferences/me', [PreferenceController::class, 'updateMe']);
    
    // Media routes
    Route::get('/media', [MediaController::class, 'index']);
    Route::get('/media/search', [MediaController::class, 'search']);
    Route::get('/media/{media_id}', [MediaController::class, 'show']);
    Route::get('/media/{media_id}/categories', [MediaController::class, 'categories']);
    Route::get('/media/{media_id}/actors', [MediaController::class, 'actors']);
    
    // Recommendations routes
    Route::get('/recommendations/roulette', [RecommendationController::class, 'roulette']);
    Route::get('/recommendations/similar/{media_id}', [RecommendationController::class, 'similar']);
    
    // Collectibles routes
    Route::get('/collectibles/me', [CollectibleController::class, 'me']);
    Route::post('/collectibles', [CollectibleController::class, 'store']);
    Route::get('/collectibles/{collectible_id}', [CollectibleController::class, 'show']);
    
    // Activities routes
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::get('/activities/me', [ActivityController::class, 'me']);
    
    // Rankings routes
    Route::get('/rankings/national', [RankingController::class, 'national']);
    Route::get('/rankings/state', [RankingController::class, 'state']);
    Route::get('/rankings/regional', [RankingController::class, 'regional']);
    Route::get('/rankings/me', [RankingController::class, 'me']);
    
    // Connections routes
    Route::get('/connections/me', [ConnectionController::class, 'me']);
    Route::get('/connections/pending', [ConnectionController::class, 'pending']);
    Route::post('/connections/request/{user_id}', [ConnectionController::class, 'request']);
    Route::put('/connections/accept/{connection_id}', [ConnectionController::class, 'accept']);
    Route::put('/connections/reject/{connection_id}', [ConnectionController::class, 'reject']);
    Route::delete('/connections/{connection_id}', [ConnectionController::class, 'destroy']);
    Route::get('/connections/shared-interests/{user_id}', [ConnectionController::class, 'sharedInterests']);
    
    // Unlocks routes
    Route::get('/unlocks/me', [UnlockController::class, 'me']);
    Route::post('/unlocks/check/{media_id}', [UnlockController::class, 'check']);
    
    // Radios routes
    Route::get('/radios', [RadioController::class, 'index']);
    Route::get('/radios/{radio_id}', [RadioController::class, 'show']);
    
    // Search routes
    Route::get('/search', [SearchController::class, 'search']);
    
    // Admin routes (require admin role)
    Route::middleware('admin')->group(function () {
        Route::post('/media', [MediaController::class, 'store']);
        Route::put('/media/{media_id}', [MediaController::class, 'update']);
        Route::delete('/media/{media_id}', [MediaController::class, 'destroy']);
        Route::post('/radios', [RadioController::class, 'store']);
        Route::put('/radios/{radio_id}', [RadioController::class, 'update']);
    });
});

