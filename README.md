# Sistema de Gerenciamento de Ativos de TI

Projeto desenvolvido para o teste tecnico Full-Stack da Startup Academy / UNICEPLAC.

## 1. Objetivo

Construir uma aplicacao Full-Stack para gerenciar equipamentos de laboratorio com:

- API REST para CRUD de equipamentos.
- Persistencia em banco real (MongoDB).
- Dashboard web responsivo com busca e filtros.
- Validacao de campos no cadastro.
- Exportacao de dados em JSON/CSV (desafio extra).

## 2. Stack utilizada

- Backend: NestJS + Mongoose
- Frontend: Next.js (React + App Router)
- Banco: MongoDB
- Linguagem: TypeScript

## 3. Estrutura do repositorio

```text
.
|- backend/   # API NestJS
|- frontend/  # Interface Next.js
|- docs/      # Documentacao tecnica e decisoes
`- docker-compose.yml
```

## 4. Requisitos atendidos

1. CRUD completo de equipamentos (criar, listar, detalhar, atualizar e remover).
2. Filtro por tipo e status via query params.
3. Persistencia em MongoDB (sem dados em memoria).
4. Dashboard com busca simples por nome.
5. Formulario de cadastro com validacao.
6. Interface responsiva para desktop e mobile.
7. Script de exportacao para JSON e CSV.

## 5. Como executar localmente

### 5.1 Pre-requisitos

- Node.js 20+
- NPM 10+
- MongoDB local (ou remoto)

### 5.2 Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

API disponivel em: `http://localhost:3001`

### 5.3 Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Aplicacao disponivel em: `http://localhost:3000`

## 6. Exportacao de relatorio (desafio extra)

No backend:

```bash
npm run export:json
npm run export:csv
npm run export:all
```

Os arquivos sao gerados na pasta `backend/exports`.

## 7. Qualidade tecnica

- Validacao de entrada com `class-validator`.
- Tratamento de erro com respostas apropriadas.
- Separacao de responsabilidades (controller, service, schema, dto).
- Padrao de codigo validado com ESLint.

## 8. Documentacao complementar

- `docs/ARQUITETURA.md`
- `docs/DECISOES.md`
- `docs/API.md`
