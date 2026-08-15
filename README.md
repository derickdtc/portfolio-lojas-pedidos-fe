# Controle de Estoque e Pedidos

Aplicação web responsiva para apoiar a operação diária de pequenas lojas: consulta de estoque, gestão de produtos, criação de pedidos e importação de catálogos. O projeto foi desenvolvido como peça de portfólio, com foco em uma experiência clara tanto no balcão quanto no celular.

## Visão rápida

- Transforma o estoque disponível em pedidos de forma ágil, com busca por produto e ajuste de quantidade e preço.
- Centraliza o catálogo, incluindo informações fiscais, fotos e saldo em estoque.
- Mantém histórico de pedidos pesquisável, editável e pronto para impressão em PDF.
- Recebe planilhas `.xlsx` para atualizar a base de produtos e apresenta o resultado da importação.
- Funciona como PWA instalável, com navegação pensada para desktop e dispositivos móveis.

## Principais funcionalidades

### Estoque e criação de pedidos

- Busca por descrição, código, referência e campos fiscais.
- Sinalização visual do nível de estoque.
- Inclusão de múltiplos itens, controle de quantidades e alteração pontual do preço de venda.
- Identificação do cliente e observações no pedido.
- Edição de pedidos existentes sem perder o protocolo original.

### Catálogo de produtos

- Cadastro, edição e organização de produtos.
- Campos comerciais e fiscais, como preço de compra/venda, NCM, CFOP, CST e CSOSN.
- Inclusão de até duas imagens por produto, com validação de formato e tamanho.

### Histórico e operação

- Filtros por cliente, número do pedido e período.
- Visualização detalhada de cada pedido, seus itens e totais.
- Geração de versão para impressão/PDF e exclusão em lote com confirmação.
- Importação de planilhas Excel, com resumo de itens importados, substituídos, ignorados e avisos.

## Decisões técnicas em destaque

- **React + TypeScript:** componentes tipados, reutilizáveis e orientados a uma interface de operação.
- **Integração com API:** cliente Axios centralizado, token Bearer, interceptação de sessão expirada e tratamento consistente de erros.
- **Autenticação persistente:** opção de manter a sessão no `localStorage` ou apenas durante a sessão do navegador.
- **Experiência responsiva:** barra lateral em telas grandes e navegação inferior em dispositivos móveis.
- **PWA:** manifest, ícones e atualização automática do service worker para uma experiência instalável.
- **Deploy:** configuração pronta para Cloudflare, incluindo fallback para rotas de aplicação de página única (SPA).

## Stack

| Camada | Tecnologias |
| --- | --- |
| Interface | React 19, TypeScript, Tailwind CSS, Lucide Icons |
| Navegação e dados | React Router, Axios |
| Build e qualidade | Vite, TypeScript |
| PWA e hospedagem | vite-plugin-pwa, Workbox, Cloudflare/Wrangler |

## Arquitetura

```text
src/
├── components/       # Componentes de interface e layout
├── contexts/         # Estado global de autenticação
├── pages/            # Telas de estoque, produtos, pedidos e importação
├── services/         # Comunicação com a API
├── hooks/            # Comportamentos reutilizáveis
├── utils/            # Formatação e regras auxiliares
└── types/            # Contratos TypeScript da API
```

O frontend consome uma API configurada pela variável de ambiente `VITE_API_BASE_URL`. A camada de serviços mantém as chamadas HTTP separadas das telas, tornando o código mais simples de evoluir e testar.

## Como executar localmente

### Pré-requisitos

- Node.js 20 ou superior
- [pnpm](https://pnpm.io/)
- Uma instância compatível da API de estoque e pedidos

### Instalação

```bash
pnpm install
cp .env.example .env.local
```

Em `.env.local`, informe a URL da API:

```env
VITE_API_BASE_URL=http://localhost:3333
```

Inicie o ambiente de desenvolvimento:

```bash
pnpm dev
```

O Vite exibirá no terminal a URL local para abrir no navegador.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `pnpm dev` | Inicia o ambiente de desenvolvimento. |
| `pnpm typecheck` | Verifica os tipos TypeScript. |
| `pnpm build` | Executa a checagem de tipos e gera o build de produção. |
| `pnpm build:local` | Gera um build com as variáveis do ambiente de desenvolvimento. |
| `pnpm preview` | Gera o build e o serve localmente com Wrangler. |
| `pnpm deploy` | Gera o build e publica via Wrangler. |

## Configuração de ambiente

| Arquivo | Uso |
| --- | --- |
| `.env.example` | Modelo de configuração local. |
| `.env.local` | Configuração local, ignorada pelo Git. |
| `.env.production.example` | Modelo seguro para a configuração de produção. |
| `.env.production.local` | Configuração de produção para builds locais, ignorada pelo Git. |

Para o deploy, configure `VITE_API_BASE_URL` como variável de ambiente no provedor de hospedagem. Em um build local de produção, copie `.env.production.example` para `.env.production.local` e substitua o valor pelo endpoint do ambiente correspondente.

> Nunca versione credenciais, tokens ou endpoints privados em arquivos `.env`. Arquivos com valores reais devem permanecer fora do Git.

## Repositório

Código-fonte: [derickdtc/portfolio-lojas-pedidos-fe](https://github.com/derickdtc/portfolio-lojas-pedidos-fe)
