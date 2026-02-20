# Sistema de Banners

Este documento descreve o sistema de banners do blog: como funciona, onde os banners aparecem e como configurá-los.

## Visão geral

O sistema permite:

- **Cadastrar banners** apontando para imagens em `src/assets` e para um link de destino.
- **Definir onde cada banner aparece** em dois contextos:
  - **Home**: abaixo do título e da descrição do site, antes da lista de posts.
  - **Dentro dos artigos**: após um parágrafo específico (ex.: após o 2º e o 5º), com múltiplos intervalos possíveis.

Todos os links dos banners abrem na **mesma aba**.

A configuração é feita em um único arquivo, sem usar banco de dados nem painel administrativo.

---

## Como usar

### 1. Arquivo de configuração

Toda a configuração fica em **`src/data/banners.ts`**.

#### Cadastrar um novo banner

1. Coloque a imagem do banner em **`src/assets`** (ex.: `src/assets/meu-banner.jpg`).
2. No topo de `src/data/banners.ts`, importe a imagem:

   ```ts
   import bannerTop from '../assets/banner_top.png';
   import meuBanner from '../assets/meu-banner.jpg';
   ```

3. Adicione o banner na lista **`BANNERS`**:

   ```ts
   export const BANNERS = [
     { id: 'banner_top', image: bannerTop, link: 'https://exemplo.com/pagina' },
     { id: 'meu_banner', image: meuBanner, link: 'https://exemplo.com/outra' },
   ] as const;
   ```

   - **`id`**: identificador único (use em `BANNER_PLACEMENTS`).
   - **`image`**: resultado do `import` da imagem (o build do Astro otimiza e gera a URL).
   - **`link`**: URL para onde o clique no banner leva (mesma aba).
   - **`imagePublicPath`** (opcional): para banners que aparecem **dentro dos artigos**, defina o caminho da imagem em `public/` (ex.: `'/banner_middle-1.png'`). Esses banners não usam `image` (import); as imagens ficam **só em `public/`** (pode mover de `src/assets/banners/` para `public/`).

#### Exibir na home

Em **`BANNER_PLACEMENTS.home`**, liste os `id` dos banners que devem aparecer na home, **na ordem desejada**:

```ts
export const BANNER_PLACEMENTS = {
  home: ['banner_top', 'meu_banner'],
  inArticle: [/* ... */],
};
```

Os banners são exibidos entre o bloco de título/descrição e a lista de posts.

#### Exibir dentro dos artigos

Em **`BANNER_PLACEMENTS.inArticle`**, liste em qual parágrafo cada banner deve aparecer:

```ts
inArticle: [
  { afterParagraph: 2, bannerId: 'banner_top' },   // após o 2º parágrafo
  { afterParagraph: 5, bannerId: 'banner_top' },   // mesmo banner após o 5º
  { afterParagraph: 4, bannerId: 'meu_banner' },    // outro banner após o 4º
],
```

- **`afterParagraph`**: número do parágrafo (1 = primeiro, 2 = segundo, etc.).
- **`bannerId`**: `id` de um banner cadastrado em `BANNERS`.

É possível usar o mesmo banner em vários parágrafos ou banners diferentes em parágrafos diferentes. A regra vale para **todos os artigos** do blog (não há configuração por post).

#### UTM dinâmico (slug do artigo) em banners in-article

Para banners que aparecem **dentro dos artigos**, você pode usar um **placeholder de grupo UTM** no `link`. Na hora em que o leitor abre o post, o link do banner é resolvido no navegador e ganha `utm_term` = slug daquele artigo (ex.: no post `/burnout-empreendedor/`, o link fica com `utm_term=burnout-empreendedor`).

Em `src/data/banners.ts`, use no `link` um grupo definido em `src/data/utm.ts`, por exemplo:

```ts
{ id: 'banner_inline', image: bannerTop, link: 'https://ravia.app/[banner_inline_utm]' },
```

O grupo `banner_inline_utm` (ou o que você definir em `utm.ts`) deve ter `utm_source`, `utm_medium`, `utm_campaign` e `utm_content`; o `utm_term` é sempre preenchido com o slug do post. Detalhes em [UTMs dinâmicos nos posts](utm-dinamicos.md).

---

## Como funciona (técnico)

| Parte | Função |
|-------|--------|
| **`src/data/banners.ts`** | Define `BANNERS` e `BANNER_PLACEMENTS` e exporta `getBannerMap()` para o plugin. |
| **`src/components/Banner.astro`** | Componente que renderiza `<a><Image /></a>`; usado na home. |
| **`src/plugins/rehype-inject-banners.ts`** | Plugin rehype que, ao processar o Markdown/MDX do artigo, conta os `<p>` e insere o HTML do banner após o parágrafo configurado. |
| **`astro.config.mjs`** | Registra o plugin em `markdown.rehypePlugins` com as opções vindas de `banners.ts`. |
| **`src/pages/index.astro`** | Filtra os banners com `placement` na home e renderiza `<Banner>` entre o hero e a lista de posts. |
| **`src/layouts/BlogPost.astro`** | Contém os estilos da classe `.banner-in-article` para os banners injetados no meio do texto. |

Na home, o Astro usa o componente `Banner.astro` e o otimizador de imagens. Nos artigos, o rehype injeta HTML (com a URL da imagem já resolvida no build). Para os banners in-article aparecerem em **produção**, as imagens ficam apenas em `public/` e o banner tem `imagePublicPath` (ex.: `'/banner_middle-1.png'`). Não é preciso ter essas imagens em `src/assets/` — pode mover de `src/assets/banners/` para `public/`. Caso contrário o build gera `src="/src/assets/..."`, que só funciona no dev server e resulta em 404 ao vivo.

---

## Exemplo completo

```ts
// src/data/banners.ts
import bannerTop from '../assets/banner_top.png';
import ctaSidebar from '../assets/cta-sidebar.png';

export const BANNERS = [
  { id: 'banner_top', image: bannerTop, link: 'https://ravia.com/post-creator' },
  { id: 'cta_sidebar', image: ctaSidebar, link: 'https://ravia.com/planos' },
] as const;

export type BannerId = (typeof BANNERS)[number]['id'];

export const BANNER_PLACEMENTS = {
  home: ['banner_top'],
  inArticle: [
    { afterParagraph: 2, bannerId: 'banner_top' },
    { afterParagraph: 5, bannerId: 'banner_top' },
    { afterParagraph: 8, bannerId: 'cta_sidebar' },
  ],
};
```

Com isso:

- Na **home**, só o `banner_top` aparece entre o hero e os posts.
- Em **cada artigo**, o `banner_top` aparece após o 2º e o 5º parágrafo, e o `cta_sidebar` após o 8º.

Para alterar posições ou adicionar/remover banners, edite apenas `src/data/banners.ts`.
