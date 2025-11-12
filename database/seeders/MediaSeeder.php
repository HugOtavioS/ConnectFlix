<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class MediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('pt_BR');
        
        $movies = [
            ['title' => 'Matrix', 'type' => 'movie', 'year' => 1999, 'duration' => 136],
            ['title' => 'Homem-Aranha', 'type' => 'movie', 'year' => 2002, 'duration' => 121],
            ['title' => 'Avatar', 'type' => 'movie', 'year' => 2009, 'duration' => 162],
            ['title' => 'Inception', 'type' => 'movie', 'year' => 2010, 'duration' => 148],
            ['title' => 'Interestelar', 'type' => 'movie', 'year' => 2014, 'duration' => 169],
            ['title' => 'Tenet', 'type' => 'movie', 'year' => 2020, 'duration' => 150],
            ['title' => 'Duna', 'type' => 'movie', 'year' => 2021, 'duration' => 156],
            ['title' => 'Homem de Ferro', 'type' => 'movie', 'year' => 2008, 'duration' => 126],
            ['title' => 'Vingadores', 'type' => 'movie', 'year' => 2012, 'duration' => 143],
            ['title' => 'Pantera Negra', 'type' => 'movie', 'year' => 2018, 'duration' => 134],
            ['title' => 'Eternos', 'type' => 'movie', 'year' => 2021, 'duration' => 156],
            ['title' => 'Homem-Aranha: Sem Volta para Casa', 'type' => 'movie', 'year' => 2021, 'duration' => 150],
            ['title' => 'Doutor Estranho 2', 'type' => 'movie', 'year' => 2022, 'duration' => 126],
            ['title' => 'Thor: Amor e Trovão', 'type' => 'movie', 'year' => 2022, 'duration' => 119],
            ['title' => 'Homem-Formiga e Vespa: Quantumania', 'type' => 'movie', 'year' => 2023, 'duration' => 120],
            ['title' => 'Guardiões da Galáxia Vol. 3', 'type' => 'movie', 'year' => 2023, 'duration' => 150],
            ['title' => 'Capitão América: Soldado Invernal', 'type' => 'movie', 'year' => 2014, 'duration' => 136],
            ['title' => 'Viúva Negra', 'type' => 'movie', 'year' => 2021, 'duration' => 134],
            ['title' => 'Atalanta', 'type' => 'movie', 'year' => 2018, 'duration' => 141],
            ['title' => 'Capitã Marvel', 'type' => 'movie', 'year' => 2019, 'duration' => 123],
        ];

        $series = [
            ['title' => 'Stranger Things', 'type' => 'series', 'year' => 2016, 'duration' => 45],
            ['title' => 'Breaking Bad', 'type' => 'series', 'year' => 2008, 'duration' => 47],
            ['title' => 'Game of Thrones', 'type' => 'series', 'year' => 2011, 'duration' => 56],
            ['title' => 'The Crown', 'type' => 'series', 'year' => 2016, 'duration' => 55],
            ['title' => 'The Witcher', 'type' => 'series', 'year' => 2019, 'duration' => 60],
            ['title' => 'Mandalorian', 'type' => 'series', 'year' => 2019, 'duration' => 39],
            ['title' => 'Loki', 'type' => 'series', 'year' => 2021, 'duration' => 47],
            ['title' => 'WandaVision', 'type' => 'series', 'year' => 2021, 'duration' => 30],
            ['title' => 'Falcão e Soldado Invernal', 'type' => 'series', 'year' => 2021, 'duration' => 50],
            ['title' => 'Moon Knight', 'type' => 'series', 'year' => 2022, 'duration' => 50],
        ];

        $allMedia = array_merge($movies, $series);

        foreach ($allMedia as $media) {
            DB::table('media')->insert([
                'title' => $media['title'],
                'type' => $media['type'],
                'description' => $faker->paragraph(),
                'year' => $media['year'],
                'duration' => $media['duration'],
                'rating' => $faker->randomFloat(1, 5, 10),
                'poster_url' => $faker->imageUrl(300, 450, 'movies', true, false),
            ]);
        }
    }
}
