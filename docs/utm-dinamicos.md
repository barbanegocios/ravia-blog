# UTMs dinâmicos nos posts

Este documento descreve o sistema de UTMs dinâmicos do blog: como configurar grupos de UTM, como usar no conteúdo dos posts e como o link final é montado no navegador.

## Visão geral

O sistema permite:

- **Usar um mesmo link em todos os posts** sem repetir o slug em cada artigo.
- **Definir valores padrão de UTM** (source, medium, campaign, content) em um único arquivo de configuração.
- **Preencher `utm_term` automaticamente** com o slug do post em que o link está (ex.: no post `/burnout-empreendedor/`, o link ganha `utm_term=burnout-empreendedor`).

Assim, o autor escreve uma única convenção no markdown (ex.: `https://ravia.app/[cta_utm]`) e, quando o leitor abre a página do post, o link é resolvido no navegador com todos os parâmetros UTM corretos, incluindo o slug naquele post.

**Escopo:** a funcionalidade vale para **links dentro do corpo do post** (conteúdo em markdown) e para **links dos banners in-article** (configurados em `src/data/banners.ts`). Banners da home e CTA do header não usam este sistema.

---

## Como funciona

### Grupos de UTM

Os parâmetros padrão são organizados em **grupos nomeados**. Cada grupo tem um nome (ex.: `cta_utm`) e um conjunto fixo de parâmetros (source, medium, campaign, content). O `utm_term` não fica na configuração: é sempre o **slug do post** e é calculado na hora em que a página do post é aberta.

### Placeholder no link

No texto do post, em vez de escrever a URL completa com todos os UTMs e o slug, você usa um **placeholder** no formato `[nome_do_grupo]` dentro da URL. Exemplo:

- Link desejado no post "burnout-empreendedor":  
  `https://ravia.app/?utm_source=blog&utm_medium=org&utm_campaign=trial&utm_content=cta&utm_term=burnout-empreendedor`
- No markdown você escreve:  
  `https://ravia.app/[cta_utm]`

O placeholder `[cta_utm]` indica que aquele link deve usar o grupo **cta_utm** e receber os parâmetros desse grupo mais o `utm_term` igual ao slug do post.

### Resolução no cliente

O HTML do post é gerado com o link ainda contendo o placeholder (ou sua forma codificada, ex.: `%5Bcta_utm%5D`). Um script JavaScript roda **apenas na página do post** (layout `BlogPost.astro`):

1. Lê o pathname da página (ex.: `/burnout-empreendedor/`).
2. Obtém o slug (ex.: `burnout-empreendedor`) para usar como `utm_term`.
3. Procura todos os links dentro do container `.prose` cujo `href` contém algum placeholder de grupo conhecido.
4. Para cada um, remove o placeholder da URL, adiciona os parâmetros do grupo e o `utm_term`, e atualiza o `href` do elemento.

O usuário vê e clica no link já com a URL final. A resolução acontece antes do clique, ao carregar a página.

---

## Como usar nos posts

### Sintaxe no markdown

Use a URL com o placeholder no path ou onde fizer sentido. O grupo deve existir em `src/data/utm.ts`.

**Exemplo com o grupo `cta_utm`:**

```markdown
[Faça seu teste grátis](https://ravia.app/[cta_utm])
```

Ou com o link como URL pura (ex.: em texto ou em bloco de destaque):

```markdown
**[Comece agora](https://ravia.app/[cta_utm]) e veja os resultados.**
```

### Qualquer URL de destino

O placeholder pode ser usado em qualquer domínio. O sistema só substitui o trecho `[nome_do_grupo]` e acrescenta os query params do grupo + `utm_term`. Exemplo:

```markdown
[Inscreva-se na lista](https://outro-dominio.com/landing/[cta_utm])
```

Resultado (no post com slug `meu-post`):  
`https://outro-dominio.com/landing/?utm_source=blog&utm_medium=org&utm_campaign=trial&utm_content=cta&utm_term=meu-post`

### Regra do `utm_term`

Na página do post, a URL é sempre do tipo `/slug/` ou `/slug`. O script usa esse segmento como `utm_term`. Exemplos:

- Post em `https://blog.ravia.app/burnout-empreendedor/` → `utm_term=burnout-empreendedor`
- Post em `https://blog.ravia.app/gestao-tempo-microempresa/` → `utm_term=gestao-tempo-microempresa`

