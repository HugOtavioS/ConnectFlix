<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ActivityController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'media_id' => 'nullable|exists:media,id',
            'activity_type' => 'required|in:watch,stay',
            'duration_seconds' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $activity = UserActivity::create([
            'user_id' => $user->id,
            'media_id' => $request->media_id,
            'activity_type' => $request->activity_type,
            'duration_seconds' => $request->duration_seconds,
            'timestamp' => now(),
        ]);

        return response()->json([
            'message' => 'Activity recorded successfully',
            'activity' => $activity
        ], 201);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $type = $request->query('type');

        $query = UserActivity::where('user_id', $user->id);

        if ($type) {
            $query->where('activity_type', $type);
        }

        $activities = $query->with('media')->orderBy('timestamp', 'desc')->paginate(20);

        return response()->json($activities);
    }
}


