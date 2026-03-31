<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    protected $fillable = [
        'code',
        'capacity',
        'type',
        'is_active',
    ];

    public function reservations()
    {
        return $this->belongsToMany(Reservation::class);
    }
}
