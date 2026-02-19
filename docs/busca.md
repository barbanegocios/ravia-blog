# Sistema de Busca

Este documento descreve a funcionalidade de busca do blog: arquitetura, arquivos envolvidos, índice de conteúdo, interface (desktop e mobile), página de resultados e lógica de busca.

## Visão geral

A busca é **client-side** e **estática**:

- No **build**, é gerado um arquivo JSON (`/search-index.json`) com dados de todos os posts (título, descrição, categoria e texto dos artigos em formato plano).
- O usuário **digita na barra do header** (ícone de lupa) e pressiona **Enter**; o navegador vai para a página **`/busca?q=termos`**.
- A **página de busca** carrega o JSON, aplica a busca em memória e exibe os resultados em **cards iguais aos da home**.

Não há servidor de busca nem APIs externas: tudo roda no navegador após o carregamento do índice.

---

## Fluxo da busca

1. Usuário clica no ícone de lupa no header (ou, no mobile, abre o painel de busca).
2. O campo de texto expande (desktop) ou aparece no painel (mobile).
3. Usuário digita e pressiona **Enter**.
4. O script do header redireciona para **`/busca?q=<termo codificado>`**.
5. A página `/busca` lê o parâmetro `q`, faz `fetch('/search-index.json')`, executa a função de busca e renderiza os cards.

---

## Arquivos envolvidos

| Arquivo | Função |
|--------|--------|
| `src/pages/search-index.json.ts` | Endpoint que gera o JSON do índice no build. Usa `getCollection('blog')`, converte o body de cada post em texto puro e retorna um array de objetos. |
| `src/pages/busca/index.astro` | Página estática de resultados. Contém o layout (Header, main, Footer), os estilos específicos (loading, empty) e o script que lê `?q=`, carrega o índice, busca e monta os cards. |
| `src/components/Header.astro` | Inclui o ícone de lupa, o campo expandível (desktop), o painel de busca (mobile), o script que abre/fecha a busca e redireciona para `/busca?q=...` no Enter. |
| `src/styles/global.css` | Estilos compartilhados da listagem: `.main-inner`, `.hero-text`, `.post-list`, `.post-card`, `.card-*`, `.read-more`. A página de busca reutiliza esses mesmos classes para os cards. |

O índice é servido como **arquivo estático** em **`/search-index.json`** (rota gerada a partir de `search-index.json.ts` no build).

---

## Índice de busca (search-index.json)

### Geração

O endpoint `src/pages/search-index.json.ts` exporta uma função **`GET()`**. No modo estático do Astro, essa função é executada **uma vez no build** e o resultado vira o conteúdo do arquivo `/search-index.json`.

Para cada post da coleção `blog`:

1. Lê `post.data` (título, descrição, categoria, heroImage).
2. Lê `post.body` (conteúdo bruto em Markdown/MDX).
3. Converte o body em texto puro com a função **`markdownToPlainText()`** (remove sintaxe de markdown/MDX).
4. Monta um objeto com os campos abaixo e adiciona ao array.
5. Retorna o array em JSON.

### Estrutura de cada item no JSON

| Campo | Tipo | Origem | Uso |
|-------|------|--------|-----|
| `id` | string | `post.id` (slug) | URL do artigo: `/${id}/` |
| `title` | string | frontmatter | Exibição e busca |
| `description` | string | frontmatter | Exibição (excerpt) e busca |
| `category` | string | frontmatter (slug) | Busca |
| `categoryLabel` | string | `getCategoryLabel(category)` | Exibição e busca |
| `heroImageSrc` | string \| null | URL da imagem do frontmatter | Imagem do card na página de resultados |
| `bodyPlain` | string | `markdownToPlainText(post.body)` | Busca no texto completo do artigo |

### Conversão do body para texto puro (markdownToPlainText)

A função remove ou simplifica:

