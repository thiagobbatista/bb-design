"""
Rasteriza o SVG gerado para eu CONFERIR o desenho antes de entregar.

Existe porque errei duas vezes em cima do mesmo arquivo. Primeiro o Quick Look
do macOS desenhou a assinatura pela metade e eu culpei o visualizador: o SVG
estava mesmo quebrado, com coordenada `NaN` no meio. Depois, a primeira versão
deste conferidor só enxergava `<path>` que tivesse `transform` próprio, então
desenhou o bloqueio inteiro SEM o monograma e não reclamou de nada.

A lição ficou no código: ele conta os `<path>` do arquivo e aborta se tiver lido
menos do que existe. Verificação que não sabe falhar não verifica.

Python puro, sem PIL e sem rsvg, pelo mesmo motivo do gerador de favicon deste
repositório: a máquina não tem nenhum dos dois.
"""

import re
import sys
import zlib
import struct

SUPER = 3  # supersample por eixo


def parse_path(d):
    """Converte `d` em subcaminhos de pontos. Só absolutos: M, L, H, V, Q, C, Z."""
    tokens = re.findall(r"([MLQCZHVmlqczhv])|(-?\d*\.?\d+(?:e-?\d+)?)", d)
    cmds, nums = [], []
    for c, n in tokens:
        if c:
            cmds.append((c, len(nums)))
        else:
            nums.append(float(n))

    subs, atual = [], []
    x = y = 0.0
    for i, (c, pos) in enumerate(cmds):
        fim = cmds[i + 1][1] if i + 1 < len(cmds) else len(nums)
        a = nums[pos:fim]
        if c == "M":
            if atual:
                subs.append(atual)
            x, y = a[0], a[1]
            atual = [(x, y)]
            for j in range(2, len(a) - 1, 2):
                x, y = a[j], a[j + 1]
                atual.append((x, y))
        elif c == "L":
            for j in range(0, len(a) - 1, 2):
                x, y = a[j], a[j + 1]
                atual.append((x, y))
        elif c == "H":
            for v in a:
                x = v
                atual.append((x, y))
        elif c == "V":
            for v in a:
                y = v
                atual.append((x, y))
        elif c == "Q":
            for j in range(0, len(a) - 3, 4):
                cx, cy, nx, ny = a[j : j + 4]
                for k in range(1, 13):
                    t = k / 12
                    u = 1 - t
                    atual.append((u * u * x + 2 * u * t * cx + t * t * nx,
                                  u * u * y + 2 * u * t * cy + t * t * ny))
                x, y = nx, ny
        elif c == "C":
            for j in range(0, len(a) - 5, 6):
                c1x, c1y, c2x, c2y, nx, ny = a[j : j + 6]
                for k in range(1, 17):
                    t = k / 16
                    u = 1 - t
                    atual.append((u**3 * x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t**3 * nx,
                                  u**3 * y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t**3 * ny))
                x, y = nx, ny
        elif c in "Zz":
            if atual:
                subs.append(atual)
                atual = []
    if atual:
        subs.append(atual)
    return subs


def coletar(svg):
    """Caminhos do arquivo com o translate acumulado, a regra de preenchimento e
    se o traço é claro (que no monograma é o que abre os losangos)."""
    padrao = re.compile(r'<g transform="translate\(([-\d. ]+)\)">|</g>|<path\b([^>]*)>')
    gx = gy = 0.0
    saida = []
    for m in padrao.finditer(svg):
        if m.group(1) is not None:
            gx, gy = (float(v) for v in m.group(1).split())
        elif m.group(2) is not None:
            attrs = m.group(2)
            d = re.search(r'd="([^"]+)"', attrs)
            if not d:
                continue
            t = re.search(r'transform="translate\(([-\d. ]+)\)"', attrs)
            px, py = (float(v) for v in t.group(1).split()) if t else (0.0, 0.0)
            fill = (re.search(r'fill="([^"]+)"', attrs) or [None, ""])[1]
            subs = [[(x + gx + px, y + gy + py) for x, y in s] for s in parse_path(d.group(1))]
            saida.append({
                "subs": subs,
                "evenodd": 'fill-rule="evenodd"' in attrs,
                "claro": fill.lower() in ("#fff", "#ffffff", "white"),
            })
        else:
            gx = gy = 0.0

    existentes = svg.count("<path")
    if len(saida) != existentes:
        raise SystemExit(f"li {len(saida)} de {existentes} caminhos: a conferência estaria cega")
    return saida


def cobertura_de(caminho, larg, alt, vb, escala):
    vx, vy = vb[0], vb[1]
    arestas = []
    for sub in caminho["subs"]:
        pts = sub + [sub[0]]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            if y0 != y1:
                arestas.append((x0, y0, x1, y1))

    cob = [[0.0] * larg for _ in range(alt)]
    for py in range(alt * SUPER):
        y = vy + (py + 0.5) / SUPER / escala
        cruz = []
        for x0, y0, x1, y1 in arestas:
            if (y0 <= y < y1) or (y1 <= y < y0):
                t = (y - y0) / (y1 - y0)
                cruz.append((x0 + t * (x1 - x0), 1 if y1 > y0 else -1))
        if not cruz:
            continue
        cruz.sort()
        acum = 0
        linha = cob[py // SUPER]
        for i in range(len(cruz) - 1):
            acum += cruz[i][1]
            dentro = (i % 2 == 0) if caminho["evenodd"] else (acum != 0)
            if not dentro:
                continue
            xa = (cruz[i][0] - vx) * escala * SUPER
            xb = (cruz[i + 1][0] - vx) * escala * SUPER
            for px in range(max(0, int(xa)), min(larg * SUPER, int(xb) + 1)):
                parte = min(xb, px + 1) - max(xa, px)
                if parte > 0:
                    linha[px // SUPER] += parte / (SUPER * SUPER)
    return cob


def png(tinta, larg, alt, caminho):
    linhas = bytearray()
    for y in range(alt):
        linhas.append(0)
        for x in range(larg):
            v = 255 - int(255 * min(1.0, max(0.0, tinta[y][x])))
            linhas += bytes((v, v, v))

    def bloco(tipo, dados):
        return (struct.pack(">I", len(dados)) + tipo + dados
                + struct.pack(">I", zlib.crc32(tipo + dados) & 0xFFFFFFFF))

    with open(caminho, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(bloco(b"IHDR", struct.pack(">IIBBBBB", larg, alt, 8, 2, 0, 0, 0)))
        f.write(bloco(b"IDAT", zlib.compress(bytes(linhas), 6)))
        f.write(bloco(b"IEND", b""))


def main(svg_path, png_path, largura_alvo=900):
    svg = open(svg_path, encoding="utf-8").read()
    if "NaN" in svg:
        raise SystemExit("o SVG tem coordenada NaN")
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    escala = largura_alvo / vb[2]
    larg, alt = int(vb[2] * escala), int(vb[3] * escala)

    # Pintor: cada caminho na ordem do arquivo. Traço claro APAGA o que está
    # embaixo, que é como os losangos brancos abrem o monograma.
    tinta = [[0.0] * larg for _ in range(alt)]
    caminhos = coletar(svg)
    for c in caminhos:
        cob = cobertura_de(c, larg, alt, vb, escala)
        alvo = 0.0 if c["claro"] else 1.0
        for y in range(alt):
            fy, cy = tinta[y], cob[y]
            for x in range(larg):
                a = min(1.0, cy[x])
                if a:
                    fy[x] = fy[x] * (1 - a) + alvo * a

    png(tinta, larg, alt, png_path)
    print(f"{png_path}  {larg}x{alt}  {len(caminhos)} caminhos")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 900)
