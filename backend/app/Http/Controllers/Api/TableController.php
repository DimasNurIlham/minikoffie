<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TableController extends Controller
{
    public function status(Request $request)
    {
        $request->validate(['time' => 'required|date']);

        $selectedTime = \Carbon\Carbon::parse($request->time);

        // Cari meja yang terisi pada waktu yang dipilih user
        $reservedTableIds = \App\Models\Reservation::whereIn('status', ['pending', 'confirmed'])
            ->where('start_time', '<=', $selectedTime) // Gunakan start_time
            ->where('end_time', '>', $selectedTime)   // Gunakan end_time
            ->with('tables')
            ->get()
            ->pluck('tables.*.id')
            ->flatten()
            ->unique()
            ->toArray();

        $tables = \App\Models\Table::all()->map(function ($table) use ($reservedTableIds) {
            return [
                'id' => $table->id,
                'code' => $table->code,
                'status' => in_array($table->id, $reservedTableIds) ? 'reserved' : 'available',
            ];
        });

        return response()->json(['tables' => $tables]);
    }
}