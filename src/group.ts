/**
 * Quem é o grupo. Fica no pacote, e não em cada site, porque é a lista que
 * precisa estar igual nos cinco: negócio que entra ou sai muda aqui, sobe uma
 * versão, e os projetos atualizam.
 *
 * A ordem é a da home de escolha.
 */

export interface GroupBusiness {
  /** Identificador estável, usado para marcar o site atual na faixa. */
  key: string;
  label: string;
  /** Rótulo do subdomínio sob o domínio raiz. */
  subdomain?: string;
  /**
   * Domínio próprio, para o negócio que não é servido sob o raiz. Só um dos
   * dois campos é preenchido, e `endereco()` decide qual usar.
   *
   * Existe desde o Aluguei (v0.7.0), que tem domínio e marca registrados
   * próprios e mesmo assim é negócio do grupo. Até ali a faixa presumia que
   * pertencer ao grupo e morar sob o domínio do grupo eram a mesma coisa. Não
   * são: quem decide é a marca, não a hospedagem.
   */
  domain?: string;
}

/** Endereço público de um negócio, venha ele de subdomínio ou de domínio próprio. */
export function endereco(
  business: GroupBusiness,
  rootDomain: string = GROUP.rootDomain,
): string {
  return business.domain
    ? `https://${business.domain}`
    : `https://${business.subdomain}.${rootDomain}`;
}

export const GROUP = {
  name: "Grupo Barbosa Batista",
  rootDomain: "barbosabatista.com.br",
  businesses: [
    { key: "advogados", label: "Advogados", subdomain: "advogados" },
    { key: "partners", label: "Partners", subdomain: "partners" },
    // O rótulo mudou para "Venture & Private" em 31/08/2026, e o `key` e o
    // subdomínio **não** mudaram de propósito: `key` é identificador estável, e
    // trocar o subdomínio quebraria os links já publicados. Nome é marca,
    // endereço é infraestrutura, e eles não precisam andar juntos.
    { key: "capital", label: "Venture & Private", subdomain: "capital" },
    // Entrou na faixa em 08/10/2026, dois meses depois de o site existir. O que
    // segurava não era decisão, era DNS: `tecnologia.barbosabatista.com.br` não
    // existia, e um negócio na faixa sem endereço que responda vira link morto
    // em todas as páginas de todos os sites do grupo. O subdomínio foi criado
    // antes deste commit.
    { key: "funding", label: "Funding", subdomain: "funding" },
    // Frente imobiliária, criada em 09/10/2026 como casa do Private Market e da
    // Aluguei. As duas CONTINUAM nesta lista logo abaixo, e isso é proposital:
    // o pacote diz quem é o grupo, e as duas são empresas do grupo com registro
    // próprio. Quem decide não listá-las na faixa é cada projeto, no recorte que
    // faz ao consumir esta lista — no site do grupo elas saíram da faixa no
    // mesmo dia, porque a porta delas passou a ser o Real Estate.
    { key: "realestate", label: "Real Estate", subdomain: "realestate" },
    { key: "tecnologia", label: "Tecnologia", subdomain: "tecnologia" },
    { key: "instituto", label: "Instituto", subdomain: "instituto" },
    { key: "private-market", label: "Private Market", subdomain: "privatemarket" },
    { key: "aluguei", label: "Aluguei", domain: "www.aluguei.com.br" },
    { key: "vix-capital", label: "Vix Capital", domain: "www.vixcapital.com.br" },
  ] as const satisfies readonly GroupBusiness[],
} as const;
