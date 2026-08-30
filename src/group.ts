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
  subdomain: string;
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
  ] as const satisfies readonly GroupBusiness[],
} as const;
