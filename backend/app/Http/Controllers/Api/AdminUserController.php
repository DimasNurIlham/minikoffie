<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    public function index()
    {
        return User::select('id','name','email','role','created_at')
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|in:admin,staff,customer',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json([
            'message' => 'User berhasil dibuat',
            'data'    => $user
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // 1. Validasi Dasar
        $rules = [
            'name'  => 'required|string',
            'email' => 'required|email|unique:users,email,' . $id,
            'role'  => 'required|in:admin,staff,customer',
        ];

        // 2. Tambahkan validasi password HANYA jika password dikirim dari frontend
        if ($request->filled('password')) {
            $rules['password'] = 'required|min:6'; // sesuaikan minimal karakter
        }

        $validatedData = $request->validate($rules);

        // 3. Proses data yang akan diupdate
        $updateData = [
            'name'  => $validatedData['name'],
            'email' => $validatedData['email'],
            'role'  => $validatedData['role'],
        ];

        // 4. Cek lagi, jika password diisi, lakukan Hashing sebelum masuk database
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        // 5. Eksekusi Update
        $user->update($updateData);

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'user' => $user // opsional: kirim balik data user terbaru
        ]);
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();

        return response()->json([
            'message' => 'User berhasil dihapus'
        ]);
    }
}