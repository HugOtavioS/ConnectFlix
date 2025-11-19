# Como executar o projeto ConnectFlix

Este documento descreve, em português, como preparar e executar o projeto localmente no Windows, incluindo dependências, instalação, configuração de ambiente, banco de dados, execução em desenvolvimento e build para produção.

**Pré-requisitos**:
- **PHP**: >= 8.2
- **Composer**: 2.x (Composer CLI)
- **Node.js**: recomendado >= 18.x (compatível com `vite` e dependências modernas)
- **npm** (vem com Node) ou **pnpm/yarn** (opcional)
- **Banco de dados**: MySQL/MariaDB/Postgres ou `sqlite` para desenvolvimento rápido
- **Git** (para clonar/atualizar o repositório)

**Dependências principais (extraídas dos manifests)**:
- Composer (PHP):
  - **php**: `^8.2`
  - **laravel/framework**: `^12.0`
  - **laravel/sanctum**: `^4.0`
  - **laravel/tinker**: `^2.10.1`
  - dev: `fakerphp/faker`, `laravel/pail`, `laravel/pint`, `laravel/sail`, `mockery/mockery`, `nunomaduro/collision`, `phpunit/phpunit`
- NPM (JS):
  - **vite**: `^7.0.7`
  - **tailwindcss**: `^4.0.0`
  - **laravel-vite-plugin**: `^2.0.0`
  - **axios**, **concurrently**, `@tailwindcss/vite`

**Passos de instalação (Windows)**

1. Abra o terminal (PowerShell, CMD ou Git Bash) na pasta do projeto:

```bash
cd "e:\ADS\1_Projetos\Semestre_2\1_Front\ConnectFlix_ - Copia"
```

2. Instale dependências PHP via Composer:

```bash
composer install
```

3. Instale dependências Node:

```bash
npm install
# ou
# pnpm install
# ou
# yarn install
```

4. Copie o arquivo de ambiente e gere a chave da aplicação:

```bash
copy .env.example .env   # PowerShell/CMD
# ou no Git Bash
# cp .env.example .env

php artisan key:generate
```

5. Configure as variáveis de ambiente no `.env`:
- Configure `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` conforme seu banco.
- Para um teste rápido com SQLite, edite `.env`:

```env
DB_CONNECTION=mysql
```

6. Execute as migrations (e opcionalmente seeders):

```bash
php artisan migrate --seed

```

Se estiver usando um ambiente onde `--force` é necessário (CI/produção), adicione `--force`.

**Executando em desenvolvimento**

O projeto já possui scripts no `composer.json` e `package.json`. Exemplos úteis:

- Rodar servidor Laravel + Vite em paralelo (script `dev` do `composer.json`):

```bash
composer run dev
```

Este script usa `concurrently` para rodar `php artisan serve`, `php artisan queue:listen` e `npm run dev` juntos. Alternativamente rode manualmente:

```bash
php artisan serve --host=127.0.0.1 --port=8000
npm run dev
# Em outro terminal se necessário:
php artisan queue:listen
```

- Rodar apenas o Vite (frontend):

```bash
npm run dev
```

**Build para produção**

Gere os assets com Vite e otimize:

```bash
npm run build
# Depois, no backend:
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Executando testes**

```bash
php artisan test
# ou
composer test
```

**Tarefas úteis / scripts**
- `composer run setup` — tenta automatizar instalação, key generation, migrations e build (veja o `composer.json` para detalhes).
- `composer run dev` — executa o modo de desenvolvimento descrito acima.

**Dicas para Windows**
- Use PowerShell ou Git Bash para comandos unix-like.
- Ao editar `.env` no Windows, garanta que o caminho do SQLite esteja correto (use caminhos absolutos se necessário).

**Problemas comuns & solução rápida**
- Erro de permissão em `storage`/`bootstrap/cache`: ajuste permissões (Windows raramente precisa, mas verifique o antivírus).
- `php artisan migrate` falha: verifique credenciais do banco e se o servidor do DB está ativo.
- Vite não atualiza: pare o processo e rode `npm run dev` novamente.

**Observações finais**
- As versões principais do projeto foram extraídas de `composer.json` e `package.json` e estão listadas acima.
- Se desejar, posso:
  - Adicionar um script PowerShell `run-dev.ps1` para facilitar o start no Windows;
  - Atualizar o `README.md` principal com um resumo e link para este arquivo.

---
Arquivo criado: `EXECUTAR_PROJETO.md` no diretório do projeto.
