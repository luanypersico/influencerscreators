import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { ArsenalLogo } from "@/components/brand/ArsenalLogo";
import { MemberHome } from "@/components/member/MemberHome";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/membros/")({
  head: () => ({
    meta: [{ title: "Minha área — Arsenal" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: MembersPage,
});

function MembersPage() {
  const router = useRouter();
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  if (loading) return <CenteredNote title="Carregando..." />;
  if (!session) return <CenteredNote title="Redirecionando para o login..." />;

  return <MemberHome userEmail={session.user.email ?? ""} />;
}

function CenteredNote({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <ArsenalLogo className="mx-auto mb-6 w-36" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </div>
  );
}
