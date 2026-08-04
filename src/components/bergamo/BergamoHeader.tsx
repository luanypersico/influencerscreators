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
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <a href="#topo" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            B
          </span>
          <span className="font-display text-lg leading-none tracking-tight text-foreground">
            Bergamo
            <span className="ml-1.5 align-middle text-[10px] font-sans tracking-[0.2em] text-muted-foreground uppercase">
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
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold tracking-wide text-primary-foreground uppercase transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Quero o acervo
        </a>
      </div>
    </header>
  );
}