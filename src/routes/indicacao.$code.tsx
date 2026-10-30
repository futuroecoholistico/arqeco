import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { REF_STORAGE_KEY } from "@/lib/referrals";
import { getReferralPlan } from "@/lib/referrals.functions";

export const Route = createFileRoute("/indicacao/$code")({
  head: () => ({ meta: [
    { title: "Indicação ARQECO — Arquitetura Ecológica" },
    { name: "description", content: "Você recebeu uma indicação para conhecer os projetos de interiores sustentáveis da ARQECO." },
    { property: "og:title", content: "Indicação ARQECO" },
    { property: "og:description", content: "Conheça os projetos de interiores sustentáveis da ARQECO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ReferralLanding,
});

function ReferralLanding() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (!/^[a-f0-9]{6,20}$/.test(code)) { navigate({ to: "/", hash: "planos", replace: true }); return; }
    localStorage.setItem(REF_STORAGE_KEY, code);
    getReferralPlan({ data: { code } })
      .then(({ plan }) => {
        // Start = Dossiê, which lives in the Eco-Holístico app: carry the code there.
        if (plan === "start") navigate({ to: "/diagnostico", replace: true });
        else navigate({ to: "/", hash: "planos", replace: true });
      })
      .catch(() => navigate({ to: "/", hash: "planos", replace: true }));
  }, [code, navigate]);
  return <p className="p-10 text-center text-sm text-muted-foreground">Abrindo a ARQECO…</p>;
}
