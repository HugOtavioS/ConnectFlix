# 🔍 DIAGNÓSTICO - API DO YOUTUBE

## ✅ O que foi feito

1. **Melhorado logging** no arquivo `lib/youtubeService.ts`:
   - Adicionados console.log para cada requisição
   - Mensagens de erro mais detalhadas
   - Status code e mensagem de erro da API

2. **Servidor rodando** em: `http://localhost:3000`

## 🧪 Como diagnosticar o problema

### Passo 1: Abrir o Console do Navegador
1. Acesse: `http://localhost:3000/home`
2. Pressione: `F12` (ou Ctrl+Shift+I)
3. Vá para a aba "Console"

### Passo 2: Procure por mensagens

**Se a API está funcionando, você verá:**
```
🔑 API Key carregada: AIzaSyD...
📺 Carregando vídeos populares...
✅ Vídeos populares carregados: 12
```

**Se há erro, você verá:**
```
❌ Erro ao obter vídeos populares: 403 quotaExceeded
❌ Erro ao obter vídeos populares: 401 Invalid API key
❌ Erro ao obter vídeos populares: 429 Rate limit exceeded
```

## 🔐 Verificar a Chave de API

### Arquivo `.env.local`
```
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyD4WW_a9QYFGG5aeR2ae5T0hrdCS4wtMk0
```

### No Console, execute:
```javascript
console.log(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY)
```

## ❌ Possíveis Problemas

### 1. Quota Excedida (Error 403)
**Causa**: YouTube API free tier limitado a 10.000 unidades/dia

**Solução**:
- Abra: https://console.cloud.google.com/
- Vá para: APIs > YouTube Data API v3
- Verifique o uso diário
- Espere até amanhã, ou upgrade para tier pago

### 2. API Key Inválida (Error 401)
**Causa**: Chave expirada ou malformada

**Solução**:
- Gere uma nova chave em: https://console.cloud.google.com/
- Verifique se a YouTube Data API v3 está ativada
- Copie a chave exata (sem espaços)
- Atualize `.env.local`
- Reinicie o servidor

### 3. Rate Limit (Error 429)
**Causa**: Muitas requisições rápido

**Solução**:
- Aguarde alguns minutos
- Implemente cache no backend

### 4. Chave não carregada
**Causa**: .env.local não foi recarregado

**Solução**:
1. Salve `.env.local`
2. Reinicie o servidor: `npm run dev`
3. Abra uma aba nova do navegador

## 📋 Checklist de Verificação

- [ ] Arquivo `.env.local` existe em `connectflix/`
- [ ] Contém `NEXT_PUBLIC_YOUTUBE_API_KEY=...`
- [ ] Servidor foi reiniciado após editar `.env.local`
- [ ] Console mostra a chave sendo carregada
- [ ] Nenhuma mensagem de erro 401/403/429

## 🚀 Se tudo estiver certo

O app deve mostrar:
- [ ] Vídeos em `/home`
- [ ] Busca funcionando em `/buscar`
- [ ] Player rodando em `/player/dQw4w9WgXcQ`

## 💡 Debug Avançado

### Monitorar requisições
1. Abra DevTools (F12)
2. Vá para aba "Network"
3. Filtre por "googleapis.com"
4. Verifique status das requisições

### Ver resposta completa
1. Network > Clique na requisição
2. Aba "Response"
3. Veja o erro exato da API

---

**Acesse agora**: http://localhost:3000/home  
**Abra o console**: F12  
**E reporte qual é a mensagem de erro!**
