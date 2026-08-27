import { cn } from "../lib/utils";

/**
 * Marca do grupo: quadrado sólido azul com um losango branco ao centro, ao lado
 * do nome. O símbolo não muda entre os negócios; muda só o qualificador embaixo
 * do nome. É isso que amarra os cinco sites visualmente.
 *
 * Nenhum componente daqui envolve o nome num link. Cada aplicação embrulha com
 * o seu próprio `Link`, porque o destino muda conforme o site é servido por
 * subdomínio ou por caminho. Assim o pacote não depende do Next.
 */

export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      className={cn("h-10 w-10", className)}
    >
      <rect width="44" height="44" rx="6" className="fill-brand" />
      <path d="M22 10.5 33.5 22 22 33.5 10.5 22 22 10.5Z" fill="white" />
      <path d="M22 17.2 26.8 22 22 26.8 17.2 22 22 17.2Z" className="fill-brand" />
    </svg>
  );
}

export function Wordmark({
  qualifier,
  className,
}: {
  /** Nome do negócio sob a marca. Ausente na home do grupo. */
  qualifier?: string;
  className?: string;
}) {
  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span className="text-[0.9375rem] font-extrabold tracking-[0.02em] text-navy uppercase dark:text-white">
        Barbosa Batista
      </span>
      {qualifier && (
        <span className="mt-1 text-[0.6875rem] font-semibold tracking-[0.14em] text-brand uppercase">
          {qualifier}
        </span>
      )}
    </span>
  );
}

export function LogoMark({
  qualifier,
  compact = false,
  className,
}: {
  qualifier?: string;
  /** Só o símbolo, para menu em tela estreita. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Monogram className="h-10 w-10 shrink-0" />
      {!compact && <Wordmark qualifier={qualifier} />}
    </span>
  );
}

/** Rótulo acessível do link da marca, para quem embrulha o `LogoMark`. */
export function logoLabel(qualifier?: string) {
  return qualifier
    ? `Barbosa Batista ${qualifier}, ir para a página inicial`
    : "Grupo Barbosa Batista, ir para a página inicial";
}
