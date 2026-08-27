# @barbosabatista/design

Identidade visual do Grupo Barbosa Batista. Fonte única para os sites do grupo:
tokens de cor e tipografia, componentes de marca e a faixa que liga os cinco
endereços.

Existe por um motivo concreto. A faixa do grupo vivia colada à mão em dois
repositórios e divergiu num detalhe de acessibilidade em menos de um dia. Cópia
diverge; dependência não.

## Instalar

```bash
pnpm add "@barbosabatista/design@github:thiagobbatista/bb-design#v0.1.0"
```

Fixe sempre numa tag. Atualizar a marca é subir a tag aqui e a versão lá.

## Ligar num projeto Next

**1. Transpilar o pacote.** Ele é publicado em TypeScript, sem passo de build.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ["@barbosabatista/design"],
};
```

**2. Importar os tokens**, depois do Tailwind e antes do CSS do projeto.

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "@barbosabatista/design/tokens.css";

/* Sem isto o Tailwind não enxerga as classes usadas dentro do pacote
   e os componentes de marca saem sem estilo. O caminho é relativo a
   este arquivo. */
@source "../../node_modules/@barbosabatista/design/src";
```

**3. Usar.**

```tsx
import { GroupStrip, LogoMark, logoLabel } from "@barbosabatista/design";

<GroupStrip current="advogados" />
<Link href="/" aria-label={logoLabel("Advogados")}>
  <LogoMark qualifier="Advogados" />
</Link>
```

## O que está aqui, e o que não está

**Está:** tokens (`:root`, `.dark`, `.band-navy`), classes de marca (`.display`,
`.section-label`, `.card-inst`, `.stat-solid`, `.rule`, `.bg-hero-navy`,
`.container-luxe`), o monograma, o nome com qualificador e a faixa do grupo.

**Não está:** componentes de página, conteúdo, e nada de shadcn. Cada site tem os
seus. O pacote é identidade, não biblioteca de interface.

Os componentes não embrulham o nome num link: cada aplicação usa o seu próprio
`Link`, porque o destino muda conforme o site é servido por subdomínio ou por
caminho. Por isso o pacote não depende do Next.

## Marca

Manrope em tudo, caixa de frase. Base branca com faixas `band-navy` que invertem
os tokens. O cinza de texto secundário é `#63707f`, e não o `#999999` da
referência original: aquele reprova em contraste. Copiamos o design, não o
defeito.

## Se um negócio do grupo for vendido

O comprador não precisa manter a dependência. Copiar `src/` para dentro do
projeto dele e trocar os imports encerra o vínculo, sem reescrever nada. Foi
por isso que o pacote ficou pequeno e sem dependência de framework.

## Versionar

Mudança de token ou de componente sobe versão e tag. Nunca edite este pacote a
partir de um projeto consumidor.
