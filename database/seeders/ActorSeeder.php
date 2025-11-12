<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ActorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('pt_BR');
        
        // Gerar nomes únicos de atores
        $actors = [];
        $existingNames = [];
        
        for ($i = 0; $i < 50; $i++) {
            do {
                $name = $faker->name();
            } while (in_array($name, $existingNames));
            
            $existingNames[] = $name;
            $actors[] = [
                'name' => $name,
            ];
        }

        DB::table('actors')->insert($actors);
    }
}
