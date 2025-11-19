<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class UserUnlockedMediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $userIds = DB::table('users')->pluck('id')->toArray();
        $mediaIds = DB::table('media')->pluck('id')->toArray();

        $userUnlockedMedia = [];

        foreach ($userIds as $userId) {
            // Cada usuário desbloqueia entre 3 e 15 mídias
            $numUnlocked = $faker->numberBetween(3, 15);
            $selectedMedia = $faker->randomElements($mediaIds, min($numUnlocked, count($mediaIds)));

            foreach ($selectedMedia as $mediaId) {
                $userUnlockedMedia[] = [
                    'user_id' => $userId,
                    'media_id' => $mediaId,
                    'unlocked_at' => $faker->dateTimeBetween('-1 year'),
                ];
            }
        }

        // Remover duplicatas
        $unique = [];
        foreach ($userUnlockedMedia as $unlock) {
            $key = $unlock['user_id'] . '_' . $unlock['media_id'];
            if (!isset($unique[$key])) {
                $unique[$key] = $unlock;
            }
        }

        DB::table('user_unlocked_media')->insert(array_values($unique));
    }
}
