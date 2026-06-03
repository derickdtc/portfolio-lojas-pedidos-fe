# Estoque e Pedidos - PWA

Frontend web em React + Vite + TypeScript + Tailwind CSS para controle de estoque e pedidos de lojas.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios
- vite-plugin-pwa

## Ambientes

O frontend usa `VITE_API_BASE_URL` para decidir para qual API enviar as requisições.

- `.env.local`: ambiente local, ignorado pelo Git, apontando para a API no seu PC.
- `.env.production`: ambiente de produção, usado no build publicado, apontando para a API do Railway.

Exemplo local:

```bash
VITE_API_BASE_URL=http://localhost:3333
```

Exemplo de produção:

```bash
VITE_API_BASE_URL=https://portfolio-lojas-pedidos-production.up.railway.app
```

## Como rodar

Instale as dependências:

```bash
pnpm install
```

Crie o arquivo `.env.local` a partir do exemplo:

```bash
cp .env.example .env.local
```

Execute em desenvolvimento local:

```bash
pnpm dev
```

Você também pode usar o alias explícito:

```bash
pnpm dev:local
```

## Build de produção

O build padrão usa `.env.production`:

```bash
pnpm build
```

Alias explícito:

```bash
pnpm build:production
```

Para gerar um build local usando `.env.local`:

```bash
pnpm build:local
```

Para visualizar o build:

```bash
pnpm preview
```

## PWA

O app usa `vite-plugin-pwa`, manifest e ícones em `public/icons`.

Para validar instalação:

1. Gere o build com `pnpm build`.
2. Sirva o build com `pnpm preview`.
3. Abra no Chrome ou Edge e confira o painel Application no DevTools.
4. Em produção, publique em HTTPS para permitir instalação em Android/Chrome.
5. No iOS/Safari, use a opção "Adicionar à Tela de Início".

## Estrutura principal

- `src/services/api.ts`: cliente Axios centralizado usando `VITE_API_BASE_URL`.
- `src/contexts/AuthContext.tsx`: sessão, login, logout e restauração de usuário.
- `src/pages/StockPage.tsx`: estoque e criação de pedidos.
- `src/pages/OrdersPage.tsx`: histórico de pedidos.
- `src/pages/ImportPage.tsx`: importação de planilha `.xlsx`.
- `vite.config.ts`: configuração Vite e PWA.

As pastas `frontend-antigo/` e `backend/` foram mantidas como referência e não fazem parte do build do frontend web.
