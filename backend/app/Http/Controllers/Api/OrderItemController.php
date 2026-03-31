<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderItemController extends Controller
{

    /**
     * Tambah item ke order
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'menu_id'  => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($data) {

            $order = Order::findOrFail($data['order_id']);

            if ($order->status === 'paid') {
                return response()->json([
                    'message' => 'Order sudah dibayar'
                ], 403);
            }

            // Lock menu row
            $menu = Menu::where('id', $data['menu_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($menu->stock < $data['quantity']) {
                return response()->json([
                    'message' => 'Stok menu tidak cukup'
                ], 400);
            }

            $existingItem = OrderItem::where('order_id', $order->id)
                ->where('menu_id', $menu->id)
                ->first();

            if ($existingItem) {

                $existingItem->quantity += $data['quantity'];
                $existingItem->subtotal = $existingItem->price * $existingItem->quantity;
                $existingItem->save();

                $item = $existingItem;

            } else {

                $subtotal = $menu->price * $data['quantity'];

                $item = OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id'  => $menu->id,
                    'quantity' => $data['quantity'],
                    'price'    => $menu->price,
                    'subtotal' => $subtotal,
                ]);
            }

            // Kurangi stok
            $menu->stock -= $data['quantity'];
            $menu->is_active = $menu->stock > 0;
            $menu->save();

            // Stock history
            StockHistory::create([
                'menu_id' => $menu->id,
                'change' => -$data['quantity'],
                'type' => 'order',
                'user_id' => Auth::id(),
                'note' => 'Order #' . $order->id
            ]);

            // Update total order
            $order->total_price = $order->items()->sum('subtotal');
            $order->save();

            return response()->json([
                'message' => 'Item berhasil ditambahkan',
                'item' => $item,
                'total' => $order->total_price,
            ]);

        });
    }


    /**
     * Update quantity item
     */
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($data, $id) {

            $item = OrderItem::findOrFail($id);
            $order = $item->order;

            if ($order->status === 'paid') {
                return response()->json([
                    'message' => 'Order sudah dibayar'
                ], 403);
            }

            $menu = Menu::where('id', $item->menu_id)
                ->lockForUpdate()
                ->firstOrFail();

            $diff = $data['quantity'] - $item->quantity;

            if ($diff > 0) {

                if ($menu->stock < $diff) {
                    return response()->json([
                        'message' => 'Stok menu tidak cukup'
                    ], 400);
                }

                $menu->stock -= $diff;

            } else if ($diff < 0) {

                $menu->stock += abs($diff);

            }

            $menu->is_active = $menu->stock > 0;
            $menu->save();

            $item->quantity = $data['quantity'];
            $item->subtotal = $item->price * $item->quantity;
            $item->save();

            // Record history hanya jika ada perubahan
            if ($diff != 0) {

                StockHistory::create([
                    'menu_id' => $menu->id,
                    'change' => -$diff,
                    'type' => 'update',
                    'user_id' => Auth::id(),
                    'note' => 'Update Qty Order #' . $order->id
                ]);

            }

            $order->total_price = $order->items()->sum('subtotal');
            $order->save();

            return response()->json([
                'message' => 'Item diperbarui',
                'total' => $order->total_price,
            ]);

        });
    }


    /**
     * Hapus item dari order
     */
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {

            $item = OrderItem::findOrFail($id);
            $order = $item->order;

            if ($order->status === 'paid') {
                return response()->json([
                    'message' => 'Order sudah dibayar'
                ], 403);
            }

            $menu = Menu::where('id', $item->menu_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Kembalikan stok
            $menu->stock += $item->quantity;
            $menu->is_active = $menu->stock > 0;
            $menu->save();

            // Stock history
            StockHistory::create([
                'menu_id' => $menu->id,
                'change' => $item->quantity,
                'type' => 'cancel',
                'user_id' => Auth::id(),
                'note' => 'Item dihapus dari Order #' . $order->id
            ]);

            $item->delete();

            $order->total_price = $order->items()->sum('subtotal');
            $order->save();

            return response()->json([
                'message' => 'Item berhasil dihapus',
                'total' => $order->total_price,
            ]);

        });
    }

}