- Blocos de código (`` ```...``` ``)
- Links: `[texto](url)` → fica só o texto
- Imagens: `![alt](url)` → removido
- Títulos: `#`, `##`, etc. → removidos
- Negrito/itálico: `**`, `*`, `__`, `_` → removidos
- Código inline: `` `...` `` → fica só o conteúdo
- Referências de link `[texto][ref]` → removidas ou simplificadas
- Tags e expressões MDX/JSX: `<...>`, `{...}` → removidos
- Listas (`-`, `*`, `1.`), blockquotes (`>`), linhas horizontais
- Quebras de linha e espaços múltiplos → um único espaço

O resultado é um único bloco de texto, em minúsculas apenas na etapa de **busca** (a normalização é feita no client).

---

## Interface de busca no Header

### Desktop

- **Posição**: ícone de lupa à esquerda dos links de categorias (dentro de `.topbar-right`).
- **Estado inicial**: só o ícone visível.
- **Ao clicar**: o ícone continua visível e ao lado aparece o campo de texto (`.search-expanded`), com animação de largura (0 → 260px).
- **Campo**: `placeholder="Buscar artigos..."`, estilizado para a topbar (#001e3c).
- **Confirmação**: usuário digita e pressiona **Enter** → redirecionamento para `/busca?q=...`.
- **Escape**: fecha o campo e devolve o foco ao botão da lupa.
- **Clique fora**: fecha o campo.

### Mobile

- **Posição**: ícone de lupa no topbar, à esquerda do hamburger.
- **Ao clicar na lupa**: abre o **painel de busca** (`.search-panel`), abaixo da topbar, com o mesmo estilo visual do menu de categorias (fundo #001e3c, sombra, `position: fixed`, `top: 64px`).
- **Conteúdo do painel**: um único campo de texto em largura total.
- **Enter**: redireciona para `/busca?q=...`.
- **Escape** ou **clique fora**: fecha o painel.

O painel de busca e o menu do hamburger são independentes: abrir um não abre o outro.

### Acessibilidade

- Botão da lupa: `aria-label="Buscar"`, `aria-expanded`, `aria-controls="search-expanded"`.
- Painel mobile e área expandida desktop: `aria-hidden` conforme estado aberto/fechado.
- Foco vai para o input ao abrir; Escape restaura o foco no botão.

---

## Página de resultados (/busca)

### URL e parâmetro

- **Rota**: `/busca` (arquivo `src/pages/busca/index.astro` → no build vira `/busca/index.html`).
- **Parâmetro**: `q` (termo de busca). Ex.: `/busca?q=marketing+digital`.

Se `q` estiver vazio ou com menos de 2 caracteres, a página carrega normalmente e exibe a mensagem “Digite pelo menos 2 caracteres na busca.” (a busca não é executada nesses casos).

### Carregamento e estados

1. **Carregando**: mensagem “Carregando...” visível; lista de resultados oculta.
2. **Erro ao carregar o índice**: mensagem “Não foi possível carregar a busca. Tente novamente.”
3. **Busca executada**:
   - **Com resultados**: título “Resultados da busca para \"termo\"" (aspas normais), subtítulo “X artigos encontrados”, lista de cards.
   - **Sem resultados** (query com 2+ caracteres): “Nenhum resultado encontrado. Tente outros termos.”
   - **Query com menos de 2 caracteres**: “Digite pelo menos 2 caracteres na busca.”

### Título e subtítulo

- Com termo: `Resultados da busca para "<termo>"` (termo escapado com `escapeHtml`).
- Sem termo: `Resultados da busca`.
- Subtítulo: “1 artigo encontrado” ou “X artigos encontrados”.

### Renderização dos cards

Os resultados são inseridos em um `<ul class="post-list">` com a mesma estrutura da home e da página de categoria:

- `<li class="post-card">`
  - `<a href="/${id}/" class="card-link">`
    - Se houver `heroImageSrc`: `<img class="card-image" ... />`
    - `<div class="card-body">`
      - `<div class="card-category">` (categoryLabel)
      - `<h2 class="card-title">` (title)
      - `<p class="card-excerpt">` (description)
      - `<span class="read-more">Ler artigo →</span>`

As classes vêm de `src/styles/global.css` (`.post-list`, `.post-card`, `.card-*`, etc.), garantindo o mesmo visual da home.

---

## Lógica de busca (client-side)

Implementada no script da página `src/pages/busca/index.astro`.

### Normalização

- **normalize(str)**:
  - Converte para minúsculas.
  - Aplica `normalize('NFD')` e remove caracteres diacríticos (acentos) na faixa Unicode `\u0300-\u036f`.
  - Objetivo: que “marketing” e “markétíng” (e variações com acento) sejam tratados da mesma forma.

### Mínimo de caracteres

- **MIN_QUERY_LENGTH = 2**: queries com menos de 2 caracteres (após trim) não disparam busca; a página pode exibir a mensagem de “Digite pelo menos 2 caracteres”.

### Regra de matching

- O termo digitado é **dividido por espaços** em uma lista de “termos”.
- Um post entra nos resultados **somente se todos** esses termos aparecerem (em qualquer ordem) no texto buscável.
- O texto buscável é a concatenação (com espaço) dos valores **normalizados** de:
  - `title`
  - `description`
  - `category` (slug)
  - `categoryLabel`
  - `bodyPlain`
- Ou seja: **título, descrição, categoria (slug e label) e texto completo do artigo** são considerados na busca.

### Exemplo

- Query: `"gestão tempo"`.
- Termos: `["gestão", "tempo"]` → após normalizar: `["gestao", "tempo"]`.
- Um post só aparece se o texto buscável normalizado contiver **“gestao”** e **“tempo”** (em qualquer posição).

Não há ranking por relevância nem destaque de trechos; a ordem dos resultados segue a ordem do índice (que segue a ordem da coleção no build).

---

## Estilos

- **Header (lupa, campo, painel)**: definidos no próprio `Header.astro` (topbar #001e3c, input, transição do campo, painel fixo no mobile).
- **Página de busca**: estilos próprios só para `.search-loading` e `.search-empty`; o restante (layout e cards) usa `global.css` (`.main-home`, `.main-inner`, `.hero-text`, `.post-list`, `.post-card`, etc.), como na home e nas categorias.

---

## Referência rápida

| O quê | Onde |
|-------|------|
| Gerar o índice (build) | `src/pages/search-index.json.ts` → GET() |
| URL do índice | `/search-index.json` |
| Converter body em texto puro | `markdownToPlainText()` em `search-index.json.ts` |
| Campo de busca (desktop) | `Header.astro` → `.search-expanded` |
| Painel de busca (mobile) | `Header.astro` → `#search-panel` |
| Redirecionamento ao Enter | `Header.astro` → `submitSearch()` → `location.href = /busca?q=...` |
| Página de resultados | `src/pages/busca/index.astro` |
| Parâmetro da busca | `?q=` na URL |
| Função de busca (normalizar + filtrar) | Script em `busca/index.astro` → `search(index, query)` |
| Campos buscados | title, description, category, categoryLabel, bodyPlain |
| Estilos dos cards | `src/styles/global.css` (`.post-list`, `.post-card`, `.card-*`) |
| Mínimo de caracteres | 2 (constante `MIN_QUERY_LENGTH` em `busca/index.astro`) |

---

## Possíveis extensões

- **Ordenação por relevância**: dar peso maior a matches em `title` e `description` do que em `bodyPlain`.
- **Destaque do termo**: no excerpt ou no título, envolver o termo encontrado em um `<mark>` ou classe para destacar.
- **Histórico de buscas**: salvar as últimas queries em `localStorage` e exibir na página de busca ou no dropdown (se voltar a ter sugestões no header).
- **Busca com biblioteca (ex.: MiniSearch)**: trocar o filtro manual por uma lib de full-text no client, mantendo o mesmo índice JSON.
