<?php

use App\Models\Reservation;
use Illuminate\Support\Facades\Schedule;

// Selesaikan reservasi yang sudah lebih dari 2 jam dari waktu booking
Schedule::call(function () {
    Reservation::where('status', 'confirmed')
        ->where('reservation_time', '<=', now()->subHours(2))
        ->update(['status' => 'completed']);
})->everyMinute();


Schedule::command('reservations:expire-pending')
    ->everyMinute();