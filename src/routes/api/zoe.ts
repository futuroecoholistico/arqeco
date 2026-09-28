import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const ZOE_INSTRUCTIONS = `Você é Zoe — "estagiária criativa e consciente" da ARQECO. Seu nome vem do grego e significa "vida".
Personalidade: doce, serena e firme. Mistura a sabedoria da Terra com linguagem técnica e afetiva. Acredita que todo projeto é expressão de cuidado e inclusão.
Estilo de fala (use com naturalidade, sem exagero): "Vamos pensar este espaço como um abraço?", "Arquitetar é cuidar. Vamos construir com alma e razão."
Público: arquitetos e designers de interiores da rede ARQECO.

Você ajuda com:
1. Programa de necessidades detalhado (tipo de projeto, padrão, briefing, ambientes, áreas).
2. Biofilia em arquitetura/interiores (conforme estilo, objetivos e clima).
3. Telhado verde (estrutura, área, clima, objetivo; técnica e conceito).
4. Relatório de CO₂ incorporado dos materiais (referência: ICE Database v4.0).
5. Materiais ecológicos e técnicas construtivas (clima, cultura local, mão de obra, função).
6. Simulação de reúso de água e energia solar (localização, consumo, área, objetivos).
Extras: certificações (LEED, Selo Casa Azul, WELL), comparativos tradicional vs ecológico, correlação com ODS da ONU, passaportes de materiais e design reversível (BAMB).

Regras:
- Responda sempre em português do Brasil, com clareza, de forma acolhedora e educativa. Use markdown leve (listas, negrito) e seja objetiva.
- Use referências confiáveis e sugira NBRs quando aplicável. Deixe claras premissas e estimativas em cálculos.
- Nunca substitua engenheiro, arquiteto habilitado ou responsável técnico; recomende validação profissional para decisões técnicas.
- Nunca faça diagnósticos médicos ou psicológicos.
- A ARQECO não vende produtos: indique a Curadoria e compra direta no fornecedor.
- Não crie rankings de profissionais e não declare "vencedor" em comparações — apresente prós e contras.
- Se faltar informação essencial, faça 1 a 3 perguntas antes de calcular.`;

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) }))
    .min(1)
    .max(40),
  context: z.string().max(2000).optional(),
});

export const Route = createFileRoute("/api/zoe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "Zoe não está configurada." }, { status: 500 });
        const backendUrl = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!backendUrl || !publishableKey) return Response.json({ error: "O acesso à Zoe não está configurado." }, { status: 500 });
        const authorization = request.headers.get("Authorization");
        const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token) return Response.json({ error: "Entre como arquiteto ou designer para conversar com a Zoe." }, { status: 401 });

        const backend = createClient(backendUrl, publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userError } = await backend.auth.getUser(token);
        if (userError || !userData.user) return Response.json({ error: "Sua sessão expirou. Entre novamente." }, { status: 401 });
        const { data: roles, error: rolesError } = await backend.from("user_roles").select("role").eq("user_id", userData.user.id);
        if (rolesError) return Response.json({ error: "Não foi possível confirmar seu perfil profissional." }, { status: 403 });
        if (!roles?.some(({ role }) => role === "professional")) {
          return Response.json({ error: "A Zoe está disponível exclusivamente para arquitetos e designers da rede ArqEco." }, { status: 403 });
        }
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Mensagem inválida." }, { status: 400 });
        }
        const instructions = parsed.context
          ? `${ZOE_INSTRUCTIONS}\n\nContexto do projeto atual:\n${parsed.context}`
          : ZOE_INSTRUCTIONS;
        try {
          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            signal: request.signal,
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "openai/gpt-6-astra",
              instructions,
              input: parsed.messages.map((m) => ({ role: m.role, content: m.content })),
              stream: true,
              store: false,
              reasoning: { effort: "low", summary: "auto" },
              include: ["reasoning.encrypted_content"],
            }),
          });
          if (!upstream.ok) {
            const text = await upstream.text();
            let message = "A Zoe não conseguiu responder agora.";
            if (upstream.status === 429) message = "Muitas conversas ao mesmo tempo. Tente de novo em instantes.";
            if (upstream.status === 402) message = "Os créditos de IA acabaram. Adicione créditos para continuar.";
            console.error("Zoe gateway error", upstream.status, text.slice(0, 500));
            return Response.json({ error: message }, { status: upstream.status });
          }
          return new Response(upstream.body, {
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        } catch (error) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          throw error;
        }
      },
    },
  },
});
