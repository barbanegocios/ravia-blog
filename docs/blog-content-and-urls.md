# Conteúdo do blog e URLs dos posts

Este documento descreve onde os posts do blog devem ficar, como as URLs são geradas e o que é relevante ao organizar o conteúdo (por exemplo, por ano e mês).

---

## Onde os posts devem estar

Os posts do blog **só são considerados** se estiverem dentro de:

**`src/content/blog/`**

A coleção `blog` está configurada em `src/content.config.ts` com um loader que usa **`base: './src/content/blog'`**. O padrão `**/*.{md,mdx}` é aplicado em cima dessa pasta. Ou seja:

- **Incluídos:** qualquer arquivo `.md` ou `.mdx` em `src/content/blog` ou em **subpastas** (ex.: `src/content/blog/2026/01/meu-post.md`).
- **Não incluídos:** arquivos em outras pastas de `src/content` (ex.: `src/content/outra-pasta/post.md`) não entram na coleção do blog.

Você pode organizar por ano e mês, por exemplo:

```
src/content/blog/
  2026/
    01/
      nome-do-post.md
    02/
      outro-post.md
  primeiro-post.md   (na raiz de blog também vale)
```

---

## Como funciona a URL dos posts

As URLs dos posts são **sempre na raiz do site**, no formato:

**`/slug/`**

Exemplos: `/first-post/`, `/markdown-style-guide/`, `/nome-do-post/`.

- **Não** usamos mais `/blog/slug` nem `/blog/ano/mes/slug`.
- O **slug** é o nome do arquivo sem a extensão (ex.: `first-post.md` → slug `first-post`).
- A rota que atende esses endereços é **`src/pages/[...slug].astro`**: ela gera uma página estática para cada post da coleção `blog`, com o `id` do post como único segmento da URL.

Os links internos do site (lista na home, listagem por categoria, RSS) já apontam para `/${post.id}/`, ou seja, para essa URL na raiz.

---

## Slug único e `generateId`

O **id** de cada post na coleção (e portanto a URL) é definido pelo **`generateId`** no loader da coleção. A regra é:

- O id é **só o nome do arquivo sem extensão** (último segmento do caminho).
- O caminho da pasta **não** entra na URL. Assim, tanto faz o post estar em `blog/post.md` ou em `blog/2026/01/post.md`: a URL será sempre `/post/`.

**Importante:** os slugs precisam ser **únicos em todo o blog**. Não use o mesmo nome de arquivo (ex.: `resumo.md`) em pastas diferentes (ex.: `2026/01/resumo.md` e `2026/02/resumo.md`), senão dois posts disputam a mesma URL.

---

## Datas no frontmatter (`pubDate` e `updatedDate`)

Use sempre o formato **ISO 8601** para datas: **`YYYY-MM-DD`** (ex.: `2026-02-08` para 8 de fevereiro de 2026).

- **`pubDate`** (obrigatório): data de publicação.
- **`updatedDate`** (opcional): data da última atualização.

Exemplo:

```yaml
pubDate: 2026-02-08
updatedDate: 2026-02-15
```

Evite formatos numéricos ambíguos como `08/02/2026`: no JavaScript a interpretação pode ser mês/dia em vez de dia/mês, gerando data errada. O formato ISO é inequívoco e recomendado pela documentação do Astro.

---

## Imagens nos posts (caminhos relativos)

Quando o post usa **heroImage** ou imagens no corpo em Markdown, os caminhos são **relativos ao arquivo do post**.

- Post **na raiz** de `blog` (ex.: `src/content/blog/post.md`): use **`../../assets/minha-imagem.jpg`** (dois níveis para cima até `src`, depois `assets`).
- Post **em ano/mês** (ex.: `src/content/blog/2026/01/post.md`): use **`../../../../assets/minha-imagem.jpg`** (quatro níveis para cima: 01 → 2026 → blog → content → `src`, depois `assets`).

Como a estrutura de pastas é sempre `blog/ano/mes/post.md`, todos os posts dentro de ano/mês usam o mesmo padrão: **quatro `../`** até chegar em `src`, depois `assets`.

---

## Resumo técnico

| Aspecto | Detalhe |
|--------|---------|
| **Pasta dos posts** | Apenas `src/content/blog/` (e subpastas). |
| **Formato da URL** | `/slug/` (raiz do site). |
| **Definição do slug** | Nome do arquivo sem `.md`/`.mdx`, via `generateId` em `src/content.config.ts`. |
| **Rota** | `src/pages/[...slug].astro` (gera uma página por post). |
| **Unicidade** | Cada slug deve ser único em todo o blog. |
| **Datas (pubDate / updatedDate)** | Formato ISO `YYYY-MM-DD` (ex.: `2026-02-08`). |
| **Imagens (ano/mês)** | Caminho relativo com `../../../../assets/...` a partir do arquivo do post. |
