# Arquitetura da Solucao

## 1. Visao geral

O projeto foi dividido em dois servicos independentes:

1. Backend (`backend/`): API REST em NestJS.
2. Frontend (`frontend/`): aplicacao web em Next.js.

O frontend consome a API via HTTP e a API persiste dados no MongoDB.

## 2. Backend (NestJS)

### 2.1 Camadas

- `equipments.controller.ts`: entrada HTTP e roteamento.
- `equipments.service.ts`: regras de negocio e acesso ao modelo.
- `dto/*`: validacao de payloads e query params.
- `schemas/equipment.schema.ts`: mapeamento da colecao no MongoDB.

### 2.2 Modelo de dados

Campos do equipamento:

- `_id`: identificador automatico do MongoDB.
- `name`: nome do equipamento.
- `type`: `MONITOR`, `CPU` ou `TECLADO`.
- `acquisitionDate`: data de aquisicao.
- `status`: `ATIVO` ou `MANUTENCAO`.
- `createdAt` e `updatedAt`: gerenciados automaticamente.

### 2.3 Fluxo basico

1. Requisicao chega no Controller.
2. DTO valida dados de entrada.
3. Service aplica regra e executa operacao no MongoDB.
4. Resultado ou excecao retorna para o cliente.

## 3. Frontend (Next.js)

### 3.1 Pagina principal

Uma pagina unica concentra:

- Formulario de cadastro.
- Filtros (busca, tipo e status).
- Lista de equipamentos.
- Acoes de exclusao.

### 3.2 Responsividade

- Mobile-first.
- Grade adaptativa para desktop em duas colunas.
- Componentes e espacamentos ajustados para telas pequenas.

## 4. Integracao

- URL base da API configurada por `NEXT_PUBLIC_API_URL`.
- Requisicoes com `fetch` no cliente.
- Tratamento de erros com mensagens de feedback na interface.
