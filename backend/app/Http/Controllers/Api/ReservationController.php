<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;


class ReservationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'reservation_time' => 'required|date',
            'table_ids'        => 'required|array|min:1',
            'table_ids.*'      => 'exists:tables,id',
        ]);

        $start = Carbon::parse($data['reservation_time']);
        $end   = $start->copy()->addHours(2);

        return DB::transaction(function () use ($data, $start, $end) {

            // 🔥 Cek konflik berdasarkan RANGE
            $conflict = Reservation::whereIn('status', ['pending', 'confirmed'])
                ->where(function ($query) use ($start, $end) {
                    $query->where('start_time', '<', $end)
                        ->where('end_time', '>', $start);
                })
                ->whereHas('tables', function ($q) use ($data) {
                    $q->whereIn('tables.id', $data['table_ids']);
                })
                ->exists();

            if ($conflict) {
                return response()->json([
                    'message' => 'Salah satu meja sudah terpakai di jam tersebut'
                ], 409);
            }

            // 🔥 CREATE dengan start & end time
            $reservation = Reservation::create([
                'user_id'   => Auth::id(),
                'start_time'=> $start,
                'end_time'  => $end,
                'status'    => 'pending',
                'join_code' => Str::upper(Str::random(6)),
            ]);

            $reservation->tables()->attach($data['table_ids']);

            return response()->json([
                'message' => 'Reservasi berhasil dibuat',
                'data' => [
                    'reservation_id' => $reservation->id,
                    'join_code'      => $reservation->join_code,
                ]
            ], 201);
        });
    }

    public function myReservations()
    {
        $reservations = Reservation::with('tables')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json([
            'data' => $reservations
        ]);
    }

    public function cancel($id)
    {
        $reservation = Reservation::findOrFail($id);

        if ($reservation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($reservation->status === 'cancelled') {
            return response()->json(['message' => 'Sudah dibatalkan'], 400);
        }

        $reservation->status = 'cancelled';
        $reservation->save();

        $reservation->tables()->detach();

        return response()->json([
            'message' => 'Reservasi berhasil dibatalkan'
        ]);
    }

    public function allReservations()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reservations = Reservation::with(['user', 'tables'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $reservations
        ]);
    }


}
