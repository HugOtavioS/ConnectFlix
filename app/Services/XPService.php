<?php

namespace App\Services;

use App\Models\User;

class XPService
{
    /**
     * Calcula XP baseado em tempo assistido (sistema decrescente)
     * Quanto mais tempo total assistido, menos XP por minuto
     * 
     * @param int $minutesAssisted Minutos assistidos nesta sessão
     * @param int $totalWatchTimeMinutes Tempo total assistido pelo usuário (em minutos)
     * @return int XP ganho
     */
    public function calculateWatchTimeXP(int $minutesAssisted, int $totalWatchTimeMinutes): int
    {
        // XP base por minuto (começa alto)
        $baseXPPerMinute = 10;
        
        // Redução baseada no tempo total assistido
        // A cada 100 minutos totais, reduz 0.5 XP por minuto
        $reductionFactor = floor($totalWatchTimeMinutes / 100) * 0.5;
        $xpPerMinute = max(1, $baseXPPerMinute - $reductionFactor); // Mínimo de 1 XP por minuto
        
        // Calcular XP total para esta sessão
        $xpGained = (int) round($minutesAssisted * $xpPerMinute);
        
        // Mínimo de 1 XP mesmo para frações de minuto
        return max(1, $xpGained);
    }

    /**
     * Calcula XP baseado em segundos assistidos (versão mais precisa)
     * 
     * @param int $secondsAssisted Segundos assistidos nesta sessão
     * @param int $totalWatchTimeMinutes Tempo total assistido pelo usuário (em minutos)
     * @return int XP ganho
     */
    public function calculateWatchTimeXPFromSeconds(int $secondsAssisted, int $totalWatchTimeMinutes): int
    {
        // XP base por minuto (começa alto)
        $baseXPPerMinute = 10;
        
        // Redução baseada no tempo total assistido
        // A cada 100 minutos totais, reduz 0.5 XP por minuto
        $reductionFactor = floor($totalWatchTimeMinutes / 100) * 0.5;
        $xpPerMinute = max(1, $baseXPPerMinute - $reductionFactor); // Mínimo de 1 XP por minuto
        
        // Calcular XP proporcional aos segundos (mais preciso)
        $xpPerSecond = $xpPerMinute / 60;
        $xpGained = (int) round($secondsAssisted * $xpPerSecond);
        
        // Mínimo de 1 XP mesmo para poucos segundos
        return max(1, $xpGained);
    }

    /**
     * XP ganho por conexão aceita
     */
    public function getConnectionXP(): int
    {
        return 500; // XP fixo por conexão
    }

    /**
     * Adiciona XP ao usuário e atualiza o level se necessário
     */
    public function addXP(User $user, int $xp): void
    {
        $user->xp = ($user->xp ?? 0) + $xp;
        $user->save();
        
        $this->updateLevel($user);
    }

    /**
     * Atualiza o level do usuário baseado no XP
     * Fórmula: Level = floor(XP / 20000) + 1
     */
    public function updateLevel(User $user): void
    {
        $xp = $user->xp ?? 0;
        $newLevel = floor($xp / 20000) + 1;
        
        if ($newLevel != ($user->level ?? 1)) {
            $user->level = $newLevel;
            $user->save();
        }
    }

    /**
     * Calcula XP necessário para o próximo level
     */
    public function getXPForNextLevel(int $currentXP): int
    {
        $currentLevel = floor($currentXP / 20000) + 1;
        $nextLevelXP = $currentLevel * 20000;
        return $nextLevelXP - $currentXP;
    }

    /**
     * Calcula progresso para o próximo level (0-100)
     */
    public function getProgressToNextLevel(int $currentXP): float
    {
        $currentLevel = floor($currentXP / 20000) + 1;
        $currentLevelXP = ($currentLevel - 1) * 20000;
        $nextLevelXP = $currentLevel * 20000;
        $xpInCurrentLevel = $currentXP - $currentLevelXP;
        $xpNeededForLevel = $nextLevelXP - $currentLevelXP;
        
        return min(100, ($xpInCurrentLevel / $xpNeededForLevel) * 100);
    }
}

