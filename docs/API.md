# API REST - Equipamentos

Base URL local: `http://localhost:3001`

## Swagger / OpenAPI

- UI interativa: `http://localhost:3001/docs`
- Colecao de avaliacao: `docs/postman/UNICEPLAC-Ativos.postman_collection.json`

## 0. Autenticacao

### Login

`POST /auth/login`

```json
{
  "email": "admin@uniceplac.com",
  "password": "admin12345"
}
```

Retorna dados do usuario e registra sessao em cookie HttpOnly.

Exemplo de resposta:

```json
{
  "user": {
    "id": "...",
    "email": "admin@uniceplac.com",
    "role": "ADMIN"
  },
  "csrfToken": "token-gerado-no-login"
}
```

### Sessao atual

`GET /auth/me`

### Logout

`POST /auth/logout`

## 1. Regra de acesso

Todos os endpoints de equipamentos e relatorios exigem autenticacao.

## 1.1 Regra CSRF

Para `POST`, `PATCH`, `PUT` e `DELETE`, envie o header abaixo:

- `x-csrf-token`: token retornado no login e em `/auth/me`.

Sem esse header, a API retorna `403 Forbidden`.

## 2. Criar equipamento

`POST /equipments`

Body:

```json
{
  "name": "Monitor Dell 24",
  "type": "MONITOR",
  "acquisitionDate": "2026-04-10",
  "status": "ATIVO"
}
```

## 3. Listar equipamentos

`GET /equipments`

Filtros opcionais:

- `type`: `MONITOR`, `CPU`, `TECLADO`
- `status`: `ATIVO`, `MANUTENCAO`
- `search`: texto para nome
- `page`: pagina atual
- `limit`: itens por pagina (5 a 50)

Exemplo:

`GET /equipments?type=CPU&status=ATIVO&search=lab&page=1&limit=10`

Resposta:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## 4. Buscar por ID

`GET /equipments/:id`

## 5. Atualizar equipamento

`PATCH /equipments/:id`

Body (parcial):

```json
{
  "status": "MANUTENCAO"
}
```

## 6. Remover equipamento

`DELETE /equipments/:id`

Resposta esperada: `204 No Content`.

## 7. Resumo operacional

`GET /reports/equipments/summary`

Retorna total geral, total por status e total por tipo.

## 8. Exportacao por endpoint

`GET /reports/equipments/export?format=csv`

`GET /reports/equipments/export?format=json`

Filtros opcionais aceitos:

- `type`
- `status`
- `search`

## 9. Erros comuns

- `400 Bad Request`: payload invalido.
- `401 Unauthorized`: sessao invalida ou ausente.
- `403 Forbidden`: token CSRF invalido ou ausente.
- `404 Not Found`: equipamento nao encontrado.
