# Frontend - Dashboard de Ativos

Aplicacao web em Next.js para autenticacao, cadastro, busca, paginacao e exportacao de equipamentos.

## Recursos implementados

- Login administrativo com sessao autenticada.
- Dashboard com cards de resumo operacional.
- Cadastro e edicao de equipamentos.
- Busca, filtros e pagina por limite.
- Exportacao CSV/JSON por clique.
- Tema dark com identidade visual customizada.

## Stack

- Next.js
- React
- TypeScript

## Configuracao

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env.local
```

2. Instale dependencias:

```bash
npm install
```

3. Execute em desenvolvimento:

```bash
npm run dev
```

Aplicacao local: http://localhost:3000

## Variavel de ambiente

- NEXT_PUBLIC_API_URL: URL base da API (ex.: http://localhost:3001)

## Fluxo de acesso

1. Abrir a aplicacao e realizar login com credenciais do backend.
2. Acessar dashboard protegido para gerenciamento de equipamentos.
3. Exportar relatorios direto pela interface, sem comandos de terminal.

## Scripts importantes

```bash
npm run lint
npm run build
```
