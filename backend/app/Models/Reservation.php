<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'join_code',
        'start_time',
        'end_time',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
    ];

    public function tables()
    {
        return $this->belongsToMany(
            Table::class,
            'reservation_tables'
        )->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}


