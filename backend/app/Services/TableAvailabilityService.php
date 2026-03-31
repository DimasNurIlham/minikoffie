<?php

namespace App\Services;

use App\Models\Table;
use Carbon\Carbon;

class TableAvailabilityService
{
    /**
     * Ambil status meja berdasarkan waktu yang dipilih user
     * Durasi reservasi = 2 jam
     */
    public function getStatus(Carbon $time)
    {
        // 🔥 Generate time range 2 jam
        $start = $time->copy();
        $end   = $time->copy()->addHours(2);

        $tables = Table::with('reservations')->get();

        return $tables->map(function ($table) use ($start, $end) {

            $isReserved = $table->reservations()
                ->whereIn('status', ['pending', 'confirmed'])
                ->where(function ($query) use ($start, $end) {
                    $query->where('start_time', '<', $end)
                          ->where('end_time', '>', $start);
                })
                ->exists();

            return [
                'id'     => $table->id,
                'code'   => $table->code,
                'status' => $isReserved ? 'reserved' : 'available',
            ];
        });
    }
}