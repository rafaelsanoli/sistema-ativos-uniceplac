# API REST - Equipamentos

Base URL local: `http://localhost:3001`

## 1. Criar equipamento

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

## 2. Listar equipamentos

`GET /equipments`

Filtros opcionais:

- `type`: `MONITOR`, `CPU`, `TECLADO`
- `status`: `ATIVO`, `MANUTENCAO`
- `search`: texto para nome

Exemplo:

`GET /equipments?type=CPU&status=ATIVO&search=lab`

## 3. Buscar por ID

`GET /equipments/:id`

## 4. Atualizar equipamento

`PATCH /equipments/:id`

Body (parcial):

```json
{
  "status": "MANUTENCAO"
}
```

## 5. Remover equipamento

`DELETE /equipments/:id`

Resposta esperada: `204 No Content`.

## 6. Erros comuns

- `400 Bad Request`: payload invalido.
- `404 Not Found`: equipamento nao encontrado.
