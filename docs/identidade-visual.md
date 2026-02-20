# Identidade visual — Ravia Blog

Este documento descreve a identidade visual do Ravia Blog: paleta de cores, tipografia, espaçamentos e elementos de interface usados no layout e no design.

---

## 1. Tipografia

### Fontes

As fontes são carregadas via **Google Fonts** (com `preconnect` e `preload` para não bloquear a renderização). A URL utilizada está em `src/components/BaseHead.astro`.

| Uso | Fonte | Pesos | Onde |
|-----|--------|--------|------|
| **Corpo de texto** | **Outfit** | 400, 500, 600 | `body`, parágrafos, listas, inputs |
| **Títulos** | **DM Sans** | 400, 500, 600, 700 | `h1`–`h6`, títulos de cards, 404 |

- **Outfit**: sans-serif moderna, usada para leitura contínua.
- **DM Sans**: sans-serif geométrica, usada para títulos e destaques.

Fallback genérico: `sans-serif`.

### Tamanhos e escala

- **Body**: `20px` (desktop), `18px` em viewport ≤ 720px.
- **Line-height**: `1.7` no body, `1.2` nos títulos.
- **Escala de headings** (tipo escala modular, base ~1,25):
  - `h1`: 3,052em (desktop) / 1,75em (mobile)
  - `h2`: 2,441em / 1,4em
  - `h3`: 1,953em / 1,12em
  - `h4`: 1,563em / 0,9em
  - `h5`: 1,25em / 0,72em
  - `h6`: (implícito) / 0,57em
- **Tagline (hero)**: 1,15rem.
- **Card**: título 1,5rem (DM Sans), excerpt 0,95rem, categoria 0,8rem (uppercase, letter-spacing 0,05em).
- **Blockquote**: 1,333em.
- **Inputs/textarea**: 16px.

### Estilos de texto

- **Links**: cor `--accent`; hover mantém a mesma cor (com sublinhado onde aplicável).
- **Categoria nos cards**: uppercase, font-weight 600, letter-spacing 0,05em, cor `--accent`.
- **“Ler mais”**: font-weight 600, cor `--accent-cta`.

---

## 2. Paleta de cores

As cores principais são definidas como variáveis CSS em `src/styles/global.css`. O tema (claro/escuro) segue `prefers-color-scheme` e pode ser sobrescrito com `localStorage.setItem('theme', 'light'|'dark')` (ver `docs/dark-mode.md`).

### 2.1 Tema claro (`:root`)

| Variável | Valor | Uso |
|----------|--------|-----|
| `--accent` | `#001e3c` | Links, categorias nos cards, destaque geral |
| `--accent-cta` | `#e2a000` | CTAs, “Ler mais”, borda do blockquote |
| `--black` | `15, 18, 25` (RGB sem “rgb()”) | Títulos (h1–h6) — uso: `rgb(var(--black))` |
| `--gray` | `96, 115, 159` | Tagline, excerpt, textos secundários, sombras |
| `--gray-light` | `229, 233, 240` | Fundo de `code`, borda de `hr` |
| `--gray-dark` | `34, 41, 57` | Texto do body, footer |
| `--bg-body` | `#f9fafb` | Fundo da página |
| `--bg-card` | `#fff` | Fundo dos cards de post |
| `--box-shadow` | 3 camadas com `rgba(var(--gray), 25% ou 33%)` | Sombra dos cards |

### 2.2 Tema escuro (`[data-theme="dark"]`)

| Variável | Valor | Uso |
|----------|--------|-----|
| `--accent` | `#93c5fd` | Links, categorias |
| `--accent-cta` | `#fbbf24` | CTAs, “Ler mais”, blockquote |
| `--black` | `248, 250, 252` | Títulos |
| `--gray` | `148, 163, 184` | Textos secundários |
| `--gray-light` | `51, 65, 85` | Fundo de code, hr |
| `--gray-dark` | `203, 213, 225` | Texto do body, footer |
| `--bg-body` | `#0f172a` | Fundo da página |
| `--bg-card` | `#1e293b` | Fundo dos cards |
| `--box-shadow` | 3 camadas com `rgba(0, 0, 0, 0.3 / 0.4 / 0.35)` | Sombra dos cards |

### 2.3 Cores fixas (Header)

O header (topbar) usa cores fixas, não variáveis de tema:

| Cor | Valor | Uso |
|-----|--------|-----|
| Azul escuro | `#001e3c` | Fundo da topbar, painel de busca e menu mobile |
| Branco | `#fff` | Texto dos links, ícones |
| Amarelo/dourado (CTA) | `#e2a000` | Link “Conheça o PostCreator”, borda do input em foco |
| Branco 10% | `rgba(255, 255, 255, 0.1)` | Fundo do input de busca |
| Branco 20% | `rgba(255, 255, 255, 0.2)` | Borda do input de busca |
| Branco 70% | `rgba(255, 255, 255, 0.7)` | Placeholder do input de busca |
| Sombra | `rgba(0, 0, 0, 0.2)` | Sombra do painel de busca e do menu mobile |

### 2.4 Resumo em hex (referência rápida)

- `#001e3c` — accent (light) / header
- `#e2a000` — CTA (light) / header CTA
- `#f9fafb` — bg-body (light)
- `#fff` — bg-card (light) / texto do header
- `#93c5fd` — accent (dark)
- `#fbbf24` — accent-cta (dark)
- `#0f172a` — bg-body (dark)
- `#1e293b` — bg-card (dark)

---

## 3. Layout e espaçamento

- **Container principal (`main`)**: largura máxima 720px, `max-width: calc(100% - 2em)`, padding `3em 1em` (em mobile `1em`).
- **Área de listagem (`.main-inner`)**: max-width 600px; a partir de 1300px, grid de 2 colunas de 600px com gap 2rem (max-width do container 1240px).
- **Cards**: padding do corpo `1.25rem 1.5rem`, gap entre cards 2rem.
- **Header**: altura 64px, padding horizontal 1em.
- **Border-radius**: imagens e blocos 8px; cards 12px; inputs (header) 6px; `code` inline 2px.
- **Blockquote**: borda esquerda 4px sólida (`--accent-cta`), padding à esquerda 20px.

---

## 4. Componentes visuais

- **Cards de post**: fundo `--bg-card`, `box-shadow: var(--box-shadow)`, imagem em 16:9, bordas 12px (imagem sem border-radius para encaixe).
- **Code**: fundo `rgb(var(--gray-light))`, padding 2px 5px, border-radius 2px.
- **Pre**: padding 1.5em, border-radius 8px.
- **HR**: linha `1px solid rgb(var(--gray-light))`.
- **Logo no header**: altura 40px (definida no componente Header).

---

## 5. Onde está definido

| Elemento | Arquivo(s) |
|----------|------------|
| Variáveis de cor e tema | `src/styles/global.css` |
| Fontes (carregamento) | `src/components/BaseHead.astro` |
| Tema (script light/dark) | `src/components/BaseHead.astro` (script inline) |
| Estilos do header (cores fixas) | `src/components/Header.astro` (bloco `<style>`) |
| Cards, hero, listagem | `src/styles/global.css` |
| Layout de post | `src/layouts/BlogPost.astro` |
| Páginas 404, categoria, busca | Estilos locais + variáveis globais |

---

## 6. Dark mode

O tema escuro é aplicado via atributo `data-theme="dark"` no `<html>`. Detalhes do comportamento e override pelo usuário estão em **docs/dark-mode.md**.
