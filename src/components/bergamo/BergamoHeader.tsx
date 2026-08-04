import { cn } from "@/lib/utils";

export interface BergamoHeaderProps extends React.ComponentProps<"header"> {
  /** Âncora usada pelo CTA principal do topo. */
  ctaHref?: string;
}

/** Header fixo e minimalista, isolado do restante do site. */
export function BergamoHeader({ ctaHref = "#planos", className, ...rest }: BergamoHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl",
        className,
      )}
      {...rest}
    >
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-5 md:flex md:justify-between">
        <a href="#topo" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            B
          </span>
          <span className="truncate font-display text-base leading-none tracking-tight text-foreground sm:text-lg">
            Bergamo
            <span className="ml-1.5 hidden align-middle font-sans text-[10px] tracking-[0.2em] text-muted-foreground uppercase sm:inline">
              Creators
            </span>
          </span>
        </a>

        <nav aria-label="Seções" className="hidden items-center gap-7 md:flex">
          <a
            href="#acervo"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Acervo
          </a>
          <a
            href="#categorias"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Categorias
          </a>
          <a
            href="#bonus"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Bônus
          </a>
          <a
            href="#planos"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Planos
          </a>
        </nav>

        <a
          href={ctaHref}
          className="bergamo-cta shrink-0 rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-4 sm:text-xs"
        >
          <span className="sm:hidden">Quero o acervo</span>
          <span className="hidden sm:inline">Quero o acervo</span>
        </a>
      </div>
    </header>
  );
}