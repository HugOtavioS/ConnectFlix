# Entendendo o Laravel Sanctum - Guia Completo

## O que é Laravel Sanctum?

**Laravel Sanctum** é um sistema de autenticação leve para APIs que funciona com **tokens de API**, não com sessões. Ele substitui completamente o fluxo tradicional de login/logout do Laravel.

---

## 🔑 Como o Sanctum Funciona

### Fluxo Básico

```
1. Cliente faz POST /api/auth/login com credenciais
                    ↓
2. Servidor valida email e senha
                    ↓
3. Se correto: Cria um token único e retorna ao cliente
                    ↓
4. Cliente armazena o token localmente
                    ↓
5. Em requisições futuras: Cliente envia token no header
   Authorization: Bearer {token}
                    ↓
6. Servidor valida o token (sem consultar banco a cada vez)
                    ↓
7. Se válido: Requisição é processada. Se inválido: 401 Unauthorized
```

---

## 📤 Fluxo de Login e Obtenção do Token

### 1️⃣ Requisição de Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

### 2️⃣ Resposta do Servidor (Sucesso)

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@example.com",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 1,
    "xp": 0
  },
  "token": "1|abc123defGHI456jklMNO789pqrSTUvwxYZ"
}
```

**OBS:** Este token é **altamente sensível**. Deve ser armazenado com segurança no cliente!

---

## 🔐 Como Usar o Token

Todas as requisições subsequentes devem incluir o token no header:

```http
GET /api/users/me
Authorization: Bearer 1|abc123defGHI456jklMNO789pqrSTUvwxYZ
Content-Type: application/json
```

### ✅ Exemplo de Requisição com Postman

1. **Abra a aba "Authorization"**
2. **Selecione "Bearer Token"**
3. **Cole o token** (sem "Bearer " na frente, o Postman adiciona automaticamente)
4. **Envie a requisição**

Ou manualmente:

```
Headers:
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ❌ Por Que Você Recebeu o Erro?

O erro `RouteNotFoundException - Route [login] not defined` ocorre quando:

1. **Você não forneceu o token corretamente** no header
2. **O token expirou ou é inválido**
3. **O middleware tentou redirecionar para uma rota "login"** que não existe em uma API

### ⚠️ Importante: Sanctum NÃO Redireciona para Login

Diferente de aplicações web tradicionais, o Sanctum:
- ❌ **NÃO redireciona** para uma página de login
- ❌ **NÃO usa sessões**
- ❌ **NÃO necessita de cookies** (no modo API)
- ✅ **Apenas retorna 401 Unauthorized** se o token for inválido

---

## 🛡️ Proteção com Sanctum

### Middleware de Autenticação

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'updateMe']);
    // ... outras rotas protegidas
});
```

Quando uma requisição chega nessas rotas:

1. ✅ Se token válido → Requisição processada
2. ❌ Se token inválido/ausente → Retorna 401

---

## 📋 Ciclo Completo de Exemplo

### Passo 1: Registrar Novo Usuário

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "joao",
    "email": "joao@example.com",
    "password": "senha123",
    "password_confirmation": "senha123",
    "city": "São Paulo",
    "state": "SP"
  }'
```

**Resposta:**
```json
{
  "message": "User registered successfully",
  "user": { "id": 1, "username": "joao", ... },
  "token": "1|xyz789..."
}
```

### Passo 2: Fazer Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "message": "Login successful",
  "user": { "id": 1, "username": "joao", ... },
  "token": "1|xyz789..."
}
```

### Passo 3: Usar o Token para Acessar Recursos Protegidos

```bash
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer 1|xyz789..." \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "id": 1,
  "username": "joao",
  "email": "joao@example.com",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "level": 1,
  "xp": 0
}
```

### Passo 4: Fazer Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer 1|xyz789..." \
  -H "Content-Type: application/json"
```

**Resposta:**
```json
{
  "message": "Logged out successfully"
}
```

Após logout, o token fica **inválido** e não pode ser usado novamente.

---

## 🔄 Fluxo Técnico Interno

Quando você envia uma requisição com token:

```
1. Sanctum intercepta a requisição
        ↓
2. Extrai o token do header Authorization
        ↓
3. Procura o token na tabela personal_access_tokens
        ↓
4. Se encontrar e não estar expirado:
   - Autentica o usuário associado
   - Define request->user() com aquele usuário
        ↓
5. Middleware 'auth:sanctum' verifica se está autenticado
        ↓
6. Se sim: deixa passar. Se não: retorna 401
```

---

## 📊 Tabela do Banco de Dados

O Sanctum armazena tokens aqui:

```sql
CREATE TABLE personal_access_tokens (
  id BIGINT PRIMARY KEY,
  tokenable_id BIGINT,
  tokenable_type VARCHAR(255),
  name VARCHAR(255),
  token VARCHAR(64) UNIQUE,
  abilities JSON,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## ⚠️ O Erro "Route [login] not defined" - Causas Reais

Este erro pode ocorrer em raros casos quando:

### 1. Token Inválido ou Ausente
Se o token não é enviado ou é inválido, o middleware tenta fazer redirect (mesmo em API).

**Solução:** Sempre envie um token válido no header.

### 2. Middleware Configurado Incorretamente
Se há redirecionamentos hardcoded no código.

**Solução:** Nossa configuração no `bootstrap/app.php` já trata isso.

### 3. Rotas com Nomes Faltando
Se você usa `route('login')` em algum lugar sem definir o nome.

**Solução:** Já adicionamos nomes às rotas de autenticação.

---

## 🚀 Checklist para Testar sua API

- [ ] Você registrou um usuário com sucesso e recebeu um token?
- [ ] Você está enviando o token em todas as requisições protegidas?
- [ ] O header é exatamente: `Authorization: Bearer {token}`?
- [ ] Você não coloca espaços extras ou caracteres inválidos no token?
- [ ] No Postman, você selecionou "Bearer Token" na aba Authorization?
- [ ] O token não expirou (padrão do Sanctum é não expirar, mas você pode configurar)?

---

## 💡 Dicas Importantes

### ✅ Faça Assim
```http
POST /api/auth/login
Content-Type: application/json

{"email": "user@example.com", "password": "senha"}
```

### ❌ Não Faça Assim
```http
GET /api/users/me
(sem header Authorization)
```

### ✅ Faça Assim
```http
GET /api/users/me
Authorization: Bearer 1|abc123...
Content-Type: application/json
```

### ❌ Não Faça Assim
```http
GET /api/users/me?token=1|abc123...
```

---

## 📚 Resumo das Alterações Realizadas

✅ **Nomeamos as rotas de autenticação** (api.login, api.register)
✅ **Melhoramos o tratamento de exceções** no bootstrap/app.php
✅ **Sanctum agora retorna 401 Unauthorized** em vez de tentar fazer redirect
✅ **API está 100% compatível** com requisições Bearer Token

---

## 🔗 Próximas Etapas

1. Teste o registro: `POST /api/auth/register`
2. Copie o token da resposta
3. Use-o em `Authorization: Bearer {token}` para acessar rotas protegidas
4. Teste `GET /api/users/me` para confirmar

Tudo deve funcionar perfeitamente agora! 🎉

---

**Data:** 12 de novembro de 2025
