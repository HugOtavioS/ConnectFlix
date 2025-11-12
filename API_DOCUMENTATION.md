# Documentação Completa da API ConnectFlix

## Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Rotas Públicas](#rotas-públicas)
4. [Rotas Autenticadas](#rotas-autenticadas)
5. [Rotas de Admin](#rotas-de-admin)
6. [Códigos HTTP](#códigos-http)
7. [Estrutura de Erros](#estrutura-de-erros)

---

## Visão Geral

A API ConnectFlix é uma API REST construída com **Laravel 11** e utiliza autenticação baseada em **tokens Sanctum**.

**Base URL:** `http://localhost:8000/api`

**Headers Padrão (para requisições):**
```
Content-Type: application/json
Accept: application/json
```

**Headers de Autenticação (para rotas protegidas):**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

---

## Autenticação

O sistema utiliza **Laravel Sanctum** para autenticação token-based. Todos os tokens são armazenados na tabela `personal_access_tokens`.

### Fluxo de Autenticação

1. Usuário faz **register** ou **login**
2. API retorna um **token** (string aleatória)
3. Usuário inclui este token no header `Authorization: Bearer {token}` em todas as requisições protegidas
4. Sanctum valida o token no banco de dados automaticamente
5. Se válido, o middleware `auth:sanctum` autenticará o usuário

---

## Rotas Públicas

Estas rotas **NÃO REQUEREM** autenticação.

### 1. Registrar Novo Usuário

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:**
```json
{
  "username": "joao_silva",
  "email": "joao@example.com",
  "password": "senha123456",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil"
}
```

**Campos Obrigatórios:**
| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| username | string | Nome de usuário único | max:50, único |
| email | string | Email único | max:100, email válido, único |
| password | string | Senha | min:6 |

**Campos Opcionais:**
| Campo | Tipo | Descrição | Padrão |
|-------|------|-----------|--------|
| city | string | Cidade | null |
| state | string | Estado/Região | null |
| country | string | País | "Brasil" |

**Exemplo de Resposta Sucesso (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 5,
    "username": "joao_silva",
    "email": "joao@example.com",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 1,
    "xp": 0,
    "created_at": "2025-11-12T20:30:45.000000Z",
    "updated_at": "2025-11-12T20:30:45.000000Z"
  },
  "token": "5|B8sKgCGCls4HpO3PWGQ69aOD5cPxAHtjWdTN2wBT4ccd5870"
}
```

**Exemplo de Resposta Erro (422 Unprocessable Entity):**
```json
{
  "message": "Validation error",
  "errors": {
    "username": ["The username has already been taken."],
    "email": ["The email has already been taken."]
  }
}
```

---

### 2. Fazer Login

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:**
```json
{
  "email": "joao@example.com",
  "password": "senha123456"
}
```

**Campos Obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| email | string | Email do usuário |
| password | string | Senha do usuário |

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 5,
    "username": "joao_silva",
    "email": "joao@example.com",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 15,
    "xp": 3500,
    "created_at": "2025-11-12T20:30:45.000000Z",
    "updated_at": "2025-11-12T20:30:45.000000Z"
  },
  "token": "6|A9tLkXyZpQ2mN5rS8uV3wXyZaBcDeF4gHiJkLmNoPqRs"
}
```

**Exemplo de Resposta Erro (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Listar Categorias

**Endpoint:** `GET /api/categories`

**Headers:**
```
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Ação",
    "created_at": "2025-11-08T21:41:14.000000Z",
    "updated_at": "2025-11-08T21:41:14.000000Z"
  },
  {
    "id": 2,
    "name": "Comédia",
    "created_at": "2025-11-08T21:41:14.000000Z",
    "updated_at": "2025-11-08T21:41:14.000000Z"
  },
  {
    "id": 3,
    "name": "Drama",
    "created_at": "2025-11-08T21:41:14.000000Z",
    "updated_at": "2025-11-08T21:41:14.000000Z"
  }
]
```

---

### 4. Listar Atores

**Endpoint:** `GET /api/actors`

**Headers:**
```
Accept: application/json
```

**Parâmetros Query (Opcionais):**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| query | string | Filtrar atores por nome (busca parcial) |

**Exemplo de Requisição com Parâmetro:**
```
GET /api/actors?query=tom
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Tom Cruise",
    "created_at": "2025-11-08T21:45:10.000000Z",
    "updated_at": "2025-11-08T21:45:10.000000Z"
  },
  {
    "id": 15,
    "name": "Tom Hardy",
    "created_at": "2025-11-08T21:45:10.000000Z",
    "updated_at": "2025-11-08T21:45:10.000000Z"
  },
  {
    "id": 42,
    "name": "Tom Hanks",
    "created_at": "2025-11-08T21:45:10.000000Z",
    "updated_at": "2025-11-08T21:45:10.000000Z"
  }
]
```

---

## Rotas Autenticadas

Estas rotas **REQUEREM** autenticação com Bearer token.

**Headers Obrigatórios:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

---

### Autenticação

#### 1. Fazer Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:** Vazio

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Exemplo de Resposta Erro (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

---

### Usuários

#### 1. Obter Dados do Usuário Autenticado

**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "id": 5,
  "username": "joao_silva",
  "email": "joao@example.com",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "level": 15,
  "xp": 3500,
  "created_at": "2025-11-12T20:30:45.000000Z",
  "updated_at": "2025-11-12T20:30:45.000000Z",
  "preferences": {
    "user_id": 5,
    "favorite_categories": [1, 3, 5],
    "favorite_actors": [10, 25, 40],
    "updated_at": "2025-11-10T15:20:30.000000Z"
  }
}
```

---

#### 2. Atualizar Dados do Usuário Autenticado

**Endpoint:** `PUT /api/users/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:**
```json
{
  "username": "novo_username",
  "city": "Rio de Janeiro",
  "state": "RJ",
  "country": "Brasil"
}
```

**Campos Atualizáveis (Todos Opcionais):**
| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| username | string | Novo nome de usuário | max:50, único |
| city | string | Nova cidade | max:100 |
| state | string | Novo estado | max:100 |
| country | string | Novo país | max:100 |

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 5,
    "username": "novo_username",
    "email": "joao@example.com",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "country": "Brasil",
    "level": 15,
    "xp": 3500,
    "created_at": "2025-11-12T20:30:45.000000Z",
    "updated_at": "2025-11-12T21:15:30.000000Z"
  }
}
```

---

#### 3. Obter Dados Públicos de um Usuário

**Endpoint:** `GET /api/users/{user_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| user_id | integer | ID do usuário a consultar |

**Exemplo de Requisição:**
```
GET /api/users/5
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "id": 5,
  "username": "joao_silva",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "level": 15,
  "xp": 3500
}
```

**Exemplo de Resposta Erro (404 Not Found):**
```json
{
  "message": "404 Not Found"
}
```

---

#### 4. Buscar Usuários

**Endpoint:** `GET /api/users/search`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| q | string | Sim | Termo de busca (busca em username e email) |

**Exemplo de Requisição:**
```
GET /api/users/search?q=joao
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 5,
    "username": "joao_silva",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 15,
    "xp": 3500
  },
  {
    "id": 8,
    "username": "joao_costa",
    "city": "Belo Horizonte",
    "state": "MG",
    "country": "Brasil",
    "level": 8,
    "xp": 1200
  }
]
```

**Exemplo de Resposta Erro (422 Unprocessable Entity):**
```json
{
  "message": "Query parameter (q) is required"
}
```

---

### Preferências

#### 1. Obter Preferências do Usuário Autenticado

**Endpoint:** `GET /api/preferences/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "user_id": 5,
  "favorite_categories": [1, 3, 5, 8],
  "favorite_actors": [10, 25, 40, 55],
  "updated_at": "2025-11-10T15:20:30.000000Z"
}
```

**Nota:** Se o usuário não tiver preferências, a API criará um registro vazio automaticamente.

---

#### 2. Atualizar Preferências do Usuário Autenticado

**Endpoint:** `PUT /api/preferences/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:**
```json
{
  "favorite_categories": [1, 3, 5, 8, 12],
  "favorite_actors": [10, 25, 40, 55, 70]
}
```

**Campos (Ambos Opcionais):**
| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| favorite_categories | array | Array de IDs de categorias | cada ID deve existir em categories |
| favorite_actors | array | Array de IDs de atores | cada ID deve existir em actors |

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "user_id": 5,
    "favorite_categories": [1, 3, 5, 8, 12],
    "favorite_actors": [10, 25, 40, 55, 70],
    "updated_at": "2025-11-12T21:30:15.000000Z"
  }
}
```

---

### Mídia

#### 1. Listar Todas as Mídias

**Endpoint:** `GET /api/media`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros Query (Opcionais):**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| type | string | Filtrar por tipo: "movie" ou "series" |
| category_id | integer | Filtrar por categoria |
| actor_id | integer | Filtrar por ator |
| page | integer | Número da página (padrão: 1) |

**Exemplo de Requisição com Filtros:**
```
GET /api/media?type=movie&category_id=1&page=1
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Top Gun: Maverick",
      "type": "movie",
      "description": "Maverick enfrenta seu passado e novos desafios.",
      "year": 2022,
      "duration": 130,
      "rating": 8.3,
      "poster_url": "https://example.com/top-gun.jpg",
      "created_at": "2025-11-08T21:41:14.000000Z",
      "updated_at": "2025-11-08T21:41:14.000000Z",
      "categories": [
        {
          "id": 1,
          "name": "Ação",
          "pivot": {
            "media_id": 1,
            "category_id": 1
          }
        }
      ],
      "actors": [
        {
          "id": 1,
          "name": "Tom Cruise",
          "pivot": {
            "media_id": 1,
            "actor_id": 1
          }
        }
      ]
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/media?page=1",
    "last": "http://localhost:8000/api/media?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/media?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "http://localhost:8000/api/media",
    "per_page": 20,
    "to": 20,
    "total": 95
  }
}
```

---

#### 2. Obter Detalhes de uma Mídia

**Endpoint:** `GET /api/media/{media_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| media_id | integer | ID da mídia |

**Exemplo de Requisição:**
```
GET /api/media/1
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "id": 1,
  "title": "Top Gun: Maverick",
  "type": "movie",
  "description": "Maverick enfrenta seu passado e novos desafios.",
  "year": 2022,
  "duration": 130,
  "rating": 8.3,
  "poster_url": "https://example.com/top-gun.jpg",
  "created_at": "2025-11-08T21:41:14.000000Z",
  "updated_at": "2025-11-08T21:41:14.000000Z",
  "categories": [
    {
      "id": 1,
      "name": "Ação"
    }
  ],
  "actors": [
    {
      "id": 1,
      "name": "Tom Cruise"
    }
  ]
}
```

---

#### 3. Buscar Mídias

**Endpoint:** `GET /api/media/search`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| q | string | Sim | Termo de busca (busca em title e description) |

**Exemplo de Requisição:**
```
GET /api/media/search?q=top+gun
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Top Gun: Maverick",
    "type": "movie",
    "description": "Maverick enfrenta seu passado e novos desafios.",
    "year": 2022,
    "duration": 130,
    "rating": 8.3,
    "poster_url": "https://example.com/top-gun.jpg",
    "categories": [
      {
        "id": 1,
        "name": "Ação"
      }
    ],
    "actors": [
      {
        "id": 1,
        "name": "Tom Cruise"
      }
    ]
  }
]
```

---

#### 4. Obter Categorias de uma Mídia

**Endpoint:** `GET /api/media/{media_id}/categories`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| media_id | integer | ID da mídia |

**Exemplo de Requisição:**
```
GET /api/media/1/categories
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Ação",
    "pivot": {
      "media_id": 1,
      "category_id": 1
    }
  }
]
```

---

#### 5. Obter Atores de uma Mídia

**Endpoint:** `GET /api/media/{media_id}/actors`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| media_id | integer | ID da mídia |

**Exemplo de Requisição:**
```
GET /api/media/1/actors
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Tom Cruise",
    "pivot": {
      "media_id": 1,
      "actor_id": 1
    }
  },
  {
    "id": 5,
    "name": "Miles Teller",
    "pivot": {
      "media_id": 1,
      "actor_id": 5
    }
  }
]
```

---

### Atividades

#### 1. Registrar Nova Atividade

**Endpoint:** `POST /api/activities`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:**
```json
{
  "media_id": 1,
  "activity_type": "watch",
  "duration_seconds": 7800
}
```

**Campos:**
| Campo | Tipo | Obrigatório | Descrição | Validação |
|-------|------|-------------|-----------|-----------|
| media_id | integer | Não* | ID da mídia assistida | deve existir em media |
| activity_type | string | Sim | Tipo de atividade | "watch" ou "stay" |
| duration_seconds | integer | Sim | Duração em segundos | mínimo 1 |

*media_id é tecnicamente opcional, mas recomendado.

**Exemplo de Resposta Sucesso (201 Created):**
```json
{
  "message": "Activity recorded successfully",
  "activity": {
    "id": 1,
    "user_id": 5,
    "media_id": 1,
    "activity_type": "watch",
    "duration_seconds": 7800,
    "timestamp": "2025-11-12T21:45:30.000000Z"
  }
}
```

---

#### 2. Obter Atividades do Usuário Autenticado

**Endpoint:** `GET /api/activities/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros Query (Opcionais):**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| type | string | Filtrar por tipo: "watch" ou "stay" |
| page | integer | Número da página (padrão: 1) |

