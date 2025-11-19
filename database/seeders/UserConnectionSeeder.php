<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class UserConnectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        $userIds = DB::table('users')->pluck('id')->toArray();
        $statuses = ['pending', 'accepted', 'rejected'];

        $userConnections = [];
        $created = [];

        foreach ($userIds as $userId) {
            // Cada usuário faz conexão com entre 2 e 8 outros usuários
            $numConnections = $faker->numberBetween(2, 8);
            $otherUserIds = array_filter($userIds, fn($id) => $id !== $userId);
            
            $selectedUsers = $faker->randomElements($otherUserIds, min($numConnections, count($otherUserIds)));

            foreach ($selectedUsers as $otherUserId) {
                // Evitar conexões duplicadas
                $key = min($userId, $otherUserId) . '_' . max($userId, $otherUserId);
                if (!isset($created[$key])) {
                    $created[$key] = true;
                    
                    $userConnections[] = [
                        'user_id1' => min($userId, $otherUserId),
                        'user_id2' => max($userId, $otherUserId),
                        'status' => $faker->randomElement($statuses),
                        'created_at' => $faker->dateTimeBetween('-1 year'),
                    ];
                }
            }
        }

        DB::table('user_connections')->insert($userConnections);
    }
}
