"""Monta a página de comparação das variantes de bloqueio."""

import re
from pathlib import Path

BASE = Path(__file__).parent
SVG = BASE / "svg" / "comparar"

VARIANTES = [
    ("ponto-losango", "Losango como ponto final",
     "O símbolo vira pontuação: pertence à frase em vez de disputar com ela. Guarda o parentesco com o ícone."),
    ("ponto-discreto", "Losango como ponto, menor",
     "O mesmo, na caixa exata do ponto da fonte. Mais discreto, e no limite de sumir em tamanho pequeno."),
    ("ponto-real", "O ponto da própria fonte",
     "O logotipo que você já usa, com o ponto em cor de acento. É a régua a ser batida."),
    ("contorno", "Losangos em contorno, ao lado",
     "O traço tem o calibre da haste da Arboria Book. A melhor das que põem o monograma ao lado."),
    ("um-losango", "Um losango ao lado",
     "Quieto, e genérico: sozinho lê como marcador de lista e perde o parentesco com o ícone."),
    ("losangos", "Quatro losangos cheios",
     "Sem a moldura, mas ainda preenchidos: quatro pontos de contraste máximo ao lado de um traço fino."),
    ("quadrado-cap", "Quadrado na altura da letra",
     "A moldura fica, menor: para na caixa-alta do nome em vez de descer até o qualificador."),
    ("quadrado-bloco", "Quadrado cheio",
     "A primeira entrega. Moldura na altura do bloco inteiro."),
]

MARCAS = [
    ("partners", "Partners"),
    ("venture-private", "Venture & Private"),
    ("barbosa-batista", "Grupo"),
]


def simbolo(arquivo, variante):
    bruto = (SVG / f"{arquivo}--{variante}.svg").read_text(encoding="utf-8")
    vb = re.search(r'viewBox="([^"]+)"', bruto).group(1)
    miolo = re.sub(r"<title>.*?</title>", "", bruto.split(">", 1)[1].rsplit("</svg>", 1)[0], flags=re.S).strip()
    larg, alt = (float(v) for v in vb.split()[2:])
    ident = f"{arquivo}-{variante}"
    return f'<symbol id="{ident}" viewBox="{vb}">{miolo}</symbol>', ident, larg / alt


simbolos, secoes = [], []
for arquivo, titulo in MARCAS:
    linhas = []
    for variante, nome, nota in VARIANTES:
        sym, ident, prop = simbolo(arquivo, variante)
        simbolos.append(sym)
        linhas.append(f"""
    <div class="linha">
      <div class="legenda">
        <h3>{nome}</h3>
        <p>{nota}</p>
      </div>
      <div class="tile claro"><svg class="logo" style="--prop:{prop:.3f}"><use href="#{ident}"/></svg></div>
      <div class="tile navy"><svg class="logo" style="--prop:{prop:.3f}"><use href="#{ident}"/></svg></div>
      <div class="tile mini"><svg class="logo-mini" style="--prop:{prop:.3f}"><use href="#{ident}"/></svg></div>
    </div>""")
    secoes.append(f"""
  <section class="marca">
    <h2>{titulo}</h2>
    <div class="cabecalho-colunas"><span></span><span>Claro</span><span>Marinho</span><span>22 px de altura</span></div>
    {''.join(linhas)}
  </section>""")