**Exemplo de Requisição:**
```
GET /api/activities/me?type=watch&page=1
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "media_id": 1,
      "activity_type": "watch",
      "duration_seconds": 7800,
      "timestamp": "2025-11-12T21:45:30.000000Z",
      "media": {
        "id": 1,
        "title": "Top Gun: Maverick",
        "type": "movie",
        "rating": 8.3
      }
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/activities/me?page=1",
    "last": "http://localhost:8000/api/activities/me?page=3",
    "prev": null,
    "next": "http://localhost:8000/api/activities/me?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "path": "http://localhost:8000/api/activities/me",
    "per_page": 20,
    "to": 20,
    "total": 45
  }
}
```

---

### Coletáveis

#### 1. Obter Coletáveis do Usuário Autenticado

**Endpoint:** `GET /api/collectibles/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "card": {
      "id": 1,
      "type": "media",
      "related_id": 1,
      "name": "Top Gun: Maverick",
      "description": "Maverick enfrenta seu passado...",
      "rarity": "common",
      "points_value": 10,
      "image_url": "https://example.com/top-gun.jpg"
    },
    "count": 3,
    "counters": {
      "media_id": 1,
      "media_title": "Top Gun: Maverick",
      "categories": [1],
      "actors": [1, 5],
      "collected_at": "2025-11-12T21:30:00"
    }
  }
]
```

