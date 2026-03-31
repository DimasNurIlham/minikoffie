<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockHistory extends Model
{

    protected $fillable = [
        'menu_id',
        'change',
        'type',
        'user_id',
        'note'
    ];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

}
