<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Table;

class TableSeeder extends Seeder
{
    public function run()
    {
        Table::insert([
            ['code' => 'TO1', 'capacity' => 3, 'type' => 'square'],
            ['code' => 'TO2', 'capacity' => 3, 'type' => 'square'],
            ['code' => 'SO1', 'capacity' => 1, 'type' => 'sofa'],
            ['code' => 'SO2', 'capacity' => 1, 'type' => 'sofa'],
            ['code' => 'TF1', 'capacity' => 2, 'type' => 'square'],
            ['code' => 'TS1', 'capacity' => 2, 'type' => 'square'],
            ['code' => 'TS2', 'capacity' => 2, 'type' => 'square'],
            ['code' => 'TS3', 'capacity' => 4, 'type' => 'square'],
            ['code' => 'TS4', 'capacity' => 4, 'type' => 'square'],
            ['code' => 'TS5', 'capacity' => 4, 'type' => 'square'],
        ]);
    }
}
