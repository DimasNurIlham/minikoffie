<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Income Summary (Range Support)
     * GET /api/admin/income-summary?start=2026-02-01&end=2026-02-27
     */
    public function incomeSummary(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth::user();

        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $start = $request->query('start');
        $end   = $request->query('end');

        if ($start && $end) {
            $startDate = Carbon::parse($start)->startOfDay();
            $endDate   = Carbon::parse($end)->endOfDay();
        } else {
            // Default: hari ini
            $startDate = now()->startOfDay();
            $endDate   = now()->endOfDay();
        }

        $payments = Payment::whereBetween('paid_at', [$startDate, $endDate])->get();

        $totalIncome = $payments->sum('amount');
        $totalTransactions = $payments->count();

        $byMethod = $payments
            ->groupBy('method')
            ->map(fn ($items) => $items->sum('amount'));

        return response()->json([
            'start' => $startDate->toDateString(),
            'end'   => $endDate->toDateString(),
            'total_income' => $totalIncome,
            'total_transactions' => $totalTransactions,
            'by_method' => $byMethod
        ]);
    }

    /**
     * Income Daily Chart (Range Support)
     * GET /api/admin/income-daily?start=2026-02-01&end=2026-02-27
     */
    public function incomeDaily(Request $request)
    {
        /** @var \App\Models\User $user */
        // Gunakan Auth dengan huruf kapital (Facade) agar lebih clean
        $user = \Illuminate\Support\Facades\Auth::user();

        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $start = $request->query('start');
        $end   = $request->query('end');

        if ($start && $end) {
            $startDate = \Illuminate\Support\Carbon::parse($start)->startOfDay();
            $endDate   = \Illuminate\Support\Carbon::parse($end)->endOfDay();
        } else {
            // Default: 7 hari terakhir
            $startDate = now()->subDays(6)->startOfDay();
            $endDate   = now()->endOfDay();
        }

        // UPDATE: Menambahkan COUNT(*) sebagai transaction_count
        $data = \App\Models\Payment::whereBetween('paid_at', [$startDate, $endDate])
            ->selectRaw('
                DATE(paid_at) as date, 
                SUM(amount) as total, 
                COUNT(*) as transaction_count
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }

    public function topMenus(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth::user();

        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $start = $request->query('start');
        $end   = $request->query('end');

        if ($start && $end) {
            $startDate = Carbon::parse($start)->startOfDay();
            $endDate   = Carbon::parse($end)->endOfDay();
        } else {
            $startDate = now()->startOfDay();
            $endDate   = now()->endOfDay();
        }

        $data = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->join('payments', 'payments.order_id', '=', 'orders.id')
            ->whereBetween('payments.paid_at', [$startDate, $endDate])
            ->select(
                'menus.name',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('menus.name')
            ->orderByDesc('total_quantity')
            ->get();

        return response()->json($data);
    }

    public function exportReport()
    {
        $data = Payment::with('order')
            ->latest()
            ->get();

        $filename = "report.csv";

        $headers = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
        ];

        $callback = function () use ($data) {

            $file = fopen('php://output', 'w');

            fputcsv($file, ['Order ID','Amount','Method','Date']);

            foreach ($data as $row) {
                fputcsv($file, [
                    $row->order_id,
                    $row->amount,
                    $row->method,
                    $row->paid_at
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}