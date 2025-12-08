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
        // Only insert if table is empty to make this seeder idempotent.
        if (DB::table('cards')->count() > 0) {
            echo "CardSeeder: tabela 'cards' já contém dados — pulando inserção.\n";
            return;
        }

        $now = now();

        $cards = [
            ['name' => 'Iniciado em Hogwarts', 'type' => 'media', 'related_id' => null, 'description' => 'Assistiu o primeiro filme Harry Potter', 'rarity' => 'common', 'points_value' => 50, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mestre das Varinhas', 'type' => 'media', 'related_id' => null, 'description' => 'Completou toda a saga Harry Potter', 'rarity' => 'epic', 'points_value' => 500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Herói de Wakanda', 'type' => 'media', 'related_id' => null, 'description' => 'Assistiu Pantera Negra + Wakanda Forever', 'rarity' => 'rare', 'points_value' => 200, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Vingador Original', 'type' => 'media', 'related_id' => null, 'description' => 'Completou Fase 1–4 dos Vingadores', 'rarity' => 'epic', 'points_value' => 800, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Senhor dos Anéis', 'type' => 'media', 'related_id' => null, 'description' => 'Completou trilogia Senhor dos Anéis + O Hobbit', 'rarity' => 'legendary', 'points_value' => 1000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Jedi Iniciante', 'type' => 'media', 'related_id' => null, 'description' => 'Assistiu qualquer filme Star Wars', 'rarity' => 'common', 'points_value' => 100, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mestre Jedi', 'type' => 'media', 'related_id' => null, 'description' => 'Completou episódios I–IX de Star Wars', 'rarity' => 'legendary', 'points_value' => 1500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Velozes & Furiosos – Família', 'type' => 'media', 'related_id' => null, 'description' => 'Assistiu 5 ou mais filmes da franquia', 'rarity' => 'rare', 'points_value' => 400, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Matrix Reloaded', 'type' => 'media', 'related_id' => null, 'description' => 'Completou trilogia Matrix + Ressurreições', 'rarity' => 'epic', 'points_value' => 600, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rei do Norte', 'type' => 'media', 'related_id' => null, 'description' => 'Completou todas as temporadas de Game of Thrones', 'rarity' => 'legendary', 'points_value' => 1200, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Stranger Things Upside Down', 'type' => 'media', 'related_id' => null, 'description' => 'Assistiu todas as temporadas de Stranger Things', 'rarity' => 'epic', 'points_value' => 700, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'The Office – Dundie Award', 'type' => 'media', 'related_id' => null, 'description' => 'Completou todas as temporadas de The Office', 'rarity' => 'rare', 'points_value' => 350, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],

            ['name' => 'Ação Iniciante', 'type' => 'category', 'related_id' => null, 'description' => '5 títulos de Ação', 'rarity' => 'common', 'points_value' => 30, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mestre da Ação', 'type' => 'category', 'related_id' => null, 'description' => '50 títulos de Ação', 'rarity' => 'rare', 'points_value' => 200, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rei da Ação', 'type' => 'category', 'related_id' => null, 'description' => '150 títulos de Ação', 'rarity' => 'epic', 'points_value' => 800, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Comédia Stand-Up', 'type' => 'category', 'related_id' => null, 'description' => '10 títulos de Comédia', 'rarity' => 'common', 'points_value' => 40, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rei do Riso', 'type' => 'category', 'related_id' => null, 'description' => '100 títulos de Comédia', 'rarity' => 'rare', 'points_value' => 300, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Terror Noturno', 'type' => 'category', 'related_id' => null, 'description' => '5 títulos de Terror', 'rarity' => 'common', 'points_value' => 50, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Sobrevivente do Horror', 'type' => 'category', 'related_id' => null, 'description' => '75 títulos de Terror', 'rarity' => 'epic', 'points_value' => 600, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Romântico Incorrigível', 'type' => 'category', 'related_id' => null, 'description' => '10 títulos de Romance', 'rarity' => 'common', 'points_value' => 35, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Drama Queen/King', 'type' => 'category', 'related_id' => null, 'description' => '80 títulos de Drama', 'rarity' => 'rare', 'points_value' => 250, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Sci-Fi Explorer', 'type' => 'category', 'related_id' => null, 'description' => '60 títulos de Ficção Científica', 'rarity' => 'rare', 'points_value' => 400, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Anime Otaku Iniciante', 'type' => 'category', 'related_id' => null, 'description' => '10 animes', 'rarity' => 'common', 'points_value' => 60, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Sensei Supremo', 'type' => 'category', 'related_id' => null, 'description' => '200 animes', 'rarity' => 'legendary', 'points_value' => 1200, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Documentário Curioso', 'type' => 'category', 'related_id' => null, 'description' => '10 documentários', 'rarity' => 'common', 'points_value' => 40, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Fantasia Mágica', 'type' => 'category', 'related_id' => null, 'description' => '50 títulos de Fantasia', 'rarity' => 'rare', 'points_value' => 350, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Suspense Psicológico', 'type' => 'category', 'related_id' => null, 'description' => '100 títulos de Suspense', 'rarity' => 'epic', 'points_value' => 700, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Faroeste Moderno', 'type' => 'category', 'related_id' => null, 'description' => '30 títulos de Faroeste', 'rarity' => 'rare', 'points_value' => 300, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Musical Broadway', 'type' => 'category', 'related_id' => null, 'description' => '40 títulos Musicais', 'rarity' => 'rare', 'points_value' => 400, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Animação Pixar', 'type' => 'category', 'related_id' => null, 'description' => '15 títulos de Animação', 'rarity' => 'common', 'points_value' => 70, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Super-Herói Completo', 'type' => 'category', 'related_id' => null, 'description' => '120 títulos de Super-Herói', 'rarity' => 'epic', 'points_value' => 900, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Cineasta Independente', 'type' => 'category', 'related_id' => null, 'description' => '300 títulos de qualquer gênero', 'rarity' => 'legendary', 'points_value' => 1500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],

            ['name' => 'Fã de Tom Hanks', 'type' => 'actor', 'related_id' => null, 'description' => '5 títulos com Tom Hanks', 'rarity' => 'common', 'points_value' => 80, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tom Hanks Completo', 'type' => 'actor', 'related_id' => null, 'description' => '30 títulos com Tom Hanks', 'rarity' => 'epic', 'points_value' => 700, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Scarlett Johansson Black Widow', 'type' => 'actor', 'related_id' => null, 'description' => '15 títulos com Scarlett Johansson', 'rarity' => 'rare', 'points_value' => 400, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Leonardo DiCaprio Oscar Hunter', 'type' => 'actor', 'related_id' => null, 'description' => '20 títulos com DiCaprio', 'rarity' => 'epic', 'points_value' => 800, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dwayne “The Rock” Johnson', 'type' => 'actor', 'related_id' => null, 'description' => '15 títulos com The Rock', 'rarity' => 'rare', 'points_value' => 350, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Meryl Streep Legend', 'type' => 'actor', 'related_id' => null, 'description' => '40 títulos com Meryl Streep', 'rarity' => 'legendary', 'points_value' => 1200, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ryan Reynolds Deadpool', 'type' => 'actor', 'related_id' => null, 'description' => '12 títulos com Ryan Reynolds', 'rarity' => 'rare', 'points_value' => 450, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Keanu Reeves – The One', 'type' => 'actor', 'related_id' => null, 'description' => '25 títulos com Keanu Reeves', 'rarity' => 'epic', 'points_value' => 900, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Margot Robbie Harley Quinn', 'type' => 'actor', 'related_id' => null, 'description' => '15 títulos com Margot Robbie', 'rarity' => 'rare', 'points_value' => 500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Zendaya Rising Star', 'type' => 'actor', 'related_id' => null, 'description' => '15 títulos com Zendaya', 'rarity' => 'rare', 'points_value' => 400, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Robert Downey Jr. – Iron Man Forever', 'type' => 'actor', 'related_id' => null, 'description' => '35 títulos com RDJ', 'rarity' => 'legendary', 'points_value' => 1300, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Emma Watson Hermione', 'type' => 'actor', 'related_id' => null, 'description' => '20 títulos com Emma Watson', 'rarity' => 'epic', 'points_value' => 750, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Chris Hemsworth Thor', 'type' => 'actor', 'related_id' => null, 'description' => '18 títulos com Chris Hemsworth', 'rarity' => 'rare', 'points_value' => 550, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Natalie Portman Queen', 'type' => 'actor', 'related_id' => null, 'description' => '25 títulos com Natalie Portman', 'rarity' => 'epic', 'points_value' => 850, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Denzel Washington Master', 'type' => 'actor', 'related_id' => null, 'description' => '40 títulos com Denzel Washington', 'rarity' => 'legendary', 'points_value' => 1400, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],

            ['name' => '10 Horas Club', 'type' => 'milestone', 'related_id' => null, 'description' => '10 horas totais assistidas', 'rarity' => 'common', 'points_value' => 50, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => '100 Horas Elite', 'type' => 'milestone', 'related_id' => null, 'description' => '100 horas totais', 'rarity' => 'rare', 'points_value' => 500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => '500 Horas Legend', 'type' => 'milestone', 'related_id' => null, 'description' => '500 horas totais', 'rarity' => 'epic', 'points_value' => 2000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => '1000 Horas God', 'type' => 'milestone', 'related_id' => null, 'description' => '1000 horas totais', 'rarity' => 'legendary', 'points_value' => 5000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Maratonista Bronze', 'type' => 'milestone', 'related_id' => null, 'description' => '10 horas em 24h', 'rarity' => 'common', 'points_value' => 100, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Maratonista Prata', 'type' => 'milestone', 'related_id' => null, 'description' => '24 horas em uma semana', 'rarity' => 'rare', 'points_value' => 400, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Maratonista Ouro', 'type' => 'milestone', 'related_id' => null, 'description' => '50 horas em uma semana', 'rarity' => 'epic', 'points_value' => 1500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Streak 7 Dias', 'type' => 'milestone', 'related_id' => null, 'description' => '7 dias seguidos', 'rarity' => 'common', 'points_value' => 150, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Streak 30 Dias', 'type' => 'milestone', 'related_id' => null, 'description' => '30 dias seguidos', 'rarity' => 'rare', 'points_value' => 800, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Streak 100 Dias', 'type' => 'milestone', 'related_id' => null, 'description' => '100 dias seguidos', 'rarity' => 'epic', 'points_value' => 3000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Noite Insonne', 'type' => 'milestone', 'related_id' => null, 'description' => '8 horas seguidas em um dia', 'rarity' => 'rare', 'points_value' => 300, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Fim de Semana Perdido', 'type' => 'milestone', 'related_id' => null, 'description' => '20+ horas em um fim de semana', 'rarity' => 'epic', 'points_value' => 1000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => '50 Títulos em um Mês', 'type' => 'milestone', 'related_id' => null, 'description' => '50 títulos em 30 dias', 'rarity' => 'rare', 'points_value' => 600, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => '100 Títulos em um Mês', 'type' => 'milestone', 'related_id' => null, 'description' => '100 títulos em 30 dias', 'rarity' => 'epic', 'points_value' => 2000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rádio 10 Horas', 'type' => 'radio', 'related_id' => null, 'description' => '10 horas de rádio', 'rarity' => 'common', 'points_value' => 80, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rádio 100 Horas', 'type' => 'radio', 'related_id' => null, 'description' => '100 horas de rádio', 'rarity' => 'rare', 'points_value' => 500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Rádio Master', 'type' => 'radio', 'related_id' => null, 'description' => '500 horas de rádio', 'rarity' => 'epic', 'points_value' => 1500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Explorador de Gêneros', 'type' => 'milestone', 'related_id' => null, 'description' => 'Pelo menos 1 título de 15 gêneros diferentes', 'rarity' => 'rare', 'points_value' => 700, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],

            ['name' => 'Primeiro Amigo', 'type' => 'social', 'related_id' => null, 'description' => '1 conexão aceita', 'rarity' => 'common', 'points_value' => 50, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => '10 Conexões', 'type' => 'social', 'related_id' => null, 'description' => '10 conexões', 'rarity' => 'common', 'points_value' => 150, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => '50 Conexões', 'type' => 'social', 'related_id' => null, 'description' => '50 conexões', 'rarity' => 'rare', 'points_value' => 600, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => '100 Conexões', 'type' => 'social', 'related_id' => null, 'description' => '100 conexões', 'rarity' => 'epic', 'points_value' => 2000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Social Butterfly', 'type' => 'social', 'related_id' => null, 'description' => '250 conexões', 'rarity' => 'legendary', 'points_value' => 4000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Amigo de Todos', 'type' => 'social', 'related_id' => null, 'description' => '1 conexão em cada estado brasileiro', 'rarity' => 'rare', 'points_value' => 800, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Embaixador ConnectFlix', 'type' => 'social', 'related_id' => null, 'description' => '500 conexões', 'rarity' => 'epic', 'points_value' => 2500, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Compartilhador', 'type' => 'social', 'related_id' => null, 'description' => 'Compartilhou perfil 10 vezes', 'rarity' => 'common', 'points_value' => 100, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Influencer da Plataforma', 'type' => 'social', 'related_id' => null, 'description' => 'Teve 1000 conexões totais na rede (efeito rede)', 'rarity' => 'rare', 'points_value' => 1000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Convidado VIP', 'type' => 'social', 'related_id' => null, 'description' => 'Convidou 50 amigos que se cadastraram', 'rarity' => 'epic', 'points_value' => 3000, 'image_url' => null, 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('cards')->insert($cards);
    }
}