---

#### 2. Adicionar Novo Coletável

**Endpoint:** `POST /api/collectibles`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:**
```json
{
  "media_id": 1
}
```

**Campos:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| media_id | integer | Sim | ID da mídia para criar coletável |

**Exemplo de Resposta Sucesso (201 Created):**
```json
{
  "message": "Collectible added successfully",
  "collectible": {
    "id": 5,
    "user_id": 5,
    "card_id": 1,
    "media_id": 1,
    "counters": {
      "media_id": 1,
      "media_title": "Top Gun: Maverick",
      "categories": [1],
      "actors": [1, 5],
      "collected_at": "2025-11-12T21:45:30"
    },
    "created_at": "2025-11-12T21:45:30.000000Z",
    "updated_at": "2025-11-12T21:45:30.000000Z",
    "card": {
      "id": 1,
      "type": "media",
      "name": "Top Gun: Maverick"
    },
    "media": {
      "id": 1,
      "title": "Top Gun: Maverick",
      "type": "movie"
    }
  }
}
```

---

#### 3. Obter Detalhes de um Coletável

**Endpoint:** `GET /api/collectibles/{collectible_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| collectible_id | integer | ID do coletável |

**Exemplo de Requisição:**
```
GET /api/collectibles/5
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "id": 5,
  "user_id": 5,
  "card_id": 1,
  "media_id": 1,
  "counters": {
    "media_id": 1,
    "media_title": "Top Gun: Maverick",
    "categories": [1],
    "actors": [1, 5],
    "collected_at": "2025-11-12T21:45:30"
  },
  "created_at": "2025-11-12T21:45:30.000000Z",
  "updated_at": "2025-11-12T21:45:30.000000Z",
  "card": {...},
  "media": {...},
  "user": {...}
}
```

---

### Conexões (Amigos)

#### 1. Obter Conexões Aceitas do Usuário Autenticado

**Endpoint:** `GET /api/connections/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "user": {
      "id": 8,
      "username": "maria_santos",
      "email": "maria@example.com",
      "city": "Curitiba",
      "state": "PR",
      "country": "Brasil",
      "level": 12,
      "xp": 2500
    },
    "status": "accepted",
    "created_at": "2025-11-10T10:30:00.000000Z"
  }
]
```

---

#### 2. Obter Requisições de Conexão Pendentes

**Endpoint:** `GET /api/connections/pending`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 2,
    "user": {
      "id": 10,
      "username": "carlos_oliveira",
      "email": "carlos@example.com",
      "city": "Salvador",
      "state": "BA",
      "country": "Brasil",
      "level": 8,
      "xp": 1800
    },
    "status": "pending",
    "created_at": "2025-11-12T19:20:00.000000Z"
  }
]
```

