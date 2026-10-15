# Assinatura em Arboria, com o losango como ponto

**Proposta, não adotada.** Em 13/10/2026 o Thi pediu os logotipos do grupo a
partir do logotipo que ele já usava: nome em **Arboria Book**, qualificador em
**Light** com entreletra larga, e o **losango do monograma no lugar do ponto
final**, em cor de acento.

O que está no ar nos sites continua sendo a Manrope com o monograma dos quatro
losangos. Adotar isto é uma virada e mexe em tudo de uma vez: tokens do pacote,
favicon, `apple-icon`, cartão de compartilhamento dos links e a capa das
propostas comerciais.

## Como chegou aqui

Foram oito desenhos comparados antes deste. O monograma ao lado do nome foi
rejeitado três vezes, sempre pelo mesmo motivo, e a causa só ficou clara na
terceira: **não era tamanho, era posição.** Monograma ao lado é um segundo
objeto na mesma linha e disputa o mesmo papel; ponto final pertence à frase e
não disputa com nada. A ideia de virar pontuação foi dele.

As medidas saem da própria fonte, lidas em tempo de geração: o ponto da Arboria
Book tem caixa de 11 por 11 e assenta de -10 a +1 em relação à linha de base. O
losango entra **um terço maior** que isso, porque losango tem metade da área de
um quadrado de mesma caixa e, no mesmo tamanho, pareceria menor que o ponto que
substitui.

## Gerar

```bash
cd ferramentas/assinatura-arboria
npm i opentype.js
node gera.mjs
```

Depende da **Arboria instalada em `~/Library/Fonts`** (Book e Light). É fonte
comercial e **não é redistribuída aqui**: o que este diretório versiona são
contornos, que são desenho, não fonte. Se a Arboria virar a tipografia dos
sites, aí é texto vivo no navegador e exige licença de webfont, que é outra
compra.

## O que sai

Três arquivos por marca, e a diferença é só a cor do ponto:

| Pasta | Ponto | Para |
|---|---|---|
| `svg/claro/` | `#0076d2` | fundo branco e claro |
| `svg/escuro/` | `#77c0f8` | fundo marinho, onde o azul de ação some |
| `svg/uma-cor/` | a cor do texto | carimbo, gravação, impressão em preto |

O texto é sempre `currentColor`: quem usa define a cor uma vez. Só o ponto é
fixo, porque acento que acompanha o texto deixa de ser acento. Ele sai com a
classe `acento`, para quem inserir o SVG dentro de uma página poder trocar a cor
por CSS.

## Três armadilhas que custaram tempo

**`readFileSync(...).buffer` não serve para carregar a fonte.** O Node aloca
Buffers pequenos num pool compartilhado, então o `ArrayBuffer` por trás é maior
que o arquivo. Use `b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)`.

**`font.getPath(ch, x, …)` com x diferente de zero devolve coordenada `NaN`**
para parte dos glifos nesta versão da biblioteca: o mesmo "a" sai íntegro em
x=0 e quebrado em x=67,8. Cada glifo é desenhado na origem e posicionado por
`translate`. O gerador aborta se encontrar `NaN`, porque o SVG resultante é
sintaticamente válido e desenha pela metade.

**O Quick Look do macOS não é conferidor.** Ele desenhou a assinatura pela
metade e eu culpei o visualizador; o arquivo é que estava quebrado. Daí o
`ver.py`: rasteriza em Python puro, respeita `fill-rule` e traço claro, e
**aborta se ler menos `<path>` do que o arquivo tem** — a primeira versão dele
ignorava `<path>` sem `transform` e desenhou um bloqueio inteiro sem o
monograma, sem reclamar de nada.

```bash
python3 ver.py svg/claro/partners.svg saida.png 900
```

## Páginas de revisão

`pagina.py` monta a folha das nove marcas; `comparar.py` monta a comparação dos
oito desenhos. As duas geram HTML autocontido.
