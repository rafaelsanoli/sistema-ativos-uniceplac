# Arquitetura da Solucao

## 1. Visao geral

O projeto foi dividido em dois servicos independentes:

1. Backend (`backend/`): API REST em NestJS.
2. Frontend (`frontend/`): aplicacao web em Next.js.

O frontend consome a API via HTTP e a API persiste dados no MongoDB.

## 2. Backend (NestJS)

### 2.1 Camadas

- `auth/*`: login, sessao e protecao de rotas.
- `users/*`: repositorio de usuarios administrativos.
- `equipments.controller.ts`: entrada HTTP e roteamento.
- `equipments.service.ts`: regras de negocio e acesso ao modelo.
- `reports/*`: resumo operacional e exportacao de dados.
- `dto/*`: validacao de payloads e query params.
- `schemas/equipment.schema.ts`: mapeamento da colecao no MongoDB.

### 2.2 Seguranca e performance

- `ValidationPipe` global com whitelist e transform.
- `helmet` para headers de seguranca.
- `@nestjs/throttler` para rate limit global.
- `compression` para resposta HTTP otimizada.
- JWT em cookie HttpOnly para sessao protegida.
- Indices de consulta no MongoDB para listagem e filtros.

### 2.3 Modelo de dados

Campos do equipamento:

- `_id`: identificador automatico do MongoDB.
- `name`: nome do equipamento.
- `type`: `MONITOR`, `CPU` ou `TECLADO`.
- `acquisitionDate`: data de aquisicao.
- `status`: `ATIVO` ou `MANUTENCAO`.
- `createdAt` e `updatedAt`: gerenciados automaticamente.

Campos do usuario administrativo:

- `_id`
- `email`
- `passwordHash`
- `role`

### 2.4 Fluxo basico

1. Requisicao chega no Controller.
2. Guard JWT valida sessao (quando rota protegida).
3. DTO valida dados de entrada.
4. Service aplica regra e executa operacao no MongoDB.
5. Resultado ou excecao retorna para o cliente.

## 3. Frontend (Next.js)

### 3.1 Pagina principal

Uma pagina unica concentra:

- Login administrativo.
- Cards de resumo operacional.
- Formulario de cadastro.
- Filtros (busca, tipo e status).
- Controle de pagina e limite.
- Lista de equipamentos.
- Acoes de edicao e exclusao.
- Acoes de exportacao CSV/JSON.

### 3.2 Responsividade

- Mobile-first.
- Grade adaptativa para desktop em duas colunas.
- Componentes e espacamentos ajustados para telas pequenas.

### 3.3 Identidade visual

- Tema dark.
- Paleta baseada no simbolo da logo do UNICEPLAC (laranja e menta).
- Animacoes suaves de entrada e fundo para reforco visual sem prejudicar usabilidade.

## 4. Integracao

- URL base da API configurada por `NEXT_PUBLIC_API_URL`.
- Requisicoes com `fetch` + `credentials: include` no cliente.
- Tratamento de erros com mensagens de feedback na interface.
