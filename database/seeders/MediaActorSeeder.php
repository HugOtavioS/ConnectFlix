<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class MediaActorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $mediaIds = DB::table('media')->pluck('id')->toArray();
        $actorIds = DB::table('actors')->pluck('id')->toArray();

        $mediaActorRelations = [];

        foreach ($mediaIds as $mediaId) {
            // Cada mídia tem entre 2 e 8 atores
            $numActors = $faker->numberBetween(2, 8);
            $selectedActors = $faker->randomElements($actorIds, min($numActors, count($actorIds)));

            foreach ($selectedActors as $actorId) {
                $mediaActorRelations[] = [
                    'media_id' => $mediaId,
                    'actor_id' => $actorId,
                ];
            }
        }

        // Remover duplicatas
        $mediaActorRelations = array_unique($mediaActorRelations, SORT_REGULAR);

        DB::table('media_actors')->insert($mediaActorRelations);
    }
}
