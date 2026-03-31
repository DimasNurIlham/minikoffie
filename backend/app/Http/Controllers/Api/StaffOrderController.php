<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StaffOrderController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->isStaff() && !$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $orders = Order::with(['reservation.tables','items.menu'])
            ->whereIn('status', ['paid','cooking','ready'])
            ->orderBy('created_at')
            ->get();

        return response()->json($orders);
    }

    public function updateStatus(Request $request, Order $order)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->isStaff() && !$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'status' => 'required|in:cooking,ready,served'
        ]);

        $order->status = $data['status'];
        $order->save();

        return response()->json([
            'message' => 'Status updated'
        ]);
    }
}