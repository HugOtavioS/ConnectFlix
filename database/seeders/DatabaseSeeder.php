<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ordem importante: dependências primeiro
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ActorSeeder::class,
            MediaSeeder::class,
            CardSeeder::class,
            RadioSeeder::class,
            MediaCategorySeeder::class,
            MediaActorSeeder::class,
            UserCollectibleSeeder::class,
            UserActivitySeeder::class,
            UserConnectionSeeder::class,
            UserUnlockedMediaSeeder::class,
            UserPreferenceSeeder::class,
            DefaultLockedMediaSeeder::class,
        ]);
    }
}
