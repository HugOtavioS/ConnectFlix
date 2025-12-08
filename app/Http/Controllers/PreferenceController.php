<?php

namespace App\Http\Controllers;

use App\Models\UserPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PreferenceController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        $preferences = UserPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'favorite_categories' => [],
                'favorite_actors' => [],
            ]
        );

        return response()->json($preferences);
    }

    public function updateMe(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'favorite_categories' => 'sometimes|array',
            'favorite_categories.*' => 'integer|exists:categories,id',
            'favorite_actors' => 'sometimes|array',
            'favorite_actors.*' => 'integer|exists:actors,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $preferences = UserPreference::updateOrCreate(
            ['user_id' => $user->id],
            [
                'favorite_categories' => $request->favorite_categories ?? [],
                'favorite_actors' => $request->favorite_actors ?? [],
            ]
        );

        return response()->json([
            'message' => 'Preferences updated successfully',
            'preferences' => $preferences
        ]);
    }
}



