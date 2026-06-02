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

## Como rodar

Instale as dependências:

```bash
pnpm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Configure a URL da API:

```bash
VITE_API_BASE_URL=https://sua-api.up.railway.app
```

Execute em desenvolvimento:

```bash
pnpm dev
```

## Build de produção

```bash
pnpm build
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
