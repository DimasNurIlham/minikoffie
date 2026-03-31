<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Menu;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Menu::insert([
            ['name' => 'Nasi Goreng', 'price' => 15000, 'stock' => 10, 'description' => 'Nasi goreng, timun, dan tomat'],
            ['name' => 'Nasi Goreng Sosis', 'price' => 17000, 'stock' => 10, 'description' => 'Nasi goreng, sosis, timun, dan tomat'],
            ['name' => 'Nasi Goreng Ayam', 'price' => 18000, 'stock' => 10, 'description' => 'Nasi goreng, ayam, timun, dan tomat'],
            ['name' => 'Nasi Ayam Goreng', 'price' => 15000, 'stock' => 10, 'description' => 'Nasi, ayam goreng, dan sambal'],
            ['name' => 'Nasi Ayam Gepuk', 'price' => 16000, 'stock' => 10, 'description' => 'Nasi, ayam gepuk, dan sambal'],
            ['name' => 'Nasi Ayam Kremes', 'price' => 18000, 'stock' => 10, 'description' => 'Nasi, ayam goreng kremesan, dan sambal'],
            ['name' => 'Nasi Omellete', 'price' => 12000, 'stock' => 10, 'description' => 'Nasi, telur dadar, dan saus'],
            ['name' => 'Magelangan', 'price' => 18000, 'stock' => 10, 'description' => 'Nasi goreng, mie, timun dan tomat'],
        ]);
    }
}
