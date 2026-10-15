"""Monta a folha de marca a partir dos SVGs gerados, sem copiar nada à mão."""

import re
from pathlib import Path

BASE = Path(__file__).parent
SVG = BASE / "svg"

MARCAS = [
    ("barbosa-batista", "Grupo Barbosa Batista", "A assinatura sem qualificador. É a do grupo e a do domínio raiz."),
    ("advogados", "Advogados", "Escritório. Provimento 205/2021 vale para tudo que leva este qualificador."),
    ("partners", "Partners", "Turnaround e special situations. É a referência que você já usava."),
    ("venture-private", "Venture & Private", "O qualificador mais longo do conjunto, e é ele que define a largura mínima de uso."),
    ("funding", "Funding", "Sala de investidores."),
    ("real-estate", "Real Estate", "Frente imobiliária, criada esta semana."),
    ("tecnologia", "Tecnologia", "Desenvolvimento de sistemas."),
    ("private-market", "Private Market", "Plataforma de venda de ativo premium."),
    ("instituto", "Instituto Barbosa Batista", "Aqui a hierarquia inverte: o nome da associação em cima, a marca embaixo."),
]


def simbolo(arquivo: str, pasta: str = "") -> tuple[str, str, float]:
    bruto = (SVG / pasta / f"{arquivo}.svg").read_text(encoding="utf-8")
    vb = re.search(r'viewBox="([^"]+)"', bruto).group(1)
    miolo = bruto.split(">", 1)[1].rsplit("</svg>", 1)[0]
    miolo = re.sub(r"<title>.*?</title>", "", miolo, flags=re.S).strip()
    largura, altura = (float(v) for v in vb.split()[2:])
    ident = f"{pasta.strip('/') or 'pilha'}-{arquivo}"
    return f'<symbol id="{ident}" viewBox="{vb}">{miolo}</symbol>', ident, largura / altura


simbolos, blocos = [], []
for arquivo, titulo, nota in MARCAS:
    claro, id_claro, prop = simbolo(arquivo, "claro")
    escuro, id_escuro, _ = simbolo(arquivo, "escuro")
    umacor, id_mono, _ = simbolo(arquivo, "uma-cor")
    simbolos += [claro, escuro, umacor]
    blocos.append(f"""
<article class="marca">
  <header>
    <h2>{titulo}</h2>
    <p class="nota">{nota}</p>
    <p class="arquivo">{arquivo}.svg</p>
  </header>
  <div class="tiles">
    <div class="tile claro"><svg class="logo" style="--prop:{prop:.3f}" role="img" aria-label="{titulo} sobre fundo claro"><use href="#{id_claro}"/></svg></div>
    <div class="tile navy"><svg class="logo" style="--prop:{prop:.3f}" role="img" aria-label="{titulo} sobre fundo marinho"><use href="#{id_escuro}"/></svg></div>
  </div>
  <div class="variantes">
    <div class="variante">
      <span>Uma cor só<em>uma-cor/{arquivo}.svg</em></span>
      <svg class="logo-peq" style="--prop:{prop:.3f}" role="img" aria-label="{titulo} em uma cor"><use href="#{id_mono}"/></svg>
    </div>
    <div class="variante">
      <span>Em tamanho de assinatura de e-mail<em>claro/{arquivo}.svg</em></span>
      <svg class="logo-mini" style="--prop:{prop:.3f}" role="img" aria-label="{titulo} reduzida"><use href="#{id_claro}"/></svg>
    </div>
  </div>
</article>""")