HTML = f"""<title>Oito assinaturas, lado a lado</title>
<style>
:root {{
  color-scheme: light dark;
  --navy-fundo: #04173f;
  --navy: #002060;
  --azul: #0076d2;
  --papel: #f5f7fb;
  --linha: #dfe6f0;
  --tinta: #121c2b;
  --suave: #55637a;
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --papel: #0a1326; --linha: rgb(148 180 226 / .18);
    --tinta: #eaf1fa; --suave: #a0b2cc; --azul: #77c0f8;
  }}
}}
:root[data-theme="dark"] {{
  --papel: #0a1326; --linha: rgb(148 180 226 / .18);
  --tinta: #eaf1fa; --suave: #a0b2cc; --azul: #77c0f8;
}}

* {{ box-sizing: border-box; }}
body {{
  margin: 0; background: var(--papel); color: var(--tinta);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased;
}}
.folha {{ max-width: 66rem; margin: 0 auto; padding: clamp(1.5rem, 4vw, 3.5rem) clamp(1rem, 4vw, 2.5rem) 5rem; }}

.topo {{ display: flex; flex-direction: column; gap: .75rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--linha); }}
.rotulo {{ font-size: .6875rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--azul); margin: 0; }}
h1 {{ font-size: clamp(1.6rem, 3.5vw, 2.1rem); line-height: 1.15; letter-spacing: -.02em; margin: 0; text-wrap: balance; }}
.entrada {{ margin: 0; max-width: 52ch; color: var(--suave); }}

.marca {{ margin-top: 3rem; }}
.marca h2 {{ font-size: 1.0625rem; margin: 0 0 1rem; letter-spacing: -.01em; }}

.cabecalho-colunas, .linha {{ display: grid; gap: .75rem; grid-template-columns: 1fr; align-items: center; }}
@media (min-width: 58rem) {{
  .cabecalho-colunas, .linha {{ grid-template-columns: 15rem 1fr 1fr 11rem; }}
}}
.cabecalho-colunas {{ margin-bottom: .5rem; }}
.cabecalho-colunas span {{ font-size: .6875rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--suave); }}
@media (max-width: 57.99rem) {{ .cabecalho-colunas {{ display: none; }} }}

.linha {{ padding: 1rem 0; border-top: 1px solid var(--linha); }}
.legenda h3 {{ font-size: .9375rem; margin: 0; }}
.legenda p {{ font-size: .8125rem; color: var(--suave); margin: .25rem 0 0; }}

.tile {{ display: grid; place-items: center; border-radius: 10px; padding: 1.5rem 1rem; min-height: 6.5rem; }}
.tile.claro {{ background: #ffffff; color: var(--navy); border: 1px solid var(--linha); --acento: #0076d2; }}
.tile.navy {{ background: var(--navy-fundo); color: #ffffff; --acento: #77c0f8; }}
.tile.mini {{ background: transparent; border: 1px dashed var(--linha); color: var(--tinta); --acento: var(--azul); min-height: 4rem; }}
.acento {{ fill: var(--acento, #0076d2); }}

.logo {{ width: min(100%, calc(var(--prop) * 3.4rem)); aspect-ratio: var(--prop); fill: currentColor; }}
.logo-mini {{ width: calc(var(--prop) * 1.375rem); aspect-ratio: var(--prop); fill: currentColor; }}

.fecho {{ margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--linha); display: flex; flex-direction: column; gap: 1rem; }}
.fecho h2 {{ font-size: 1.0625rem; margin: 0; }}
.fecho p {{ margin: 0; color: var(--suave); max-width: 68ch; }}
.fecho b {{ color: var(--tinta); font-weight: 600; }}
</style>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">{''.join(simbolos)}</svg>

<div class="folha">
  <header class="topo">
    <p class="rotulo">Comparação</p>
    <h1>Oito assinaturas, lado a lado</h1>
    <p class="entrada">Oito tratamentos do símbolo. Os três primeiros são a ideia sua de transformá-lo em pontuação; os cinco seguintes o mantêm como elemento ao lado do nome. A coluna estreita à direita mostra cada um a 22 pixels de altura, que é o tamanho de assinatura de e-mail e onde desenho fino costuma sumir.</p>
  </header>
{''.join(secoes)}

  <section class="fecho">
    <h2>O que olhar</h2>
    <p><b>O ponto resolve o problema por outro caminho.</b> Monograma ao lado compete porque é um segundo objeto na mesma linha. Ponto final não compete com nada, porque pertence à frase. Foi a sua ideia e ela está certa.</p>
    <p><b>As medidas do ponto saíram da própria fonte</b>, não do olho: a caixa do ponto da Arboria Book tem 11 por 11 e assenta um pouco abaixo da linha de base. O losango é um terço maior que isso, porque losango tem metade da área de um quadrado de mesma caixa e, no mesmo tamanho, pareceria menor que o ponto que substitui.</p>
    <p><b>O contorno é o que empata de peso com a tipografia</b>, e é a minha recomendação entre as que têm símbolo. O risco dele é o tamanho pequeno: o vão interno fecha antes do resto sumir.</p>
    <p><b>O losango único ficou mais quieto, e também mais genérico.</b> Sozinho ele lê como marcador de lista, não como símbolo da casa, e perde o parentesco com o ícone dos quatro.</p>
    <p><b>O tamanho pequeno é o teste de verdade.</b> Nos losangos soltos, o vão entre eles pode fechar; no quadrado cheio, os losangos internos é que somem. Compare a coluna da direita antes de decidir pela coluna do meio.</p>
    <p><b>Isto não muda o ícone.</b> Na aba do navegador e no avatar o quadrado sólido continua sendo o certo, porque marca vazada desaparece aos 16 pixels. A escolha aqui vale para o bloqueio em tamanho de leitura.</p>
  </section>
</div>
"""

(BASE / "comparar.html").write_text(HTML, encoding="utf-8")
print("comparar.html", len(HTML), "bytes")
