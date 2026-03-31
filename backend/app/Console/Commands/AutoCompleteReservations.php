<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use Carbon\Carbon;

class AutoCompleteReservations extends Command
{
    protected $signature = 'reservations:auto-complete';
    protected $description = 'Auto complete reservations when end_time has passed';

    public function handle()
    {
        $now = Carbon::now();

        $reservations = Reservation::where('status', 'confirmed')
            ->where('end_time', '<=', $now)
            ->get();

        foreach ($reservations as $reservation) {
            $reservation->status = 'completed';
            $reservation->save();
        }

        $this->info("Completed {$reservations->count()} reservations.");

        return Command::SUCCESS;
    }
}