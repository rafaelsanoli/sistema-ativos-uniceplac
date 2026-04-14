# Decisoes Tecnicas

## 1. Escolha do backend: NestJS

Optei por NestJS para estruturar o backend com arquitetura modular e separacao clara entre controller/service/dto/schema. Isso ajuda em manutencao e escalabilidade.

## 2. Banco escolhido: MongoDB

MongoDB foi escolhido para atender ao requisito de persistencia real e simplificar o mapeamento do dominio de equipamentos sem overhead relacional para esse contexto.

## 3. Validacao na borda da API

Usei o `ValidationPipe` global + DTOs com `class-validator`. Com isso, entradas invalidas sao barradas antes de chegar na regra de negocio da aplicação.

## 4. Enums para tipo e status

Padronizei os valores de `type` e `status` para evitar inconsistencias de dados e facilitar filtros.

## 5. Frontend em pagina unica

Para o escopo do desafio, concentrei dashboard e formulario em uma unica pagina. Isso reduz complexidade de navegacao e acelera a validacao funcional.

## 6. Busca e filtros no backend

Os filtros foram implementados no endpoint de listagem, para evitar carregar toda a base no frontend e manter consulta eficiente e reutilizavel.

## 7. Desafio extra de exportacao

Implementei um script independente para gerar JSON/CSV a partir da base real. A abordagem simula uma integracao de relatorios sem acoplar a exportacao ao fluxo principal da API.

## 8. Trade-offs assumidos

1. Autenticacao nao foi implementada por nao ser requisito obrigatorio.
2. Testes automatizados avancados (unitarios/e2e com banco de teste) ficaram como evolucao futura por priorizacao do escopo principal.
