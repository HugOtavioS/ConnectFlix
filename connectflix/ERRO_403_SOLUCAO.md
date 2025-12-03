# 🔴 PROBLEMA ENCONTRADO: YouTube API Desabilitada

## ⚠️ O Erro

```
YouTube Data API v3 has not been used in project 609181149616 
before or it is disabled.
```

**Status**: `PERMISSION_DENIED`  
**Razão**: `SERVICE_DISABLED`  
**Código**: `403`

## ✅ SOLUÇÃO - Passo a Passo

### Passo 1: Abra o Google Cloud Console
Clique no link abaixo:
```
https://console.developers.google.com/apis/api/youtube.googleapis.com/overview?project=609181149616
```

Ou faça manualmente:
1. Vá para: https://console.developers.google.com/
2. Selecione o projeto `609181149616`
3. Procure por "YouTube Data API v3"
4. Clique em "Enable"

### Passo 2: Ativar a API
```
┌─────────────────────────────────────────────────┐
│  YouTube Data API v3                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Status: ❌ DISABLED                            │
│                                                 │
│  [ENABLE] ← CLIQUE AQUI                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Passo 3: Aguarde 2-5 minutos
Google Cloud leva alguns minutos para ativar a API.

### Passo 4: Volte para o ConnectFlix
1. Abra: `http://localhost:3000/home`
2. F12 para abrir console
3. Verifique se os vídeos carregam

---

## 🔑 Sua Chave de API

```
AIzaSyD4WW_a9QYFGG5aeR2ae5T0hrdCS4wtMk0
```

**Projeto**: 609181149616

---

## ✨ Depois que ativar

Os vídeos devem aparecer normalmente:

```
✅ Página /home - Vídeos populares
✅ Página /buscar - Busca funcionando
✅ Página /player/[id] - Player com detalhes
```

---

## 📊 Depois de ativar, você verá no console:

```
🔑 API Key carregada: AIzaSyD...
📺 Carregando vídeos populares...
✅ Vídeos populares carregados: 12
```

Em vez de:

```
❌ Erro ao obter vídeos populares: 403 SERVICE_DISABLED
⚠️ Usando dados de demonstração como fallback.
```

---

## ⏱️ Não funciona depois de ativar?

Se ainda não funcionar após ativar:

1. **Aguarde 5-10 minutos** (propagação)
2. **Reinicie o servidor**: `npm run dev`
3. **Limpe cache do navegador**: Ctrl+Shift+Delete
4. **Teste em aba anônima**: Ctrl+Shift+N

---

## 🎯 Resumo

| Antes | Depois |
|-------|--------|
| ❌ API desabilitada | ✅ API ativada |
| ❌ Vídeos não carregam | ✅ Vídeos carregam |
| ⚠️ Usa dados demo | ✅ Usa dados reais |
| ❌ Erro 403 | ✅ Funciona normalmente |

---

**Próximo passo**: Ativar a API em: https://console.developers.google.com/

🚀 Depois, todos os vídeos devem carregar normalmente!
