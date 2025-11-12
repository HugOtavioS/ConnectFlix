# Como Testar a API no Postman

## 📖 Passo a Passo Completo

### 1️⃣ Registrar um Novo Usuário

**URL:**
```
POST http://localhost:8000/api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "joao_silva",
  "email": "joao@example.com",
  "password": "senha123",
  "password_confirmation": "senha123",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil"
}
```

**Resposta esperada (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "joao_silva",
    "email": "joao@example.com",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 1,
    "xp": 0,
    "created_at": "2025-11-12T10:30:00.000000Z",
    "updated_at": "2025-11-12T10:30:00.000000Z"
  },
  "token": "1|abc123defGHI456jklMNO789pqrSTUvwxYZ"
}
```

**⚠️ IMPORTANTE:** Copie o valor do `token` para usar nas próximas requisições!

---

### 2️⃣ Login com Email e Senha

Se você já tem um usuário cadastrado, pode fazer login assim:

**URL:**
```
POST http://localhost:8000/api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta esperada (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "joao_silva",
    "email": "joao@example.com",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "level": 1,
    "xp": 0,
    "created_at": "2025-11-12T10:30:00.000000Z",
    "updated_at": "2025-11-12T10:30:00.000000Z"
  },
  "token": "1|abc123defGHI456jklMNO789pqrSTUvwxYZ"
}
```

---

### 3️⃣ Configurar o Token no Postman

Agora você precisa usar este token em todas as requisições protegidas.

#### Opção A: Header Manual

1. Vá para a aba **"Headers"**
2. Adicione:
   - **Key:** `Authorization`
   - **Value:** `Bearer 1|abc123defGHI456jklMNO789pqrSTUvwxYZ`

#### Opção B: Usar a Aba Authorization (Recomendado)

1. Vá para a aba **"Authorization"**
2. Selecione **"Bearer Token"** no dropdown
3. Cole o token no campo **"Token"** (SEM "Bearer " na frente):
   ```
   1|abc123defGHI456jklMNO789pqrSTUvwxYZ
   ```
4. O Postman adicionará `Authorization: Bearer {token}` automaticamente

---

### 4️⃣ Testar uma Rota Protegida

Agora que você tem o token, pode acessar rotas protegidas.

**URL:**
```
GET http://localhost:8000/api/users/me
```

**Headers:**
- Se usou Opção B (Bearer Token), o Postman já adiciona automaticamente
- Se usou Opção A, certifique-se que o header está presente

**Resposta esperada (200):**
```json
{
  "id": 1,
  "username": "joao_silva",
  "email": "joao@example.com",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "level": 1,
  "xp": 0,
  "created_at": "2025-11-12T10:30:00.000000Z",
  "updated_at": "2025-11-12T10:30:00.000000Z"
}
```

---

## 🧪 Testes Básicos

### ✅ Teste 1: Registrar Usuário
- Método: POST
- URL: `http://localhost:8000/api/auth/register`
- Resultado esperado: Status 201, recebe token

### ✅ Teste 2: Login
- Método: POST
- URL: `http://localhost:8000/api/auth/login`
- Resultado esperado: Status 200, recebe token

### ✅ Teste 3: Acessar Dados Pessoais
- Método: GET
- URL: `http://localhost:8000/api/users/me`
- Headers: `Authorization: Bearer {token}`
- Resultado esperado: Status 200, retorna dados do usuário

### ✅ Teste 4: Atualizar Perfil
- Método: PUT
- URL: `http://localhost:8000/api/users/me`
- Headers: `Authorization: Bearer {token}`
- Body:
  ```json
  {
    "username": "joao_silva_atualizado",
    "city": "Rio de Janeiro",
    "state": "RJ"
  }
  ```
- Resultado esperado: Status 200, dados atualizados

### ✅ Teste 5: Logout
- Método: POST
- URL: `http://localhost:8000/api/auth/logout`
- Headers: `Authorization: Bearer {token}`
- Resultado esperado: Status 200, token fica inválido

---

## ❌ Troubleshooting

### Erro: 401 Unauthorized

**Causa:** Token inválido, ausente ou expirado

**Solução:**
1. Verifique se o token está no header `Authorization: Bearer {token}`
2. Copie o token exato da resposta de registro/login (sem espaços)
3. Faça login novamente para obter um novo token

### Erro: 422 Validation Error

**Causa:** Dados inválidos ou campos obrigatórios faltando

**Solução:**
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Valide o formato dos dados (email válido, senhas correspondem, etc.)
3. Leia a mensagem de erro detalhada na resposta

### Erro: 404 Route Not Found

**Causa:** URL digitada incorretamente

**Solução:**
1. Verifique a URL (sensível a maiúsculas/minúsculas)
2. Prefixo `/api` deve estar presente
3. Confira o método HTTP (GET, POST, PUT, etc.)

---

## 📋 Checklist para Testar sua API

Antes de considerar a API pronta:

- [ ] Consegui registrar um novo usuário?
- [ ] O token foi retornado na resposta?
- [ ] Consegui fazer login com email e senha?
- [ ] Consegui acessar `/api/users/me` com o token?
- [ ] Consegui atualizar meu perfil com PUT `/api/users/me`?
- [ ] Consegui fazer logout e o token ficou inválido?
- [ ] Rotas sem token retornam 401 Unauthorized?
- [ ] Rotas inexistentes retornam 404 Not Found?

---

## 🔗 Próximos Passos

Depois de testar os endpoints básicos, teste:

1. **Preferências:** GET/PUT `/api/preferences/me`
2. **Mídias:** GET `/api/media`, GET `/api/media/{id}`
3. **Atividades:** POST `/api/activities`, GET `/api/activities/me`
4. **Conexões:** GET `/api/connections/me`, POST `/api/connections/request/{user_id}`
5. **Colecionáveis:** GET `/api/collectibles/me`, POST `/api/collectibles`

---

## 💾 Dica: Salvar Token em Variável do Postman

Para facilitar, você pode salvar o token em uma variável do Postman:

1. Na resposta de login, clique em **"Tests"**
2. Adicione:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.token);
   ```
3. Agora em qualquer requisição, use `{{token}}` no header Authorization
4. Cada login/registro atualizará automaticamente a variável

---

**Data:** 12 de novembro de 2025
