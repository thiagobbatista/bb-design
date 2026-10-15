/**
 * Gera os logotipos do grupo em SVG, com a tipografia CONVERTIDA EM CONTORNO.
 *
 * Texto em SVG depende da fonte estar instalada em quem abre o arquivo. Logo é
 * justamente o que vai parar em apresentação de terceiro, assinatura de e-mail e
 * gráfica, então aqui cada letra vira `<path>`: o arquivo passa a não depender
 * de nada e deixa de poder ser editado como texto, que é o comportamento certo
 * para uma marca.
 *
 * A fonte é a Arboria, que o Thi já usava e tem instalada. É fonte comercial, e
 * o arquivo gerado não a redistribui: contorno é desenho, não fonte.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import opentype from "opentype.js";

const FONTES = `${process.env.HOME}/Library/Fonts`;
const SAIDA = new URL("./svg/", import.meta.url).pathname;

/**
 * `buffer.buffer` NÃO serve aqui. O Node aloca Buffers pequenos num pool
 * compartilhado, então o `ArrayBuffer` por trás é maior que o arquivo e começa
 * num deslocamento. Passar ele inteiro faz a fonte ser lida a partir do lugar
 * errado, e o sintoma é traiçoeiro: a fonte carrega, a maioria dos glifos sai
 * certa, e alguns saem com coordenada `NaN` no meio do caminho. O SVG fica
 * sintaticamente válido e desenha pela metade.
 */
