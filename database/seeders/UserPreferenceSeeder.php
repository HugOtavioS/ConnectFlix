<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class UserPreferenceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $userIds = DB::table('users')->pluck('id')->toArray();
        $categoryIds = DB::table('categories')->pluck('id')->toArray();
        $actorIds = DB::table('actors')->pluck('id')->toArray();

        $userPreferences = [];

        foreach ($userIds as $userId) {
            // Cada usuário tem entre 2 e 5 categorias favoritas
            $favCategories = $faker->randomElements($categoryIds, $faker->numberBetween(2, 5));
            
            // Cada usuário tem entre 1 e 3 atores favoritos
            $favActors = $faker->randomElements($actorIds, $faker->numberBetween(1, 3));

            $userPreferences[] = [
                'user_id' => $userId,
                'favorite_categories' => json_encode($favCategories),
                'favorite_actors' => json_encode($favActors),
                'updated_at' => $faker->dateTimeBetween('-6 months'),
            ];
        }

        DB::table('user_preferences')->insert($userPreferences);
    }
}
