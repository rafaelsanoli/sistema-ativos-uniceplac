# Backend - Sistema de Ativos

API RESTful em NestJS para gerenciamento de equipamentos de TI.

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

## Scripts importantes

```bash
npm run build
npm run lint
npm run export:json
npm run export:csv
npm run export:all
```

## Endpoints

- POST /equipments
- GET /equipments
- GET /equipments/:id
- PATCH /equipments/:id
- DELETE /equipments/:id