---

#### 3. Enviar Requisição de Conexão

**Endpoint:** `POST /api/connections/request/{user_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| user_id | integer | ID do usuário a conectar |

**Corpo da Requisição:** Vazio

**Exemplo de Requisição:**
```
POST /api/connections/request/10
```

**Exemplo de Resposta Sucesso (201 Created):**
```json
{
  "message": "Connection request sent",
  "connection": {
    "id": 3,
    "user_id1": 5,
    "user_id2": 10,
    "status": "pending",
    "created_at": "2025-11-12T21:50:00.000000Z",
    "user2": {
      "id": 10,
      "username": "carlos_oliveira",
      "email": "carlos@example.com"
    }
  }
}
```

**Exemplos de Resposta Erro:**

Erro - Tentar conectar a si mesmo (422 Unprocessable Entity):
```json
{
  "message": "Cannot send connection request to yourself"
}
```

Erro - Conexão já existe (422 Unprocessable Entity):
```json
{
  "message": "Connection already exists"
}
```

---

#### 4. Aceitar Requisição de Conexão

**Endpoint:** `PUT /api/connections/accept/{connection_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| connection_id | integer | ID da conexão pendente |

**Corpo da Requisição:** Vazio

**Exemplo de Requisição:**
```
PUT /api/connections/accept/2
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Connection accepted",
  "connection": {
    "id": 2,
    "user_id1": 10,
    "user_id2": 5,
    "status": "accepted",
    "created_at": "2025-11-12T19:20:00.000000Z",
    "user1": {...},
    "user2": {...}
  }
}
```

---

#### 5. Rejeitar Requisição de Conexão

**Endpoint:** `PUT /api/connections/reject/{connection_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| connection_id | integer | ID da conexão pendente |

**Corpo da Requisição:** Vazio

**Exemplo de Requisição:**
```
PUT /api/connections/reject/2
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Connection rejected"
}
```

---

#### 6. Remover Conexão

**Endpoint:** `DELETE /api/connections/{connection_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| connection_id | integer | ID da conexão a remover |

**Exemplo de Requisição:**
```
DELETE /api/connections/1
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Connection removed"
}
```

---

#### 7. Obter Interesses Compartilhados com Outro Usuário

**Endpoint:** `GET /api/connections/shared-interests/{user_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| user_id | integer | ID do usuário para comparar |

**Exemplo de Requisição:**
```
GET /api/connections/shared-interests/8
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "shared_categories": [1, 3, 5],
  "shared_actors": [10, 25]
}
```

---

### Rankings

#### 1. Ranking Nacional

**Endpoint:** `GET /api/rankings/national`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros Query (Opcionais):**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| period | string | "week" | Período: "week", "month", "all" |
| limit | integer | 10 | Quantidade de resultados |

**Exemplo de Requisição:**
```
GET /api/rankings/national?period=week&limit=20
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 5,
    "username": "joao_silva",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 15,
    "xp": 3500,
    "total_duration": 126000
  },
  {
    "id": 8,
    "username": "maria_santos",
    "city": "Curitiba",
    "state": "PR",
    "country": "Brasil",
    "level": 12,
    "xp": 2500,
    "total_duration": 98500
  }
]
```

---

#### 2. Ranking por Estado

**Endpoint:** `GET /api/rankings/state`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| state | string | Sim | Sigla do estado (ex: "SP", "RJ") |
| period | string | Não | Período: "week", "month", "all" (padrão: "week") |
| limit | integer | Não | Quantidade de resultados (padrão: 10) |

**Exemplo de Requisição:**
```
GET /api/rankings/state?state=SP&period=month&limit=15
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 5,
    "username": "joao_silva",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 15,
    "xp": 3500,
    "total_duration": 126000
  }
]
```

**Exemplo de Resposta Erro (422 Unprocessable Entity):**
```json
{
  "message": "State parameter is required"
}
```

---

#### 3. Ranking Regional (por Cidade)

**Endpoint:** `GET /api/rankings/regional`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| city | string | Sim | Nome da cidade |
| period | string | Não | Período: "week", "month", "all" (padrão: "week") |
| limit | integer | Não | Quantidade de resultados (padrão: 10) |

**Exemplo de Requisição:**
```
GET /api/rankings/regional?city=São+Paulo&period=all&limit=5
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 5,
    "username": "joao_silva",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 15,
    "xp": 3500,
    "total_duration": 126000
  }
]
```

---

#### 4. Posição do Usuário Autenticado em Rankings

**Endpoint:** `GET /api/rankings/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "national_rank": 42,
  "state_rank": 5,
  "regional_rank": 2
}
```

---

### Desbloqueios (Unlocks)

#### 1. Obter Mídias Desbloqueadas

**Endpoint:** `GET /api/unlocks/me`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Top Gun: Maverick",
    "type": "movie",
    "description": "Maverick enfrenta seu passado...",
    "year": 2022,
    "duration": 130,
    "rating": 8.3,
    "poster_url": "https://example.com/top-gun.jpg",
    "categories": [...],
    "actors": [...]
  }
]
```

