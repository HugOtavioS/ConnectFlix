#!/bin/bash

# Script para testar a chave da API do YouTube

API_KEY="AIzaSyD4WW_a9QYFGG5aeR2ae5T0hrdCS4wtMk0"

echo "🧪 Testando API Key do YouTube..."
echo "================================"
echo ""

# Teste 1: Vídeos Populares
echo "📺 Teste 1: Carregando vídeos populares..."
curl -s "https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&maxResults=3&type=video&order=viewCount&region=BR" | jq '.error.message // "✅ Sucesso"'

echo ""
echo "================================"
echo ""

# Teste 2: Detalhes de um vídeo
echo "📽️ Teste 2: Carregando detalhes de vídeo..."
curl -s "https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=snippet,statistics&id=dQw4w9WgXcQ" | jq '.error.message // "✅ Sucesso"'

echo ""
echo "================================"
echo ""

echo "✅ Testes concluídos!"
