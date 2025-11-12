<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class RadioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('pt_BR');
        
        $radios = [
            ['name' => 'Rádio Pop', 'description' => 'Melhor música pop do momento'],
            ['name' => 'Rádio Rock', 'description' => 'Rock clássico e moderno'],
            ['name' => 'Rádio Sertanejo', 'description' => 'Sertanejo raiz e universitário'],
            ['name' => 'Rádio MPB', 'description' => 'Música Popular Brasileira'],
            ['name' => 'Rádio Jazz', 'description' => 'Jazz para relaxar'],
            ['name' => 'Rádio Eletrônico', 'description' => 'Batidas eletrônicas'],
            ['name' => 'Rádio Hip-Hop', 'description' => 'Hip-Hop e Rap'],
            ['name' => 'Rádio Clássica', 'description' => 'Música clássica'],
            ['name' => 'Rádio Reggae', 'description' => 'Reggae e Dancehall'],
            ['name' => 'Rádio Funk', 'description' => 'Funk Carioca'],
        ];

        foreach ($radios as $radio) {
            DB::table('radios')->insert([
                'name' => $radio['name'],
                'stream_url' => $faker->url(),
                'description' => $radio['description'],
            ]);
        }
    }
}
