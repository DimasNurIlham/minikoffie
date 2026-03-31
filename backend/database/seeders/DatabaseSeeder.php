<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::insert([
            ['name' => 'Admin', 'email' => "admin@gmail.com", 'password' => bcrypt('admin123'),'role'=>'admin'],
            ['name' => 'staff', 'email' => "staff@gmail.com", 'password' => bcrypt('staff123'),'role'=>'staff'],
            ['name' => 'ilham', 'email' => "ilham@gmail.com", 'password' => bcrypt('ilham123'),'role'=>'customer'],
        ]);

        $this->call(TableSeeder::class);
        $this->call(MenuSeeder::class);
    }

}
