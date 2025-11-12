<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class UserActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $userIds = DB::table('users')->pluck('id')->toArray();
        $mediaIds = DB::table('media')->pluck('id')->toArray();

        $userActivities = [];

        foreach ($userIds as $userId) {
            // Cada usuário tem entre 10 e 50 atividades
            $numActivities = $faker->numberBetween(10, 50);

            for ($i = 0; $i < $numActivities; $i++) {
                $userActivities[] = [
                    'user_id' => $userId,
                    'media_id' => $faker->randomElement($mediaIds),
                    'activity_type' => $faker->randomElement(['watch', 'stay']),
                    'duration_seconds' => $faker->numberBetween(60, 7200),
                    'timestamp' => $faker->dateTimeBetween('-1 year'),
                ];
            }
        }

        DB::table('user_activities')->insert($userActivities);
    }
}
