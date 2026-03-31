<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
        ]);

        // Pastikan reservasi belum punya order
        $reservation = Reservation::with('order')->findOrFail($validated['reservation_id']);
        if ($reservation->order) {
            return response()->json([
                'message' => 'Order sudah dibuat untuk reservasi ini'
            ], 400);
        }

        $order = Order::create([
            'reservation_id' => $reservation->id,
            'total_price' => 0,
            'status' => 'unpaid',
        ]);

        return response()->json([
            'message' => 'Order berhasil dibuat',
            'data' => $order
        ], 201);
    }

    public function addItem(Request $request, $orderId)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $order = Order::with('items')->findOrFail($orderId);
        $menu = \App\Models\Menu::findOrFail($validated['menu_id']);

        $item = $order->items()->create([
            'menu_id' => $menu->id,
            'quantity' => $validated['quantity'],
            'price' => $menu->price,
        ]);

        // Update total harga
        $order->total_price = $order->items->sum(fn ($i) => $i->price * $i->quantity);
        $order->save();

        return response()->json([
            'message' => 'Item berhasil ditambahkan',
            'data' => $item,
            'total_price' => $order->total_price
        ]);
    }
    public function show($id)
    {
        $order = Order::with(['reservation', 'items.menu'])->findOrFail($id);

        return response()->json([
            'data' => $order
        ]);
    }
    
    public function updateItem(Request $request, $itemId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = OrderItem::findOrFail($itemId);
        $item->quantity = $validated['quantity'];
        $item->save();

        if ($item->order->status === 'paid') {
            return response()->json([
                'message' => 'Order sudah dibayar, item tidak bisa diubah'
            ], 403);
        }

        // Update total order
        $order = $item->order;
        $order->total_price = $order->items->sum(fn ($i) => $i->price * $i->quantity);
        $order->save();

        return response()->json([
            'message' => 'Item berhasil diperbarui',
            'data' => $item,
            'total_price' => $order->total_price
        ]);
    }

    public function deleteItem($itemId)
    {
        $item = OrderItem::findOrFail($itemId);
        $order = $item->order;

        if ($order->status === 'paid') {
            return response()->json([
                'message' => 'Order sudah dibayar, item tidak bisa dihapus'
            ], 403);
        }else {
            $item->delete();
        }
        
        // Update total order
        $order->total_price = $order->items->sum(fn ($i) => $i->price * $i->quantity);
        $order->save();

        return response()->json([
            'message' => 'Item berhasil dihapus',
            'total_price' => $order->total_price
        ]);
    }

    public function pay(Request $request, $id)
    {
        $request->validate([
            'method' => 'required|in:cash,qris,card'
        ]);

        return DB::transaction(function () use ($id, $request) {

            $order = Order::with('reservation')->findOrFail($id);

            if ($order->status === 'paid') {
                return response()->json([
                    'message' => 'Order sudah dibayar'
                ], 400);
            }

            if ($order->total_price <= 0) {
                return response()->json([
                    'message' => 'Order kosong, tidak bisa dibayar'
                ], 400);
            }

            // Buat payment record
            Payment::create([
                'order_id' => $order->id,
                'paid_by'  => Auth::id(),
                'amount'   => (int) round($order->total_price),
                'method'   => $request->method,
                'paid_at'  => now(),
            ]);

            // Update order
            $order->status = 'paid';
            $order->save();

            // Update reservasi
            $order->reservation->status = 'confirmed';
            $order->reservation->save();

            return response()->json([
                'message' => 'Pembayaran berhasil',
                'order_id' => $order->id,
                'total_paid' => $order->total_price
            ]);
        });
    }

    public function adminOrders()
    {
        // Gunakan 'reservation.tables' untuk mengambil data meja yang nempel di reservasi
        $orders = Order::with(['items.menu', 'payment', 'reservation.tables'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders
        ]);
    }

}
