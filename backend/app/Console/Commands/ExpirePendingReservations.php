<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use Carbon\Carbon;

class ExpirePendingReservations extends Command
{
    protected $signature = 'reservations:expire-pending';

    protected $description = 'Auto cancel pending reservations after 15 minutes';

    public function handle()
    {
        $expiredTime = Carbon::now()->subMinutes(15);

        $count = Reservation::where('status', 'pending')
            ->where('created_at', '<=', $expiredTime)
            ->update([
                'status' => 'cancelled'
            ]);

        $this->info("Expired {$count} reservations.");
    }
}