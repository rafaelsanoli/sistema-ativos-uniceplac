# Sistema de Gerenciamento de Ativos de TI

Projeto desenvolvido para o teste tecnico Full-Stack da Startup Academy / UNICEPLAC.

## Atualizacao de evolucao tecnica

Depois da versao inicial do desafio, foi realizada uma segunda fase com foco em seguranca, autenticacao, performance e experiencia de uso.

## 1. Objetivo

Construir uma aplicacao Full-Stack para gerenciar equipamentos de laboratorio com:

- API REST para CRUD de equipamentos.
- Persistencia em banco real (MongoDB).
- Dashboard web responsivo com busca, filtros e paginacao.
- Validacao de campos no cadastro.
- Exportacao de dados em JSON/CSV direto pela interface.
- Autenticacao de sessao para proteger rotas.

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
2. Filtro por tipo e status via query params + busca por nome.
3. Persistencia em MongoDB (sem dados em memoria).
4. Dashboard com resumo operacional e controles de pagina.
5. Formulario de cadastro/edicao com validacao.
6. Interface responsiva para desktop e mobile em tema dark.
7. Exportacao JSON/CSV acionada no frontend (sem comandos manuais).
8. Autenticacao com JWT em cookie HttpOnly.
9. Rate limit, headers de seguranca e sanitizacao de entrada.

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

Credenciais iniciais (configuradas por ambiente):

- Email: valor de `ADMIN_EMAIL`
- Senha: valor de `ADMIN_PASSWORD`

### 5.3 Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Aplicacao disponivel em: `http://localhost:3000`

## 6. Exportacao de relatorio

Realizada pela propria interface, no card de resumo operacional:

- Botao `Exportar CSV`
- Botao `Exportar JSON`

## 7. Qualidade tecnica

- Validacao de entrada com `class-validator`.
- Tratamento de erro com respostas apropriadas e mensagens funcionais no frontend.
- Separacao de responsabilidades (controller, service, schema, dto).
- Autenticacao e autorizacao por guard JWT.
- Middleware de seguranca (`helmet`, `mongo-sanitize`, `throttler`).
- Query otimizada com pagina, limite e indices no MongoDB.
- Padrao de codigo validado com ESLint.

## 8. Documentacao complementar

- `docs/ARQUITETURA.md`
- `docs/DECISOES.md`
- `docs/API.md`