---

#### 2. Verificar Desbloqueio de Uma Mídia

**Endpoint:** `POST /api/unlocks/check/{media_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Content-Type: application/json
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| media_id | integer | ID da mídia a verificar |

**Corpo da Requisição:** Vazio

**Exemplo de Requisição:**
```
POST /api/unlocks/check/2
```

**Exemplos de Resposta:**

Sucesso - Mídia desbloqueada (200 OK):
```json
{
  "message": "Media unlocked successfully",
  "unlocked": true
}
```

Sucesso - Mídia já estava desbloqueada (200 OK):
```json
{
  "message": "Media already unlocked",
  "unlocked": true
}
```

Sucesso - Critério não atendido (200 OK):
```json
{
  "message": "Unlock criteria not met",
  "unlocked": false
}
```

---

### Rádios

#### 1. Listar Todas as Rádios

**Endpoint:** `GET /api/radios`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Rádio XFM",
    "stream_url": "https://stream.radiox.fm/stream",
    "description": "Melhor rádio de rock do Brasil",
    "created_at": "2025-11-08T21:51:37.000000Z",
    "updated_at": "2025-11-08T21:51:37.000000Z"
  },
  {
    "id": 2,
    "name": "Rádio Pop Brasil",
    "stream_url": "https://stream.radiobr.fm/pop",
    "description": "Músicas pop atuais",
    "created_at": "2025-11-08T21:51:37.000000Z",
    "updated_at": "2025-11-08T21:51:37.000000Z"
  }
]
```

