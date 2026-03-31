<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Order;

class JoinController extends Controller
{
    public function join($code)
    {
        $reservation = Reservation::where('join_code', $code)
            ->whereIn('status', ['pending', 'confirmed'])
            ->with('tables:id,code') // Pastikan nama kolom di tabel tables benar (code/table_number?)
            ->firstOrFail();

        // 1. Cari atau Buat Order
        $order = Order::firstOrCreate(
            ['reservation_id' => $reservation->id],
            [
                'status' => 'unpaid',
                'total_price' => 0,
            ]
        );

        // 2. 🔥 PENTING: Load relasi items setelah order didapat
        // Kita butuh 'items' agar frontend tahu menu apa yg sudah dipesan & quantity-nya
        $order->load('items.menu'); 

        return response()->json([
            'reservation' => [
                'id' => $reservation->id,
                'time' => $reservation->reservation_time,
                'tables' => $reservation->tables,
            ],
            'order' => [
                'id' => $order->id,
                'status' => $order->status,
                'total_price' => $order->total_price,
                
                // 👇 INI DIA YANG HILANG KEMARIN!
                // Tanpa ini, React tidak tahu item apa saja yang ada di dalam order
                'items' => $order->items, 
            ],
        ]);
    }
}