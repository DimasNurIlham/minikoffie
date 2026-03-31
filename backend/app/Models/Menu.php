<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image',
        'is_active'
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockHistories()
    {
        return $this->hasMany(StockHistory::class);
    }
}

