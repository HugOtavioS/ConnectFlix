<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // For now, we'll check if user has an 'is_admin' field or role
        // You can customize this based on your admin logic
        // For simplicity, we'll check if user has a specific role or flag
        // You may need to add an 'is_admin' or 'role' column to users table
        
        // Temporary: Allow all authenticated users as admin for now
        // TODO: Implement proper admin check based on your requirements
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        // If you have an is_admin column, uncomment this:
        // if (!$user->is_admin) {
        //     return response()->json([
        //         'message' => 'Forbidden - Admin access required'
        //     ], 403);
        // }

        return $next($request);
    }
}