---

#### 2. Obter Detalhes de uma Rádio

**Endpoint:** `GET /api/radios/{radio_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| radio_id | integer | ID da rádio |

**Exemplo de Requisição:**
```
GET /api/radios/1
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "id": 1,
  "name": "Rádio XFM",
  "stream_url": "https://stream.radiox.fm/stream",
  "description": "Melhor rádio de rock do Brasil",
  "created_at": "2025-11-08T21:51:37.000000Z",
  "updated_at": "2025-11-08T21:51:37.000000Z"
}
```

---

### Recomendações

#### 1. Rouleta de Recomendações

**Endpoint:** `GET /api/recommendations/roulette`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros:** Nenhum

**Descrição:** Retorna uma mídia aleatória baseada nas preferências do usuário. Se o usuário não tiver preferências, retorna qualquer mídia aleatória.

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "id": 3,
  "title": "Homem-Aranha: Sem Volta para Casa",
  "type": "movie",
  "description": "Peter Parker enfrenta inimigos do multiverso...",
  "year": 2021,
  "duration": 148,
  "rating": 8.0,
  "poster_url": "https://example.com/spider-man.jpg",
  "created_at": "2025-11-08T21:41:14.000000Z",
  "updated_at": "2025-11-08T21:41:14.000000Z",
  "categories": [
    {
      "id": 1,
      "name": "Ação"
    }
  ],
  "actors": [
    {
      "id": 8,
      "name": "Tom Holland"
    }
  ]
}
```

---

#### 2. Obter Mídias Similares

**Endpoint:** `GET /api/recommendations/similar/{media_id}`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| media_id | integer | ID da mídia de referência |

**Exemplo de Requisição:**
```
GET /api/recommendations/similar/1
```

