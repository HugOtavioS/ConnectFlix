<?php

namespace App\Http\Controllers;

use App\Models\Radio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RadioController extends Controller
{
    public function index()
    {
        $radios = Radio::all();
        
        return response()->json($radios);
    }

    public function show($radio_id)
    {
        $radio = Radio::findOrFail($radio_id);
        
        return response()->json($radio);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'stream_url' => 'required|url|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $radio = Radio::create($request->all());

        return response()->json([
            'message' => 'Radio created successfully',
            'radio' => $radio
        ], 201);
    }

    public function update(Request $request, $radio_id)
    {
        $radio = Radio::findOrFail($radio_id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'stream_url' => 'sometimes|url|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $radio->update($request->all());

        return response()->json([
            'message' => 'Radio updated successfully',
            'radio' => $radio
        ]);
    }
}


