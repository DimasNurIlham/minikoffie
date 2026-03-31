<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StaffInventoryController extends Controller
{

    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->isStaff()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        return Menu::orderBy('name')->get();
    }

    public function restock(Request $request, $id)
    {

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->isStaff()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $menu = Menu::findOrFail($id);

        $menu->stock += $data['quantity'];

        if ($menu->stock > 0) {
            $menu->is_active = true;
        }

        StockHistory::create([
            'menu_id' => $menu->id,
            'change' => $data['quantity'],
            'type' => 'restock',
            'user_id' => Auth::id(),
            'note' => 'Restock menu'
        ]);
        
        $menu->save();

        return response()->json([
            'message' => 'Stok berhasil ditambahkan',
            'stock' => $menu->stock
        ]);
    }

    public function history($id)
    {
        return StockHistory::with('menu')
            ->where('menu_id', $id)
            ->latest()
            ->limit(20)
            ->get();
    }
}