# dakasa-yggdrasil.github.io

Landing page oficial do **Yggdrasil** — o control plane self-hosted para workflows
declarativos, integrações plugáveis e ciclo de vida de identidade.

🌐 **https://dakasa-yggdrasil.github.io/**

## O que é isto

Um site estático (HTML + CSS + JS vanilla, **zero build**) servido pelo GitHub Pages
a partir da raiz da branch `main`. Não há toolchain: editar `index.html` / `styles.css`
/ `main.js` e dar push já publica.

```
index.html        # a página (todas as seções)
styles.css        # tema aurora / árvore-mundo, responsivo
main.js           # nav, copiar-comando, reveal no scroll, grafo do hero
assets/
  favicon.svg     # marca da árvore-mundo
  og.svg          # imagem Open Graph (compartilhamento)
.nojekyll         # serve os arquivos como-estão (sem processamento Jekyll)
```

## Desenvolvimento

Sem dependências. Abra `index.html` no navegador, ou sirva localmente:

```bash
python3 -m http.server 8000   # http://localhost:8000
```

## Conteúdo

A copy é derivada do **código real** dos repositórios da org (não de docs antigas):
a CLI (`dakasa-yggdrasil/yggdrasil`), o core (`yggdrasil-core`), o SDK
(`yggdrasil-sdk-go`) e as integrações (`integration-*`). Ao mudar capacidades do
produto, atualize as seções correspondentes aqui.

Licença: Apache-2.0.
