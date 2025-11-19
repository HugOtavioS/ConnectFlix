<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Ação',
            'Comédia',
            'Drama',
            'Ficção Científica',
            'Fantasia',
            'Horror',
            'Romance',
            'Thriller',
            'Documentário',
            'Aventura',
            'Animação',
            'Crime',
            'Mistério',
            'Biografia',
            'Esporte',
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name' => $category,
            ]);
        }
    }
}
