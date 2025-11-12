<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class CardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('pt_BR');
        
        $cards = [];
        $types = ['category', 'actor', 'media', 'other'];
        $rarities = ['common', 'rare', 'epic'];
        $pointValues = [10, 25, 50, 100, 250];

        for ($i = 0; $i < 100; $i++) {
            $type = $faker->randomElement($types);
            
            $cards[] = [
                'name' => $faker->words(2, true),
                'type' => $type,
                'related_id' => $type !== 'other' ? $faker->numberBetween(1, 30) : null,
                'description' => $faker->sentence(),
                'rarity' => $faker->randomElement($rarities),
                'points_value' => $faker->randomElement($pointValues),
                'image_url' => $faker->imageUrl(400, 400, 'cards', true, false),
            ];
        }

        DB::table('cards')->insert($cards);
    }
}
