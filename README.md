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

/* Redundante e explícito. Medimos: build com e sem esta linha produz
   o mesmo CSS, porque o Tailwind v4 já varre o diretório de um CSS
   importado. Quem segura a integração é o @import acima. */
@source "../../node_modules/@barbosabatista/design/src";
```

### Verificar que o pacote chegou

A integração quebra em silêncio: sem o `@import`, o site perde cor, tipografia e
todas as classes de marca, e o build não reclama. Vale um teste depois do build:

```json
"design:check": "grep -rq -- '--navy:#002060' .next/static/chunks/*.css || (echo 'ERRO: tokens do bb-design fora do bundle' && exit 1)"
```

A sentinela é a **declaração de um token**, e não uma classe. Classe é gerada por
menção: o Tailwind varre markdown e comentário, então citar `fill-brand` na
documentação faz a classe aparecer no CSS e o teste passar sozinho. Declaração de
custom property só existe se o arquivo do pacote entrou no bundle.

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

## Negócio com domínio próprio (desde a v0.7.0)

Até a v0.6.0 a faixa presumia que todo negócio do grupo morava sob
`barbosabatista.com.br`. O Aluguei quebrou a premissa: marca e domínio próprios,
e mesmo assim negócio do grupo. Pertencer ao grupo e ser hospedado sob o domínio
do grupo são coisas diferentes.

`GroupBusiness` agora tem `subdomain` **ou** `domain`, os dois opcionais, e o
endereço se obtém por `endereco(business)`, nunca montando a string à mão.

```ts
import { GROUP, endereco } from "@barbosabatista/design";
GROUP.businesses.map((b) => endereco(b)); // funciona nos dois casos
```

⚠️ **Ao atualizar um site consumidor da v0.6.0 para cá**, procure por
`` `https://${b.subdomain}.` `` no projeto. Interpolação direta continua
compilando e passa a gerar `https://undefined.barbosabatista.com.br` para quem
tem domínio próprio. O `tsc` não pega, porque o campo virou opcional.

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
