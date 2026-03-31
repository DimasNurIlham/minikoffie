<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Menu;
use Illuminate\Support\Facades\Auth;


class AdminMenuController extends Controller
{
    private function checkAdmin()
    {
        /** @var \App\Models\User $user */
        $user = auth::user();

        if (!$user || !$user->isAdmin()) {
            abort(403, 'Forbidden');
        }
    }

    public function index()
    {
        $this->checkAdmin();
        return response()->json(Menu::latest()->get());
    }

    public function store(Request $request)
    {
        $this->checkAdmin();

        $data = $request->validate([
            'name'        => 'required|string',
            'description' => 'nullable|string',
            'price'       => 'required|integer|min:0',
            'stock'       => 'required|integer|min:0', // Pastikan stock masuk validasi
        ]);

        // Tambahkan default is_active karena di database kamu ada kolomnya
        $data['is_active'] = true;

        $menu = Menu::create($data);

        return response()->json($menu, 201);
    }

    public function update(Request $request, $id)
    {
        $this->checkAdmin();

        $menu = Menu::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'stock'       => 'required|integer|min:0',
        ]);

        $menu->update($data);

        return response()->json($menu);
    }

    public function toggle($id)
    {
        $this->checkAdmin();

        $menu = Menu::findOrFail($id);

        $menu->is_active = !$menu->is_active;
        $menu->save();

        return response()->json([
            'message' => 'Status updated',
            'is_active' => $menu->is_active
        ]);
    }

    public function reorder(Request $request) {
        $ids = $request->ids; // Array ID: [5, 2, 8, ...]
        foreach ($ids as $index => $id) {
            Menu::where('id', $id)->update(['sort_order' => $index]);
        }
        return response()->json(['message' => 'Order updated']);
    }

    public function destroy($id)
    {
        $this->checkAdmin();

        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'message' => 'Menu deleted'
        ]);
    }

    public function lowStock()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $menus = \App\Models\Menu::where('stock', '<=', 5)
            ->where('is_active', true)
            ->orderBy('stock')
            ->get(['id','name','stock']);

        return response()->json($menus);
    }
}