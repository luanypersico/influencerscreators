import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-lg text-foreground">A Casa do Influencer AI</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Influencers virtuais exclusivas, com identidade, personalidade e universo visual
            próprios — prontas para representar sua próxima marca.
          </p>
        </div>
        <nav className="flex gap-6 text-sm text-muted-foreground" aria-label="Rodapé">
          <Link to="/influencers" className="hover:text-foreground">
            Influencers
          </Link>
          <Link to="/como-funciona" className="hover:text-foreground">
            Como funciona
          </Link>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">
          Conteúdo demonstrativo. Personagens, imagens e materiais desta página são ilustrativos e
          usados para validar a experiência — não representam vendas ou disponibilidade reais.
        </p>
      </div>
    </footer>
  );
}
