<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class UserCollectibleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $userIds = DB::table('users')->pluck('id')->toArray();
        $cardIds = DB::table('cards')->pluck('id')->toArray();
        $mediaIds = DB::table('media')->pluck('id')->toArray();

        $userCollectibles = [];

        foreach ($userIds as $userId) {
            // Cada usuário tem entre 5 e 20 cartas colecionáveis
            $numCollectibles = $faker->numberBetween(5, 20);
            $selectedCards = $faker->randomElements($cardIds, min($numCollectibles, count($cardIds)));

            foreach ($selectedCards as $cardId) {
                $userCollectibles[] = [
                    'user_id' => $userId,
                    'card_id' => $cardId,
                    'media_id' => $faker->randomElement(array_merge($mediaIds, [null])),
                    'acquired_at' => $faker->dateTimeBetween('-6 months'),
                    'counters' => json_encode([
                        'views' => $faker->numberBetween(0, 100),
                        'interactions' => $faker->numberBetween(0, 50),
                    ]),
                ];
            }
        }

        // Remover duplicatas (mesmo user não pode ter a mesma carta duas vezes)
        $unique = [];
        foreach ($userCollectibles as $collectible) {
            $key = $collectible['user_id'] . '_' . $collectible['card_id'];
            if (!isset($unique[$key])) {
                $unique[$key] = $collectible;
            }
        }

        DB::table('user_collectibles')->insert(array_values($unique));
    }
}
