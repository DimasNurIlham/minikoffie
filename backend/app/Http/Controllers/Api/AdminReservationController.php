<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AdminReservationController extends Controller
{
    private function checkAdmin()
    {
        /** @var \App\Models\User $user */
        $user = auth::user();
        if (!$user || !$user->isAdmin()) {
            abort(403, 'Forbidden');
        }
    }

    public function index(Request $request)
    {
        $this->checkAdmin();

        $date = $request->query('date');

        if ($date) {
            $start = Carbon::parse($date)->startOfDay();
            $end   = Carbon::parse($date)->endOfDay();
        } else {
            $start = now()->startOfDay();
            $end   = now()->endOfDay();
        }

        $reservations = Reservation::with(['user', 'tables'])
            ->whereBetween('start_time', [$start, $end])
            ->orderBy('start_time')
            ->get();

        return response()->json($reservations);
    }

    public function cancel($id)
    {
        // 1. Pastikan hanya admin yang bisa akses
        $this->checkAdmin();

        $reservation = Reservation::findOrFail($id);

        /**
         * 2. LOGIKA BARU: Hanya 'pending' yang boleh di-cancel.
         * Jika status sudah 'confirmed' (sudah bayar/proses order), 
         * 'completed', atau 'cancelled', maka akses ditolak.
         */
        if ($reservation->status !== 'pending') {
            return response()->json([
                'message' => 'Hanya reservasi dengan status pending yang dapat dibatalkan'
            ], 400);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($reservation) {
            // 3. Ubah status menjadi cancelled
            $reservation->status = 'cancelled';
            $reservation->save();

            /**
             * 4. PENTING: Lepaskan relasi meja (Pivot Table)
             * Agar meja tersebut statusnya kembali 'available' dan bisa 
             * dipesan oleh pelanggan lain di jam yang sama.
             */
            $reservation->tables()->detach();

            return response()->json([
                'message' => 'Reservasi berhasil dibatalkan dan meja telah dilepaskan'
            ]);
        });
    }
}