**Exemplo de Resposta Sucesso (200 OK):**
```json
[
  {
    "id": 3,
    "title": "Homem-Aranha: Sem Volta para Casa",
    "type": "movie",
    "description": "Peter Parker enfrenta inimigos do multiverso...",
    "year": 2021,
    "duration": 148,
    "rating": 8.0,
    "poster_url": "https://example.com/spider-man.jpg",
    "categories": [
      {
        "id": 1,
        "name": "Ação"
      }
    ],
    "actors": [
      {
        "id": 8,
        "name": "Tom Holland"
      }
    ]
  },
  {
    "id": 4,
    "title": "Capitão América: O Soldado Invernal",
    "type": "movie",
    "description": "Steve Rogers em sua próxima aventura...",
    "year": 2014,
    "duration": 136,
    "rating": 7.6,
    "poster_url": "https://example.com/captain-america.jpg",
    "categories": [
      {
        "id": 1,
        "name": "Ação"
      }
    ],
    "actors": [
      {
        "id": 15,
        "name": "Chris Evans"
      }
    ]
  }
]
```

---

### Busca Global

#### 1. Buscar em Toda a Plataforma

**Endpoint:** `GET /api/search`

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
Accept: application/json
```

**Parâmetros Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| q | string | Sim | Termo de busca |
| type | string | Não | Tipo de resultado: "media", "users", "all" (padrão: "all") |

**Exemplos de Requisição:**
```
GET /api/search?q=top+gun&type=all
GET /api/search?q=maria&type=users
GET /api/search?q=ação&type=media
```

**Exemplo de Resposta Sucesso (200 OK) - Tipo "all":**
```json
{
  "media": [
    {
      "id": 1,
      "title": "Top Gun: Maverick",
      "type": "movie",
      "description": "Maverick enfrenta seu passado...",
      "year": 2022,
      "duration": 130,
      "rating": 8.3,
      "poster_url": "https://example.com/top-gun.jpg",
      "categories": [...],
      "actors": [...]
    }
  ],
  "users": [
    {
      "id": 5,
      "username": "joao_silva",
      "city": "São Paulo",
      "state": "SP",
      "country": "Brasil",
      "level": 15,
      "xp": 3500
    }
  ]
}
```

---

## Rotas de Admin

Estas rotas **REQUEREM** autenticação E perfil de administrador.

**Headers Obrigatórios:**
```
Authorization: Bearer {seu_token_admin}
Content-Type: application/json
Accept: application/json
```

### Mídia (Admin)

#### 1. Criar Nova Mídia

**Endpoint:** `POST /api/media`

**Headers:**
```
Authorization: Bearer {seu_token_admin}
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:**
```json
{
  "title": "Novo Filme",
  "type": "movie",
  "description": "Uma descrição interessante do filme",
  "year": 2025,
  "duration": 125,
  "rating": 8.5,
  "poster_url": "https://example.com/novo-filme.jpg"
}
```

**Campos Obrigatórios:**
| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| title | string | Título da mídia | max:255 |
| type | string | Tipo de mídia | "movie" ou "series" |

**Campos Opcionais:**
| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| description | string | Descrição | - |
| year | integer | Ano de lançamento | - |
| duration | integer | Duração em minutos | - |
| rating | numeric | Avaliação | 0-10 |
| poster_url | string | URL do poster | URL válida, max:255 |

**Exemplo de Resposta Sucesso (201 Created):**
```json
{
  "message": "Media created successfully",
  "media": {
    "id": 50,
    "title": "Novo Filme",
    "type": "movie",
    "description": "Uma descrição interessante do filme",
    "year": 2025,
    "duration": 125,
    "rating": 8.5,
    "poster_url": "https://example.com/novo-filme.jpg",
    "created_at": "2025-11-12T22:00:00.000000Z",
    "updated_at": "2025-11-12T22:00:00.000000Z"
  }
}
```

---

#### 2. Atualizar Mídia

**Endpoint:** `PUT /api/media/{media_id}`

**Headers:**
```
Authorization: Bearer {seu_token_admin}
Content-Type: application/json
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| media_id | integer | ID da mídia a atualizar |

**Corpo da Requisição:**
```json
{
  "title": "Título Atualizado",
  "rating": 9.0,
  "description": "Nova descrição"
}
```

**Todos os campos são opcionais (semelhante ao criar).**

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Media updated successfully",
  "media": {
    "id": 50,
    "title": "Título Atualizado",
    "type": "movie",
    "description": "Nova descrição",
    "year": 2025,
    "duration": 125,
    "rating": 9.0,
    "poster_url": "https://example.com/novo-filme.jpg",
    "created_at": "2025-11-12T22:00:00.000000Z",
    "updated_at": "2025-11-12T22:05:00.000000Z"
  }
}
```

---

#### 3. Deletar Mídia

**Endpoint:** `DELETE /api/media/{media_id}`

