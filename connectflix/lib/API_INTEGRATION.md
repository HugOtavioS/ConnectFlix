# Integração de Endpoints - ConnectFlix

## Visão Geral

O arquivo `apiService.ts` contém uma classe `ApiService` que centraliza todas as chamadas aos endpoints do backend. O serviço foi integrado em todas as páginas principais da aplicação.

## Configuração

### URL Base da API
A URL base é configurada através da variável de ambiente:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Se não configurada, o padrão é `http://localhost:8000/api`.

### Token de Autenticação
O token é automaticamente armazenado em `localStorage` e adicionado a todas as requisições autenticadas.

## Uso do ApiService

### Importação
```typescript
import apiService from '@/lib/apiService';
```

### Autenticação

#### Login
```typescript
await apiService.login(email, password);
// Retorna: { access_token, token_type }
// Token é automaticamente armazenado
```

#### Registro
```typescript
await apiService.register({
  username: string,
  email: string,
  password: string,
  city: string,
  state: string,
  country: string
});
```

#### Logout
```typescript
await apiService.logout();
// Remove token automaticamente
```

#### Verificar Autenticação
```typescript
if (apiService.isAuthenticated()) {
  // Usuário autenticado
}
```

## Endpoints Integrados por Página

### 1. **Autenticação** (`/auth`)
- ✅ `POST /auth/login` - Login de usuário
- ✅ `POST /auth/register` - Registro de novo usuário
- ✅ `POST /auth/logout` - Logout
- **Integração**: Formulário com validação e redirecionamento automático

### 2. **Perfil** (`/perfil`)
- ✅ `GET /users/me` - Obter perfil do usuário
- ✅ `PUT /users/me` - Atualizar perfil
- ✅ `GET /preferences/me` - Obter preferências (categorias e atores favoritos)
- ✅ `GET /rankings/me` - Obter posição nos rankings
- **Integração**: Carrega dados do usuário no carregamento da página

### 3. **Home** (`/home`)
- ✅ `GET /media` - Listar mídias populares
- **Integração**: Carrega conteúdo recomendado baseado em preferências

### 4. **Buscar** (`/buscar`)
- ✅ `GET /media/search` - Buscar mídias por termo
- **Integração**: Registro automático de buscas realizadas

### 5. **Rankings** (`/rankings`)
- ✅ `GET /rankings/national` - Ranking nacional
- ✅ `GET /rankings/state` - Ranking estadual
- ✅ `GET /rankings/regional` - Ranking regional
- **Integração**: Filtro por período (semana, mês, todos os tempos)

### 6. **Cards Colecionáveis** (`/cards`)
- ✅ `GET /collectibles/me` - Obter cards do usuário
- **Integração**: Exibe coleção com contadores por raridade

### 7. **Conexões** (`/conexoes`)
- ✅ `GET /connections/me` - Listar conexões aceitas
- ✅ `GET /connections/pending` - Listar conexões pendentes
- ✅ `POST /connections/request/{user_id}` - Solicitar conexão
- ✅ `PUT /connections/accept/{connection_id}` - Aceitar conexão
- ✅ `PUT /connections/reject/{connection_id}` - Rejeitar conexão
- **Integração**: Abas para minhas conexões, pendentes e sugestões

### 8. **Explorador** (`/explorador`)
- ✅ `GET /media` - Listar mídias com filtros por tipo
- **Integração**: Filtro por categoria (filmes, séries, documentários)

### 9. **Player** (`/player/[id]`)
- ✅ `POST /activities` - Registrar visualização
- **Integração**: Registra automaticamente quando um vídeo é iniciado

## Tratamento de Erros

O serviço inclui tratamento automático de erros:

```typescript
try {
  const data = await apiService.getMedia();
} catch (error: any) {
  const errorMessage = error.response?.data?.message || 'Erro desconhecido';
  console.error('Erro:', errorMessage);
}
```

### Autenticação Expirada

Se o token expirar (erro 401), o usuário é automaticamente redirecionado para `/auth`.

## Interceptadores

### Request
Adiciona automaticamente o token Bearer a todas as requisições:
```
Authorization: Bearer {token}
```

### Response
Verifica status 401 e redireciona para login se necessário.

