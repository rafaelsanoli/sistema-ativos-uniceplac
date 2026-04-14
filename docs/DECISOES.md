# Decisoes Tecnicas

## Contexto da segunda fase

Nesta etapa, o foco foi elevar o nivel de robustez da aplicacao com seguranca, autenticacao, exportacao por interface e refinamento visual em tema dark.

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

Substitui o script de terminal por endpoint de exportacao protegido (`/reports/equipments/export`) e consumo direto no frontend. Assim, todo o fluxo fica acessivel pela interface.

## 8. Autenticacao e sessao segura

Implementei autenticacao JWT com cookie HttpOnly para reduzir exposicao de token no cliente e proteger os endpoints de equipamentos e relatorios.

## 9. Hardening da API

Foram adicionados:

1. `helmet` para headers de seguranca.
2. `express-mongo-sanitize` para higienizacao de payloads.
3. `@nestjs/throttler` para rate limit global.
4. `compression` para reduzir custo de trafego.

## 10. Otimizacao de consultas

Adotei a paginação no endpoint de listagem e criei índices em campos de filtro para reduzir custo de consulta e melhorar tempo de resposta sob volume maior de dados.

## 11. Direcao visual do frontend

O tema foi feito em darkmode com contraste alto e acentos em laranja e verde inspirados no simbolo da logo da UNICEPLAC. O objetivo foi deixar a interface mais marcante sem perder a legibilidade.

## 12. Trade-offs assumidos

1. O fluxo de usuarios e focado em perfil administrativo unico para manter escopo objetivo.
2. Ainda ha espaco para evoluir com testes automatizados mais profundos (especialmente e2e com banco dedicado).
