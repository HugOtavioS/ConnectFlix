<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class MediaCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $mediaIds = DB::table('media')->pluck('id')->toArray();
        $categoryIds = DB::table('categories')->pluck('id')->toArray();

        $mediaCategoryRelations = [];

        foreach ($mediaIds as $mediaId) {
            // Cada mídia tem entre 1 e 4 categorias
            $numCategories = $faker->numberBetween(1, 4);
            $selectedCategories = $faker->randomElements($categoryIds, $numCategories);

            foreach ($selectedCategories as $categoryId) {
                $mediaCategoryRelations[] = [
                    'media_id' => $mediaId,
                    'category_id' => $categoryId,
                ];
            }
        }

        // Remover duplicatas
        $mediaCategoryRelations = array_unique($mediaCategoryRelations, SORT_REGULAR);

        DB::table('media_categories')->insert($mediaCategoryRelations);
    }
}
