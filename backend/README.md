# Backend - Sistema de Ativos

API RESTful em NestJS para gerenciamento de equipamentos de TI.

## Recursos implementados

- CRUD completo de equipamentos.
- Filtros por tipo/status e busca por nome.
- Paginacao em listagem.
- Relatorio de resumo operacional.
- Exportacao de equipamentos em CSV e JSON via endpoint.
- Autenticacao JWT com cookie HttpOnly.
- Rate limit global e hardening de seguranca.

## Stack

- NestJS
- Mongoose
- MongoDB
- TypeScript

## Configuracao

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Instale dependencias:

```bash
npm install
```

3. Execute em desenvolvimento:

```bash
npm run start:dev
```

Servidor local: http://localhost:3001

## Variaveis de ambiente obrigatorias

- PORT
- MONGODB_URI
- FRONTEND_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- THROTTLE_TTL
- THROTTLE_LIMIT
- ADMIN_EMAIL
- ADMIN_PASSWORD

Na inicializacao, um usuario admin e criado automaticamente com `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

## Scripts importantes

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

## Escopo atual de testes

- Unitarios: `AuthService`, `EquipmentsService` e `ReportsService`.
- E2E: fluxo de autenticacao via `AuthController`.

## Endpoints

Autenticacao:

- POST /auth/login
- GET /auth/me
- POST /auth/logout

Equipamentos (protegidos):

- POST /equipments
- GET /equipments?page=1&limit=10
- GET /equipments/:id
- PATCH /equipments/:id
- DELETE /equipments/:id

Relatorios (protegidos):

- GET /reports/equipments/summary
- GET /reports/equipments/export?format=csv
- GET /reports/equipments/export?format=json