HTML = f"""<title>Marca Barbosa Batista · assinaturas em Arboria</title>
<style>
:root {{
  color-scheme: light dark;
  --navy: #002060;
  --navy-fundo: #04173f;
  --azul: #0076d2;
  --azul-claro: #77c0f8;
  --papel: #f5f7fb;
  --cartao: #ffffff;
  --linha: #dfe6f0;
  --tinta: #121c2b;
  --suave: #55637a;
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    --papel: #0a1326;
    --cartao: #111c33;
    --linha: rgb(148 180 226 / .18);
    --tinta: #eaf1fa;
    --suave: #a0b2cc;
    --azul: #77c0f8;
  }}
}}
:root[data-theme="dark"] {{
  --papel: #0a1326;
  --cartao: #111c33;
  --linha: rgb(148 180 226 / .18);
  --tinta: #eaf1fa;
  --suave: #a0b2cc;
  --azul: #77c0f8;
}}

* {{ box-sizing: border-box; }}
body {{
  margin: 0;
  background: var(--papel);
  color: var(--tinta);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}}
.folha {{ max-width: 60rem; margin: 0 auto; padding: clamp(1.5rem, 4vw, 3.5rem) clamp(1rem, 4vw, 2.5rem) 5rem; }}

header.topo {{ display: flex; flex-direction: column; gap: .75rem; padding-bottom: 2rem; border-bottom: 1px solid var(--linha); }}
.rotulo {{ font-size: .6875rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--azul); margin: 0; }}
h1 {{ font-size: clamp(1.6rem, 3.5vw, 2.1rem); line-height: 1.15; letter-spacing: -.02em; margin: 0; text-wrap: balance; }}
.entrada {{ margin: 0; max-width: 46ch; color: var(--suave); }}

.lista {{ display: flex; flex-direction: column; gap: 2.5rem; margin-top: 2.5rem; }}
.marca {{ display: flex; flex-direction: column; gap: 1rem; }}
.marca h2 {{ font-size: 1.0625rem; margin: 0; letter-spacing: -.01em; }}
.nota {{ margin: .15rem 0 0; font-size: .9375rem; color: var(--suave); max-width: 60ch; }}
.arquivo {{ margin: .35rem 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .8125rem; color: var(--azul); }}

.tiles {{ display: grid; gap: 1rem; grid-template-columns: 1fr; }}
@media (min-width: 46rem) {{ .tiles {{ grid-template-columns: 1fr 1fr; }} }}
.tile {{ display: grid; place-items: center; border-radius: 10px; padding: clamp(1.5rem, 4vw, 2.5rem); min-height: 9rem; }}
.tile.claro {{ background: #ffffff; color: var(--navy); border: 1px solid var(--linha); }}
.tile.navy {{ background: var(--navy-fundo); color: #ffffff; }}

/* O SVG nao tem largura propria: a proporcao vem do viewBox de cada assinatura,
   entao a altura e constante e a largura acompanha. E assim que se compara
   assinatura com assinatura sem uma parecer maior que a outra por acidente. */
.logo {{ width: min(100%, calc(var(--prop) * 4.2rem)); aspect-ratio: var(--prop); fill: currentColor; }}
.logo-mini {{ width: calc(var(--prop) * 1.4rem); aspect-ratio: var(--prop); fill: currentColor; color: var(--tinta); }}

.variantes {{ display: grid; gap: .75rem; grid-template-columns: 1fr; }}
@media (min-width: 46rem) {{ .variantes {{ grid-template-columns: 1fr 1fr; }} }}
.variante {{ display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .85rem 1.1rem; border: 1px dashed var(--linha); border-radius: 8px; }}
.variante span {{ font-size: .8125rem; color: var(--suave); display: flex; flex-direction: column; gap: .15rem; }}
.variante em {{ font-style: normal; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .75rem; color: var(--azul); }}
.logo-mini {{ width: calc(var(--prop) * 1.375rem); aspect-ratio: var(--prop); fill: currentColor; color: var(--tinta); flex: none; }}
.logo-peq {{ width: calc(var(--prop) * 1.6rem); aspect-ratio: var(--prop); fill: currentColor; color: var(--tinta); flex: none; }}

.fecho {{ margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--linha); display: flex; flex-direction: column; gap: 1rem; }}
.fecho h2 {{ font-size: 1.0625rem; margin: 0; }}
.fecho p {{ margin: 0; color: var(--suave); max-width: 68ch; }}
.fecho b {{ color: var(--tinta); font-weight: 600; }}
</style>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">{''.join(simbolos)}</svg>

<div class="folha">
  <header class="topo">
    <p class="rotulo">Proposta de assinatura</p>
    <h1>Marca Barbosa Batista, em Arboria</h1>
    <p class="entrada">Nove marcas com o losango no lugar do ponto final. Nome em Arboria Book, qualificador em Light com entreletra larga, tipografia convertida em contorno. Três arquivos por marca: fundo claro, fundo escuro e uma cor só.</p>
  </header>

  <div class="lista">{''.join(blocos)}</div>

  <section class="fecho">
    <h2>O que você precisa saber antes de adotar</h2>
    <p><b>Os arquivos estão em <code>~/Documents/Marca Barbosa Batista</code>.</b> São SVG com a cor herdada de onde forem colocados: ficam brancos sobre o marinho e marinho sobre o branco, sem precisar de duas versões.</p>
    <p><b>Isto substitui a identidade que está no ar.</b> Os sites do grupo usam Manrope e o monograma dos quatro losangos. Adotar esta assinatura significa trocar o pacote de marca, o favicon, o cartão de compartilhamento e a capa das propostas. Não é um arquivo novo, é uma virada, e vale fazer de uma vez em vez de aos poucos.</p>
    <p><b>A Arboria é fonte comercial.</b> Contorno é desenho, e logotipo em contorno não redistribui fonte nenhuma. Mas se a Arboria virar a tipografia dos sites, aí é texto vivo no navegador e exige licença de webfont, que é outra compra.</p>
    <p><b>O losango é pontuação, não símbolo ao lado.</b> Foi a sua ideia, e é o que resolve a competição: monograma ao lado é um segundo objeto na mesma linha; ponto final pertence à frase. As medidas saíram da própria fonte, e o losango entrou um terço maior que o ponto da Arboria porque losango tem metade da área de um quadrado de mesma caixa.</p>
    <p><b>Três arquivos por marca, e a diferença é só a cor do ponto.</b> Em <code>claro/</code> ele é o azul de ação; em <code>escuro/</code>, o azul claro do grupo, porque o de ação some no marinho; em <code>uma-cor/</code>, a mesma cor do texto, para carimbo, gravação e impressão em preto. O texto é sempre herdado de onde o arquivo for colocado.</p>
    <p><b>No Instituto a hierarquia inverte</b>, com o nome da associação em cima e a marca embaixo, e ali o qualificador é mais largo que o nome. Por isso o quadro é medido das extremidades reais: a primeira versão centralizou por conta e jogou metade de "BARBOSA" para fora do arquivo.</p>
    <p><b>O monograma dos quatro losangos continua existindo</b> e não muda: é ele na aba do navegador, no avatar e no ícone de aplicativo, onde desenho fino desaparece. O que saiu foi a presença dele ao lado do nome.</p>
  </section>
</div>
"""

(BASE / "marca.html").write_text(HTML, encoding="utf-8")
print("marca.html", len(HTML), "bytes")
