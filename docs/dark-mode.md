# Dark mode automático

Este documento descreve a funcionalidade de dark mode do blog: como funciona, onde está implementada e como forçar o tema via console.

## Visão geral

O blog oferece **dark mode automático**:

- **Segue a preferência do sistema**: se o sistema operacional do usuário estiver em dark mode, o site é exibido em tema escuro; caso contrário, em tema claro.
- **Sem toggle na interface**: não há botão para alternar o tema; a escolha é sempre a do sistema (ou um override feito via console).
- **Override por console**: é possível forçar tema claro ou escuro usando comandos no console do navegador; o valor fica salvo em `localStorage` até ser removido.

---

## Como funciona

1. **Script no `<head>`**  
   O componente `BaseHead.astro` inclui um script inline que roda antes da pintura da página. Esse script:
   - Lê `localStorage.getItem('theme')`.
   - Se o valor for `'light'` ou `'dark'`, usa esse valor (override).
   - Caso contrário, usa a preferência do sistema via `window.matchMedia('(prefers-color-scheme: dark)')`.
   - Define o atributo `data-theme="light"` ou `data-theme="dark"` no elemento `<html>`.
   - Se não houver override, escuta mudanças na preferência do sistema e atualiza `data-theme` em tempo real.

2. **CSS**  
   Em `src/styles/global.css`:
   - `:root` define as variáveis do tema claro e `color-scheme: light dark`.
   - `[data-theme="dark"]` redefine as variáveis (cores de fundo, texto, accent, sombras) para o tema escuro.
   - Body, cards, footer e demais elementos usam variáveis CSS (ex.: `var(--bg-body)`, `var(--bg-card)`), de modo que o tema aplicado depende apenas do valor de `data-theme` no `<html>`.

3. **Onde as cores são usadas**  
   As cores de fundo e superfícies foram trocadas por variáveis nos seguintes arquivos:
   - `src/layouts/BlogPost.astro` (fundo do `main`)
   - `src/pages/index.astro` e `src/pages/categoria/[slug].astro` (fundo dos cards)
   - `src/components/Footer.astro` (fundo do rodapé)

---

## Comandos de console

Para forçar o tema ou voltar a seguir o sistema, use o console do navegador (F12 → aba *Console*).

### Forçar dark mode

```js
localStorage.setItem('theme', 'dark');
location.reload();
```

### Forçar light mode

```js
localStorage.setItem('theme', 'light');
location.reload();
```

### Voltar a seguir o sistema

```js
localStorage.removeItem('theme');
location.reload();
```

O script só lê `localStorage` na carga da página; por isso é necessário dar `location.reload()` após alterar `theme` para o novo valor ser aplicado.

---

## Referência técnica

| Item | Local |
|------|--------|
| Script que define `data-theme` | `src/components/BaseHead.astro` (primeiro bloco do `<head>`) |
| Variáveis do tema claro | `src/styles/global.css` → `:root` |
| Variáveis do tema escuro | `src/styles/global.css` → `[data-theme="dark"]` |
| Chave no `localStorage` | `theme` (valores: `'light'` ou `'dark'`) |
