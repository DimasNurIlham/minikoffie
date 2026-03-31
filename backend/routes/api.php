<?php

use App\Http\Controllers\Api\AdminMenuController;
use App\Http\Controllers\Api\AdminReservationController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JoinController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\StaffInventoryController;
use App\Http\Controllers\Api\StaffOrderController;
use App\Http\Controllers\Api\TableController;
use Illuminate\Support\Facades\Route;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('admin/export-report', [PaymentController::class, 'exportReport']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
    
    Route::post('/orders/{id}/pay', [OrderController::class, 'pay']); 
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{orderId}/items', [OrderController::class, 'addItem']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    
    Route::post('/order-items', [OrderItemController::class, 'store']);
    Route::put('/order-items/{id}', [OrderItemController::class, 'update']);
    Route::delete('/order-items/{id}', [OrderItemController::class, 'destroy']);
    
    });

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/menus', [AdminMenuController::class, 'index']);
    Route::post('/menus', [AdminMenuController::class, 'store']);
    Route::put('/menus/{id}', [AdminMenuController::class, 'update']);
    Route::patch('/menus/{id}/toggle', [AdminMenuController::class, 'toggle']);
    Route::post('/menus/reorder', [AdminMenuController::class, 'reorder']);
    Route::delete('/menus/{id}', [AdminMenuController::class, 'destroy']);
    Route::get('/low-stock',[AdminMenuController::class, 'lowStock']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

    Route::get('/orders', [OrderController::class, 'adminOrders']);
    
    Route::get('/reservations', [ReservationController::class, 'allReservations']);
    Route::get('/income-summary', [PaymentController::class, 'incomeSummary']);
    Route::get('/income-daily', [PaymentController::class, 'incomeDaily']);
    Route::get('/top-menus', [PaymentController::class, 'topMenus']);

    Route::get('/reservations', [AdminReservationController::class, 'index']);
    Route::patch('/reservations/{id}/cancel', [AdminReservationController::class, 'cancel']);
});
    
Route::middleware('auth:sanctum')->prefix('staff')->group(function () {

    Route::get('/orders', [StaffOrderController::class, 'index']);
    Route::patch('/orders/{order}/status', [StaffOrderController::class, 'updateStatus']);

    Route::get('/menus', [StaffInventoryController::class, 'index']);
    Route::post('/menus/{id}/restock', [StaffInventoryController::class, 'restock']);
    Route::get('/menus/{id}/history', [StaffInventoryController::class, 'history']);
    
});
    
    
Route::get('/tables/status', [TableController::class, 'status']);


Route::get('/join/{code}', [JoinController::class, 'join']);

// Route::get('/menus', function () {
//     return \App\Models\Menu::all();
// });

Route::get('/menus', function () {
    return \App\Models\Menu::where('is_active', true)->get();
});