const carregar = (arq) => {
  const b = readFileSync(`${FONTES}/${arq}`);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const nomeFonte = carregar("Arboria-Book.ttf"); // peso do original no Figma, confirmado por ele em 13/10
const qualFonte = carregar("Arboria-Light.ttf");

/**
 * Desenha uma linha de texto com entreletra controlada.
 *
 * O `getPath` da biblioteca não aceita tracking, então cada glifo é posicionado
 * à mão a partir do avanço dele. É isso que permite a assinatura do qualificador
 * ter o espaçamento largo da referência sem virar imagem esticada.
 */
function linha(fonte, texto, tamanho, tracking) {
  let x = 0;
  const glifos = [];
  for (const ch of texto) {
    // ⚠️ Cada glifo é desenhado na ORIGEM e posicionado por `translate`.
    //
    // Pedir `fonte.getPath(ch, x, …)` com x diferente de zero devolve, nesta
    // versão da biblioteca, caminhos com coordenada `NaN` para parte dos
    // glifos: o mesmo "a" sai íntegro em x=0 e quebrado em x=67,8. O SVG
    // continua sintaticamente válido e desenha pela metade, que é o pior tipo
    // de defeito, porque parece problema do visualizador.
    const d = fonte.charToGlyph(ch).getPath(0, 0, tamanho).toPathData(2);
    if (d.includes("NaN")) throw new Error(`glifo ${JSON.stringify(ch)} saiu com NaN`);
    if (d) glifos.push({ d, dx: x });
    x += fonte.getAdvanceWidth(ch, tamanho) + tracking;
  }
  // O tracking do último glifo não conta para a largura: ele é espaço à direita.
  const largura = x - (texto.length ? tracking : 0);
  return { glifos, largura };
}

/** Posiciona uma linha inteira, com cada glifo no seu deslocamento. */
function mover(linhaDesenhada, dx, dy) {
  const corpo = linhaDesenhada.glifos
    .map((g) => `  <path transform="translate(${g.dx.toFixed(2)} 0)" d="${g.d}"/>`)
    .join("\n");
  return `<g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})">\n${corpo}\n</g>`;
}

/**
 * Assinatura empilhada: nome em caixa alta e baixa, qualificador em versal com
 * entreletra larga. É o desenho que ele já usava e aprovou, e a hierarquia vem
 * do espaçamento, não de peso nem de cor.
 */
function lockup({ nome, qualificador, tamanho = 100 }) {
  const n = linha(nomeFonte, nome, tamanho, tamanho * 0.004);

  let q = null;
  if (qualificador) {
    const tq = tamanho * 0.42;
    q = linha(qualFonte, qualificador.toUpperCase(), tq, tq * 0.34);
  }

  const larguraTotal = Math.max(n.largura, q ? q.largura : 0);
  const respiro = tamanho * 0.06;

  // A linha de base do nome fica em y=0; o qualificador desce por um múltiplo
  // do corpo, e não pela altura medida: medida real muda com o texto (o "g" de
  // Advogados tem descendente, o de Partners não), e a assinatura ficaria com
  // distâncias diferentes em cada unidade.
  const baseQual = tamanho * 0.52;

  const corpos = [
    mover(n, (larguraTotal - n.largura) / 2, 0),
    ...(q ? [mover(q, (larguraTotal - q.largura) / 2, baseQual)] : []),
  ];

  const topo = -tamanho * 0.76;
  const fundo = (q ? baseQual : 0) + tamanho * 0.08;
  const altura = fundo - topo + respiro * 2;

  const vb = [
    (-respiro).toFixed(2),
    (topo - respiro).toFixed(2),
    (larguraTotal + respiro * 2).toFixed(2),
    altura.toFixed(2),
  ].join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="currentColor" role="img" aria-label="${nome}${qualificador ? ` ${qualificador}` : ""}">
<title>${nome}${qualificador ? ` ${qualificador}` : ""}</title>
${corpos.join("\n")}
</svg>
`;
}

/**
 * Monograma, na mesma geometria de `src/app/icon.svg`: quadrado de cantos
 * arredondados com quatro losangos vazados em cruz.
 *
 * O desenho é repetido aqui porque o pacote de marca não entrega arquivo, só
 * componente React, e um gerador de logotipo não pode depender de React. É a
 * terceira cópia da geometria (ícone, gerador de favicon e esta), e trocar a
 * marca exige trocar as três. Está registrado no CLAUDE.md do projeto.
 *
 * O canto é desenhado com curva cúbica, e não com arco: o conferidor que eu uso
 * para olhar o resultado lê M, L, Q, C e Z, e um arco passaria direto por ele
 * sem ser desenhado. Ferramenta de conferência que não entende o que confere é
 * a pior categoria de verificação.
 */
const K = 0.5523; // aproximação de um quarto de círculo por cúbica

function monograma({ tamanho, cor, vazado, soLosangos = false, contorno = false, umLosango = false }) {
  // Losango único, para quando quatro viram composição demais ao lado do nome.
  if (umLosango) {
    const m = tamanho / 2;
    return `<path d="M${m.toFixed(2)} 0 L${tamanho.toFixed(2)} ${m.toFixed(2)} L${m.toFixed(2)} ${tamanho.toFixed(2)} L0 ${m.toFixed(2)} Z"/>`;
  }

  // Contorno em vez de preenchimento. O "traço" é um losango dentro do outro,
  // com regra par-ímpar, e não um `stroke`: assim o desenho é geometria pura,
  // escala sem surpresa e o meu conferidor consegue rasterizar o que entrego.
  // Checagem que não enxerga o que confere já me enganou uma vez neste mesmo
  // arquivo.
  if (contorno) {
    const e3 = tamanho / 26;
    const parede = tamanho * 0.055; // calibre aproximado da haste da Arboria Book
    const recuo = (parede * Math.SQRT2) / e3;
    const anel = (cx, cy, meia) => {
      const fora =
        `M${((cx - 9) * e3).toFixed(2)} ${((cy - 9 - meia) * e3).toFixed(2)} ` +
        `L${((cx - 9 + meia) * e3).toFixed(2)} ${((cy - 9) * e3).toFixed(2)} ` +
        `L${((cx - 9) * e3).toFixed(2)} ${((cy - 9 + meia) * e3).toFixed(2)} ` +
        `L${((cx - 9 - meia) * e3).toFixed(2)} ${((cy - 9) * e3).toFixed(2)} Z`;
      const d = meia - recuo;
      const dentro =
        `M${((cx - 9) * e3).toFixed(2)} ${((cy - 9 - d) * e3).toFixed(2)} ` +
        `L${((cx - 9 + d) * e3).toFixed(2)} ${((cy - 9) * e3).toFixed(2)} ` +
        `L${((cx - 9) * e3).toFixed(2)} ${((cy - 9 + d) * e3).toFixed(2)} ` +
        `L${((cx - 9 - d) * e3).toFixed(2)} ${((cy - 9) * e3).toFixed(2)} Z`;
      return `${fora} ${dentro}`;
    };
    const todos = [anel(22, 13.5, 4.5), anel(22, 30.5, 4.5), anel(13.5, 22, 4.5), anel(30.5, 22, 4.5)].join(" ");
    return `<path fill-rule="evenodd" d="${todos}"/>`;
  }

  // Só os quatro losangos, sem a moldura. O aglomerado ocupa 26 de 44 na grade
  // original, então a escala é compensada para o conjunto ter a altura pedida e
  // o desenho não encolher junto com o quadrado que saiu.
  if (soLosangos) {
    const e2 = tamanho / 26;
    const dl = (cx, cy, meia) =>
      `M${((cx - 9) * e2).toFixed(2)} ${((cy - 9 - meia) * e2).toFixed(2)} ` +
      `L${((cx - 9 + meia) * e2).toFixed(2)} ${((cy - 9) * e2).toFixed(2)} ` +
      `L${((cx - 9) * e2).toFixed(2)} ${((cy - 9 + meia) * e2).toFixed(2)} ` +
      `L${((cx - 9 - meia) * e2).toFixed(2)} ${((cy - 9) * e2).toFixed(2)} Z`;
    const todos = [dl(22, 13.5, 4.5), dl(22, 30.5, 4.5), dl(13.5, 22, 4.5), dl(30.5, 22, 4.5)].join(" ");
    return `<path d="${todos}"/>`;
  }

  const e = tamanho / 44; // a geometria original vive numa grade de 44
  const r = 6 * e;
  const L = tamanho;
  const c = r * K;

  const quadrado = [
    `M${r.toFixed(2)} 0`,
    `L${(L - r).toFixed(2)} 0`,
    `C${(L - r + c).toFixed(2)} 0 ${L.toFixed(2)} ${(r - c).toFixed(2)} ${L.toFixed(2)} ${r.toFixed(2)}`,
    `L${L.toFixed(2)} ${(L - r).toFixed(2)}`,
    `C${L.toFixed(2)} ${(L - r + c).toFixed(2)} ${(L - r + c).toFixed(2)} ${L.toFixed(2)} ${(L - r).toFixed(2)} ${L.toFixed(2)}`,
    `L${r.toFixed(2)} ${L.toFixed(2)}`,
    `C${(r - c).toFixed(2)} ${L.toFixed(2)} 0 ${(L - r + c).toFixed(2)} 0 ${(L - r).toFixed(2)}`,
    `L0 ${r.toFixed(2)}`,
    `C0 ${(r - c).toFixed(2)} ${(r - c).toFixed(2)} 0 ${r.toFixed(2)} 0`,
    "Z",
  ].join(" ");

  // Os quatro losangos, nas posições do ícone, em cruz e sem tocar o centro.
  const losango = (cx, cy, meia) =>
    `M${(cx * e).toFixed(2)} ${((cy - meia) * e).toFixed(2)} ` +
    `L${((cx + meia) * e).toFixed(2)} ${(cy * e).toFixed(2)} ` +
    `L${(cx * e).toFixed(2)} ${((cy + meia) * e).toFixed(2)} ` +
    `L${((cx - meia) * e).toFixed(2)} ${(cy * e).toFixed(2)} Z`;

  const losangos = [
    losango(22, 13.5, 4.5),
    losango(22, 30.5, 4.5),
    losango(13.5, 22, 4.5),
    losango(30.5, 22, 4.5),
  ].join(" ");

  // Vazado: quadrado e losangos num caminho só, com regra par-ímpar, para o
  // bloqueio funcionar em uma cor só (carimbo, gravação, impressão em preto).
  if (vazado) {
    return `<path fill-rule="evenodd" d="${quadrado} ${losangos}"/>`;
  }
  return `<path fill="${cor}" d="${quadrado}"/>\n<path fill="#ffffff" d="${losangos}"/>`;
}

/**
 * Bloqueio horizontal: monograma à esquerda, assinatura à direita.
 *
 * O monograma tem a altura do BLOCO DE TEXTO inteiro, da caixa-alta do nome à
 * linha de base do qualificador. É o que faz os dois parecerem do mesmo
 * tamanho: igualar pela altura da letra deixaria o quadrado pequeno, e igualar
 * pela caixa do texto o deixaria grande.
 */
function bloqueio({ nome, qualificador, tamanho = 100, vazado = false, variante = "quadrado-bloco" }) {
  const n = linha(nomeFonte, nome, tamanho, tamanho * 0.004);
  const tq = tamanho * 0.42;
  const q = qualificador
    ? linha(qualFonte, qualificador.toUpperCase(), tq, tq * 0.34)
    : null;

  const baseQual = tamanho * 0.52;
  const topoTexto = -tamanho * 0.72;
  const fundoTexto = q ? baseQual : 0;
  const alturaTexto = fundoTexto - topoTexto;

  const larguraTexto = Math.max(n.largura, q ? q.largura : 0);

  // Cada variante resolve o mesmo problema de um jeito: o quadrado cheio tem a
  // altura do bloco de texto; o quadrado curto para na caixa-alta do nome; e os
  // losangos soltos ficam na altura da caixa-alta, que é onde o peso deles
  // empata com o do texto.
  const alturaCaixaAlta = tamanho * 0.72;
  const tamanhoPorVariante = {
    "quadrado-bloco": alturaTexto,
    "quadrado-cap": alturaCaixaAlta,
    losangos: alturaCaixaAlta,
    contorno: alturaCaixaAlta,
    // Um losango sozinho tem muito mais presença por área que quatro pequenos,
    // então entra menor: na altura do "o", e não na da caixa-alta.
    "um-losango": tamanho * 0.5,
  };
  const mono = tamanhoPorVariante[variante];
  const soLosangos = variante === "losangos";
  const contorno = variante === "contorno";
  const umLosango = variante === "um-losango";
  const vao = mono * (variante === "um-losango" ? 0.62 : soLosangos || contorno ? 0.5 : 0.42);

  // Centralizado no bloco de texto quando é menor que ele.
  const monoY = topoTexto + (alturaTexto - mono) / 2;

  const textoX = mono + vao;
  const corpos = [
    `<g transform="translate(0 ${monoY.toFixed(2)})">\n${monograma({ tamanho: mono, cor: "#0076d2", vazado, soLosangos, contorno, umLosango })}\n</g>`,
    mover(n, textoX + (larguraTexto - n.largura) / 2, 0),
    ...(q ? [mover(q, textoX + (larguraTexto - q.largura) / 2, baseQual)] : []),
  ];

  const respiro = tamanho * 0.06;
  const vb = [
    (-respiro).toFixed(2),
    (topoTexto - respiro).toFixed(2),
    (textoX + larguraTexto + respiro * 2).toFixed(2),
    (alturaTexto + respiro * 2).toFixed(2),
  ].join(" ");

  const rotulo = `${nome}${qualificador ? ` ${qualificador}` : ""}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="currentColor" role="img" aria-label="${rotulo}">
<title>${rotulo}</title>
${corpos.join("\n")}
</svg>
`;
}


/**
 * Assinatura com PONTO DE ACENTO, ideia dele em 13/10 a partir do logotipo que
 * já usa: o símbolo deixa de ser elemento ao lado do nome e vira pontuação.
 *
 * É a saída para o problema que ele descreveu três vezes. Monograma ao lado
 * compete porque é um segundo objeto na mesma linha; ponto final não compete
 * com nada, porque pertence à frase. E o losango no lugar do ponto guarda o
 * parentesco com o ícone, coisa que um ponto redondo qualquer não faz.
 *
 * As medidas saem do PRÓPRIO ponto da Arboria Book, lido da fonte: caixa de 11
 * por 11, assentada de -10 a +1 em relação à linha de base, com avanço de 21,1.
 * O losango é ampliado em um terço porque losango tem metade da área de um
 * quadrado de mesma caixa, e sem isso ele pareceria menor que o ponto que
 * substitui.
 *
 * O ponto sai com o azul fixo no arquivo, e não com `currentColor`: é acento, e
 * acento que acompanha a cor do texto deixa de ser acento. Vai com a classe
 * `acento` para quem inserir o SVG dentro de uma página poder trocar a cor por
 * CSS — sobre o marinho o azul do grupo é o claro, não o de ação.
 */
function assinaturaPonto({ nome, qualificador, tamanho = 100, tipo = "losango", cor = "#0076d2" }) {
  const n = linha(nomeFonte, nome, tamanho, tamanho * 0.004);
  const tq = tamanho * 0.42;
  const q = qualificador
    ? linha(qualFonte, qualificador.toUpperCase(), tq, tq * 0.34)
    : null;

  const u = tamanho / 100; // as medidas lidas da fonte estão na escala de 100

  // ⚠️ O qualificador pode ser MAIS LARGO que o nome, e é o caso do Instituto,
  // onde "Instituto" fica sobre "BARBOSA BATISTA". Centralizar um no outro dá
  // deslocamento negativo, e a primeira versão disto jogou metade da palavra de
  // baixo para fora do quadro. Agora o conjunto é empurrado para a direita o
  // tanto que for preciso, e o quadro é medido das extremidades reais.
  const qxBruto = q ? (n.largura - q.largura) / 2 : 0;
  const deslocamento = Math.max(0, -qxBruto);
  const nomeX = deslocamento;
  const qx = qxBruto + deslocamento;

  const centroX = nomeX + n.largura + 10.5 * u;
  const centroY = -4.5 * u;

  let ponto;
  if (tipo === "real") {
    const g = nomeFonte.charToGlyph(".").getPath(0, 0, tamanho).toPathData(2);
    ponto = `<path class="acento" fill="${cor}" transform="translate(${(nomeX + n.largura).toFixed(2)} 0)" d="${g}"/>`;
  } else {
    const meia = (tipo === "discreto" ? 5.5 : 7.4) * u;
    const d =
      `M${centroX.toFixed(2)} ${(centroY - meia).toFixed(2)} ` +
      `L${(centroX + meia).toFixed(2)} ${centroY.toFixed(2)} ` +
      `L${centroX.toFixed(2)} ${(centroY + meia).toFixed(2)} ` +
      `L${(centroX - meia).toFixed(2)} ${centroY.toFixed(2)} Z`;
    ponto = `<path class="acento" fill="${cor}" d="${d}"/>`;
  }

  // O qualificador centraliza no NOME, não no nome mais o ponto: é assim no
  // logotipo que ele usa, e é o que mantém o ponto pendurado para fora em vez
  // de empurrar a palavra de baixo para a esquerda.
  const corpos = [
    mover(n, nomeX, 0),
    ponto,
    ...(q ? [mover(q, qx, tamanho * 0.52)] : []),
  ];

  const respiro = tamanho * 0.06;
  const largura = Math.max(nomeX + n.largura + 21.1 * u, q ? qx + q.largura : 0);
  const topo = -tamanho * 0.76;
  const fundo = (q ? tamanho * 0.52 : 0) + tamanho * 0.08;

  const rotulo = `${nome}${qualificador ? ` ${qualificador}` : ""}`;
  const vb = [
    (-respiro).toFixed(2),
    (topo - respiro).toFixed(2),
    (largura + respiro * 2).toFixed(2),
    (fundo - topo + respiro * 2).toFixed(2),
  ].join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="currentColor" role="img" aria-label="${rotulo}">
<title>${rotulo}</title>
${corpos.join("\n")}
</svg>
`;
}

const MARCAS = [
  { arquivo: "barbosa-batista", nome: "Barbosa Batista", qualificador: "Grupo" },
  { arquivo: "advogados", nome: "Barbosa Batista", qualificador: "Advogados" },
  { arquivo: "partners", nome: "Barbosa Batista", qualificador: "Partners" },
  { arquivo: "venture-private", nome: "Barbosa Batista", qualificador: "Venture & Private" },
  { arquivo: "funding", nome: "Barbosa Batista", qualificador: "Funding" },
  { arquivo: "real-estate", nome: "Barbosa Batista", qualificador: "Real Estate" },
  { arquivo: "tecnologia", nome: "Barbosa Batista", qualificador: "Tecnologia" },
  { arquivo: "private-market", nome: "Barbosa Batista", qualificador: "Private Market" },
  { arquivo: "instituto", nome: "Instituto", qualificador: "Barbosa Batista" },
];

const pastas = ["claro", "escuro", "uma-cor", "comparar"];
mkdirSync(SAIDA, { recursive: true });
for (const f of pastas) mkdirSync(`${SAIDA}${f}/`, { recursive: true });

/**
 * Três arquivos por marca, e a diferença entre eles é só a cor do ponto.
 *
 * `claro`  ponto no azul de ação, para fundo branco e claro.
 * `escuro` ponto no azul claro do grupo, porque o de ação some no marinho.
 * `uma-cor` tudo na cor do texto, para carimbo, gravação e impressão em preto.
 *
 * O texto é sempre `currentColor`: quem usa define a cor uma vez e a assinatura
 * acompanha. Só o ponto é fixo, porque acento que segue o texto não é acento.
 */
for (const m of MARCAS) {
  writeFileSync(`${SAIDA}claro/${m.arquivo}.svg`, assinaturaPonto({ ...m, cor: "#0076d2" }));
  writeFileSync(`${SAIDA}escuro/${m.arquivo}.svg`, assinaturaPonto({ ...m, cor: "#77c0f8" }));
  writeFileSync(`${SAIDA}uma-cor/${m.arquivo}.svg`, assinaturaPonto({ ...m, cor: "currentColor" }));
  console.log(m.arquivo);
}

// A comparação continua gerada, para o histórico da decisão não se perder.
const PARA_COMPARAR = ["partners", "venture-private", "barbosa-batista"];
for (const arquivo of PARA_COMPARAR) {
  const m = MARCAS.find((x) => x.arquivo === arquivo);
  for (const variante of ["contorno", "um-losango", "losangos", "quadrado-cap", "quadrado-bloco"]) {
    writeFileSync(`${SAIDA}comparar/${arquivo}--${variante}.svg`, bloqueio({ ...m, variante }));
  }
  for (const [chave, tipo] of [["ponto-losango", "losango"], ["ponto-discreto", "discreto"], ["ponto-real", "real"]]) {
    writeFileSync(`${SAIDA}comparar/${arquivo}--${chave}.svg`, assinaturaPonto({ ...m, tipo }));
  }
}
