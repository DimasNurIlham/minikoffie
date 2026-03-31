<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendOrderPaidNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(OrderPaid $event)
    {
        $order = $event->order;

        Log::info('ORDER PAID (QUEUE)', [
            'order_id' => $order->id,
            'total' => $order->total_price,
        ]);
    }
}