Não é necessário (nem possível, neste escopo) definir `utm_term` manualmente no conteúdo.

---

## Configuração

### Arquivo de grupos: `src/data/utm.ts`

Os grupos e seus parâmetros fixos ficam em **`src/data/utm.ts`**.

Exemplo com o grupo `cta_utm`:

```ts
export const UTM_GROUPS = {
  cta_utm: {
    utm_source: 'blog',
    utm_medium: 'org',
    utm_campaign: 'trial',
    utm_content: 'cta',
  },
  // Adicione outros grupos conforme necessário:
  // outro_grupo: { utm_source: '...', utm_medium: '...', ... },
} as const;
```

- Cada chave é o **nome do grupo** (usado no placeholder: `[nome_do_grupo]`).
- Cada valor é um objeto com os parâmetros UTM **fixos** (sem `utm_term`).
- O `utm_term` é sempre preenchido pelo script com o slug do post.

### Adicionar um novo grupo

1. Abra `src/data/utm.ts`.
2. Adicione uma nova entrada em `UTM_GROUPS` com o nome desejado e os parâmetros:

   ```ts
   export const UTM_GROUPS = {
     cta_utm: { ... },
     newsletter: {
       utm_source: 'blog',
       utm_medium: 'org',
       utm_campaign: 'newsletter',
       utm_content: 'post',
     },
   } as const;
   ```

3. Nos posts, use o placeholder com esse nome:  
   `https://exemplo.com/form/[newsletter]`

Não é necessário alterar o script de resolução: ele percorre todos os grupos definidos em `UTM_GROUPS`.

---

## Onde a funcionalidade se aplica

- **Aplica-se:**
  - Links no **corpo do post** (markdown em `src/content/blog/**/*.md`).
  - Links dos **banners in-article** (definidos em `src/data/banners.ts` com `link` contendo um placeholder, ex.: `https://ravia.app/[banner_inline_utm]`). O banner é injetado pelo rehype dentro do conteúdo do post, então o script que atua em `.prose` resolve o link e preenche `utm_term` com o slug daquele post.
- **Não se aplica:** Banners da **home** e CTA do **header** (links fixos, sem placeholder). Páginas de categoria não incluem o script.

O script de resolução é incluído apenas no layout da página do post (`BlogPost.astro`), não na home nem nas páginas de categoria.

---

## Detalhes técnicos

### Arquivos envolvidos

| Arquivo | Função |
|--------|--------|
| `src/data/utm.ts` | Define os grupos UTM (nomes e parâmetros fixos). |
| `src/scripts/resolve-utm-links.ts` | Lógica no cliente: obtém o slug do pathname, encontra links com placeholder dentro de `.prose`, substitui pelo href completo com UTMs. |
| `src/components/UtmResolver.astro` | Inclui o script acima no bundle da página. |
| `src/layouts/BlogPost.astro` | Usa `<UtmResolver />` para que o script rode apenas nas páginas de post. |

### Fluxo

1. O markdown do post contém algo como `[texto](https://ravia.app/[cta_utm])`.
2. O Astro gera o HTML do post; o `href` pode sair com `[cta_utm]` ou na forma codificada (`%5Bcta_utm%5D`).
3. Na página do post, o script importado por `UtmResolver` é executado (no carregamento ou em `DOMContentLoaded`).
4. O script decodifica o `href` dos links em `.prose`, identifica os que contêm um placeholder de grupo conhecido, remove o placeholder, monta a URL com os parâmetros do grupo e com `utm_term` = slug do post, e atribui essa URL ao `href` do elemento.
5. O usuário vê e clica no link já com a URL final (ex.: `https://ravia.app/?utm_source=blog&...&utm_term=burnout-empreendedor`).

### Href codificado

Em alguns casos o HTML ou o navegador pode expor o placeholder já codificado (colchetes como `%5B` e `%5D`). O script usa `decodeURI()` no `href` antes de procurar o placeholder, para que a detecção funcione tanto com `[cta_utm]` quanto com `%5Bcta_utm%5D`.

### Query string existente

Se a URL já tiver query string (ex.: `https://ravia.app/?ref=blog`), o script adiciona ou atualiza os parâmetros UTM nessa mesma query, sem apagar o restante.
