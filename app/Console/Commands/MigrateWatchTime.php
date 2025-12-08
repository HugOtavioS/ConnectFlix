<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserActivity;
use App\Models\UserWatchTime;
use Illuminate\Console\Command;

class MigrateWatchTime extends Command
{
    protected $signature = 'watchtime:migrate';
    protected $description = 'Migra o tempo total assistido da tabela user_activities para user_watch_time';

    public function handle()
    {
        $this->info('Iniciando migração do tempo assistido...');

        $users = User::all();
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            // Calcular tempo total das atividades existentes
            $totalSeconds = UserActivity::where('user_id', $user->id)
                ->where('activity_type', 'watch')
                ->sum('duration_seconds');

            // Criar ou atualizar registro na tabela user_watch_time
            $watchTime = UserWatchTime::firstOrCreate(
                ['user_id' => $user->id],
                ['total_seconds' => 0]
            );

            // Se o registro já existia mas tinha menos tempo, atualizar
            if ($watchTime->total_seconds < $totalSeconds) {
                $watchTime->total_seconds = $totalSeconds;
                $watchTime->save();
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Migração concluída!');
        
        return Command::SUCCESS;
    }
}

