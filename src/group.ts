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
    { key: "capital", label: "Capital", subdomain: "capital" },
    { key: "funding", label: "Funding", subdomain: "funding" },
    { key: "instituto", label: "Instituto", subdomain: "instituto" },
    { key: "private-market", label: "Private Market", subdomain: "privatemarket" },
    { key: "aluguei", label: "Aluguei", domain: "www.aluguei.com.br" },
  ] as const satisfies readonly GroupBusiness[],
} as const;
