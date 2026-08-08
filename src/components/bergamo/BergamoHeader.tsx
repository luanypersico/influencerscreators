import { ChevronDown, LogOut } from "lucide-react";

import bergamoBrandLogo from "@/assets/bergamo/arsenal-de-prompts-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BergamoViewer } from "@/lib/bergamo-viewer.server";
import { cn } from "@/lib/utils";

export interface BergamoHeaderProps extends React.ComponentProps<"header"> {
  /** Âncora usada pelo CTA principal do topo. */
  ctaHref: string | null;
  viewer?: BergamoViewer | null;
  onLogout?: () => void | Promise<void>;
  isSigningOut?: boolean;
}

/** Header fixo e minimalista, isolado do restante do site. */
export function BergamoHeader({
  ctaHref,
  viewer,
  onLogout,
  isSigningOut = false,
  className,
  ...rest
}: BergamoHeaderProps) {
  const initials = viewer?.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl",
        className,
      )}
      {...rest}
    >
      <div className="mx-auto grid h-20 w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:h-24 sm:px-5 md:flex md:justify-between">
        <a
          href="#topo"
          aria-label="Arsenal de Prompts — voltar ao topo"
          className="flex min-w-0 items-center"
        >
          <img
            src={bergamoBrandLogo}
            alt="Arsenal de Prompts — Bergamo Creators"
            className="h-auto w-[92px] object-contain sm:w-[118px]"
          />
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

        {viewer ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Abrir conta de ${viewer.displayName}`}
                className="flex min-w-0 items-center gap-2 rounded-full border border-border/80 bg-card/70 py-1.5 pr-2.5 pl-1.5 text-left transition-colors hover:border-primary/50 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Avatar className="size-8 border border-primary/35 bg-primary/10">
                  {viewer.avatarUrl ? (
                    <AvatarImage src={viewer.avatarUrl} alt="" referrerPolicy="no-referrer" />
                  ) : null}
                  <AvatarFallback className="bg-primary/15 text-[11px] font-bold text-primary">
                    {initials || "EU"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden min-w-0 sm:block">
                  <span className="block max-w-36 truncate text-xs font-semibold text-foreground">
                    {viewer.displayName}
                  </span>
                  <span className="block text-[9px] tracking-[0.13em] text-muted-foreground uppercase">
                    {viewer.label}
                  </span>
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bergamo-theme w-64 border-border bg-card text-card-foreground"
            >
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {viewer.displayName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{viewer.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={viewer.destination} className="cursor-pointer">
                  {viewer.destination === "/admin"
                    ? "Abrir painel"
                    : viewer.destination === "/coprodutor/bergamo"
                      ? "Abrir workspace"
                      : "Minha área"}
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={isSigningOut}
                onSelect={() => void onLogout?.()}
                className="cursor-pointer text-muted-foreground focus:text-foreground"
              >
                <LogOut />
                {isSigningOut ? "Saindo..." : "Sair"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : ctaHref ? (
          <a
            href={ctaHref}
            className="bergamo-cta shrink-0 rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-4 sm:text-xs"
          >
            Quero o acervo
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="bergamo-cta shrink-0 cursor-wait rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase opacity-60 sm:px-4 sm:text-xs"
          >
            Quero o acervo
          </span>
        )}
      </div>
    </header>
  );
}