**Headers:**
```
Authorization: Bearer {seu_token_admin}
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| media_id | integer | ID da mídia a deletar |

**Corpo da Requisição:** Vazio

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Media deleted successfully"
}
```

---

### Rádios (Admin)

#### 1. Criar Nova Rádio

**Endpoint:** `POST /api/radios`

**Headers:**
```
Authorization: Bearer {seu_token_admin}
Content-Type: application/json
Accept: application/json
```

**Corpo da Requisição:**
```json
{
  "name": "Rádio Nova",
  "stream_url": "https://stream.nova.fm/stream",
  "description": "A melhor rádio de música eletrônica"
}
```

**Campos Obrigatórios:**
| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| name | string | Nome da rádio | max:100 |
| stream_url | string | URL da stream | URL válida, max:255 |

**Campos Opcionais:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| description | string | Descrição da rádio |

**Exemplo de Resposta Sucesso (201 Created):**
```json
{
  "message": "Radio created successfully",
  "radio": {
    "id": 10,
    "name": "Rádio Nova",
    "stream_url": "https://stream.nova.fm/stream",
    "description": "A melhor rádio de música eletrônica",
    "created_at": "2025-11-12T22:10:00.000000Z",
    "updated_at": "2025-11-12T22:10:00.000000Z"
  }
}
```

---

#### 2. Atualizar Rádio

**Endpoint:** `PUT /api/radios/{radio_id}`

**Headers:**
```
Authorization: Bearer {seu_token_admin}
Content-Type: application/json
Accept: application/json
```

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| radio_id | integer | ID da rádio a atualizar |

**Corpo da Requisição:**
```json
{
  "name": "Rádio Nova - Atualizada",
  "description": "Descrição modificada"
}
```

**Todos os campos são opcionais.**

**Exemplo de Resposta Sucesso (200 OK):**
```json
{
  "message": "Radio updated successfully",
  "radio": {
    "id": 10,
    "name": "Rádio Nova - Atualizada",
    "stream_url": "https://stream.nova.fm/stream",
    "description": "Descrição modificada",
    "created_at": "2025-11-12T22:10:00.000000Z",
    "updated_at": "2025-11-12T22:15:00.000000Z"
  }
}
```

---

## Códigos HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| **200** | OK | Requisição bem-sucedida |
| **201** | Created | Recurso criado com sucesso |
| **204** | No Content | Sucesso sem retorno de dados |
| **400** | Bad Request | Requisição malformada |
| **401** | Unauthorized | Falta ou token inválido |
| **403** | Forbidden | Acesso negado (sem permissão) |
| **404** | Not Found | Recurso não encontrado |
| **422** | Unprocessable Entity | Dados de validação inválidos |
| **500** | Internal Server Error | Erro no servidor |

---

## Estrutura de Erros

### Erro de Validação (422)

```json
{
  "message": "Validation error",
  "errors": {
    "field_name": [
      "The field_name field is required.",
      "The field_name must be a string."
    ]
  }
}
```

### Erro de Autenticação (401)

```json
{
  "message": "Unauthenticated."
}
```

### Erro de Não Encontrado (404)

```json
{
  "message": "404 Not Found"
}
```

### Erro de Recurso Não Encontrado (404)

```json
{
  "message": "No query results for model [App\\Models\\Media]."
}
```

### Erro de Servidor (500)

```json
{
  "message": "Server error message"
}
```

---

## Dicas e Melhores Práticas

### 1. Usando o Token

- Sempre copie o token completo da resposta de login/register
- Inclua exatamente como: `Authorization: Bearer {token}`
- Nunca compartilhe seu token
- Tokens são únicos por usuário

### 2. Paginação

- Rotas com grande volume de dados retornam 20 resultados por página
- Use o parâmetro `page` para navegar: `/api/media?page=2`
- Resposta inclui informações de paginação em `meta` e `links`

### 3. Filtros

- Combine múltiplos filtros na mesma requisição
- Exemplo: `/api/media?type=movie&category_id=1&actor_id=5`

### 4. Tratamento de Erros

- Sempre verifique o status HTTP
- Valide campos obrigatórios antes de enviar
- Trate a mensagem de erro retornada pela API

### 5. Headers Importantes

```
Content-Type: application/json       # Para requisições POST/PUT
Accept: application/json             # Para aceitar JSON nas respostas
Authorization: Bearer {token}        # Para rotas protegidas
```

---

## Contato e Suporte

Para dúvidas sobre a API, consulte a documentação ou entre em contato com o time de desenvolvimento.

