<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /notifications
     * Lista notificações do usuário autenticado
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $unreadOnly = $request->query('unread_only', false);
        $limit = $request->query('limit', 20);
        $page = $request->query('page', 1);

        $query = Notification::where('user_id', $user->id);

        if ($unreadOnly) {
            $query->where('read', false);
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);

        return response()->json($notifications);
    }

    /**
     * GET /notifications/unread-count
     * Retorna contagem de notificações não lidas
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return response()->json([
            'count' => $count
        ]);
    }

    /**
     * PUT /notifications/{id}/read
     * Marca uma notificação como lida
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->update([
            'read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    /**
     * PUT /notifications/read-all
     * Marca todas as notificações como lidas
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read'
        ]);
    }
}