## Métodos Disponíveis

### Usuários
- `getCurrentUser()` - GET /users/me
- `updateCurrentUser(userData)` - PUT /users/me
- `getUser(userId)` - GET /users/{user_id}
- `searchUsers(query)` - GET /users/search

### Mídias
- `getMedia(filters)` - GET /media
- `getMediaDetails(mediaId)` - GET /media/{media_id}
- `createMedia(data)` - POST /media
- `updateMedia(mediaId, data)` - PUT /media/{media_id}
- `deleteMedia(mediaId)` - DELETE /media/{media_id}
- `searchMedia(query)` - GET /media/search

### Rankings
- `getNationalRanking(period, limit)` - GET /rankings/national
- `getStateRanking(state, period)` - GET /rankings/state
- `getRegionalRanking(city, period)` - GET /rankings/regional
- `getUserRankings()` - GET /rankings/me

### Conexões
- `getConnections()` - GET /connections/me
- `getPendingConnections()` - GET /connections/pending
- `requestConnection(userId)` - POST /connections/request/{user_id}
- `acceptConnection(connectionId)` - PUT /connections/accept/{connection_id}
- `rejectConnection(connectionId)` - PUT /connections/reject/{connection_id}
- `removeConnection(connectionId)` - DELETE /connections/{connection_id}
- `getSharedInterests(userId)` - GET /connections/shared-interests/{user_id}

### Colecionáveis
- `getCollectibles()` - GET /collectibles/me
- `addCollectible(mediaId)` - POST /collectibles
- `getCollectibleDetails(collectibleId)` - GET /collectibles/{collectible_id}

### Atividades
- `logActivity(activity)` - POST /activities
- `getActivities(type)` - GET /activities/me

### Preferências
- `getPreferences()` - GET /preferences/me
- `updatePreferences(prefs)` - PUT /preferences/me

### Recomendações
- `getRecommendationRoulette()` - GET /recommendations/roulette
- `getSimilarMedia(mediaId)` - GET /recommendations/similar/{media_id}

### Rádio
- `getRadios()` - GET /radios
- `getRadioDetails(radioId)` - GET /radios/{radio_id}
- `createRadio(data)` - POST /radios
- `updateRadio(radioId, data)` - PUT /radios/{radio_id}

### Desbloqueios
- `getUnlockedMedia()` - GET /unlocks/me
- `checkAndUnlockMedia(mediaId)` - POST /unlocks/check/{media_id}

## Exemplo de Uso Completo

```typescript
'use client';

import { useEffect, useState } from 'react';
import apiService from '@/lib/apiService';

export default function MyComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Verificar autenticação
        if (!apiService.isAuthenticated()) {
          // Redirecionar para login
          return;
        }

        // Carregar dados do usuário
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!user) return <div>Usuário não encontrado</div>;

  return <div>{user.name}</div>;
}
```

## Notas Importantes

1. **Token Storage**: O token é armazenado em `localStorage`. Para aplicações com requisitos de segurança mais rigorosos, considere usar cookies seguros.

2. **CORS**: Certifique-se de que a API backend está configurada para aceitar requisições CORS do domínio do frontend.

3. **Erro 401**: Quando o token expira, o usuário é automaticamente redirecionado para `/auth`.

4. **Offline**: O serviço não tem tratamento de modo offline. Considere adicionar se necessário.

5. **Cache**: Não há implementação de cache. Cada chamada é feita diretamente ao servidor.

## Checklist de Integração Completada

- ✅ Autenticação (`/auth`)
- ✅ Perfil (`/perfil`)
- ✅ Home (`/home`)
- ✅ Buscar (`/buscar`)
- ✅ Rankings (`/rankings`)
- ✅ Cards (`/cards`)
- ✅ Conexões (`/conexoes`)
- ✅ Explorador (`/explorador`)
- ✅ Player (`/player/[id]`)
- ⚪ Rádio (`/radio`) - Usa API externa, apiService disponível para funcionalidades futuras

## Próximos Passos

1. Testar todas as integrações com o backend
2. Implementar tratamento de erros mais específicos
3. Adicionar loading states globais
4. Implementar refresh automático de token
5. Adicionar cache com React Query ou SWR
