import { ArrowUpRight } from "lucide-react";
import { cn } from "../lib/utils";
import { GROUP, type GroupBusiness } from "../group";

/**
 * Faixa fina no topo com todos os endereços do grupo. É o que torna o grupo
 * visível dentro de cada site sem poluir o cabeçalho, e é o caminho de volta
 * para a home de escolha.
 *
 * Este componente é a razão de o pacote existir. Ele já viveu colado à mão em
 * dois repositórios e divergiu num detalhe de acessibilidade em menos de um
 * dia. Agora tem uma fonte só.
 */
export function GroupStrip({
  current,
  rootDomain = GROUP.rootDomain,
  businesses = GROUP.businesses,
}: {
  /** `key` do negócio que está sendo exibido, para marcá-lo como atual. */
  current?: string;
  /** Trocar só em ambiente de teste. */
  rootDomain?: string;
  /** Trocar só se um negócio sair do grupo. */
  businesses?: readonly GroupBusiness[];
}) {
  return (
    <div className="band-navy border-b border-white/10">
      <div className="container-luxe flex h-11 items-center justify-between gap-6">
        <a
          href={`https://${rootDomain}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-white/90 transition-colors hover:text-white"
        >
          {GROUP.name}
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </a>

        <nav aria-label="Negócios do grupo" className="hidden items-center gap-6 lg:flex">
          {businesses.map((b) => {
            const active = b.key === current;
            return (
              <a
                key={b.key}
                href={`https://${b.subdomain}.${rootDomain}`}
                // `page`, e não `true`: é o valor que faz o leitor de tela
                // anunciar "página atual" em vez de um estado sem significado.
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-xs font-medium transition-colors",
                  active ? "text-brand" : "text-white/60 hover:text-white",
                )}
              >
                {b.label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
