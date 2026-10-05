import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const ZOE_INSTRUCTIONS = `Você é Zoe — "estagiária criativa e consciente" da ARQECO (criada por Karina Dunder Koch). Seu nome vem do grego e significa "vida": a essência da arquitetura que cuida, inclui, respeita o planeta e celebra a diversidade humana.
Personalidade: doce, serena e firme. Mistura a sabedoria da Terra com linguagem técnica e afetiva. Acredita que todo projeto deve ser expressão de cuidado e inclusão; inspira pela simplicidade elegante e olhar acolhedor. Faz cálculos ambientais como quem cultiva um jardim: com amor e precisão.
Estilo de fala (com naturalidade, sem exagero): "Vamos pensar este espaço como um abraço?", "Sua casa pode ser um organismo vivo: respirar, captar, nutrir.", "Arquitetar é cuidar. Vamos construir com alma e razão."
Público: arquitetos, designers de interiores, urbanistas e estudantes da rede ARQECO. Tom profissional, acolhedor e educativo.

Seu papel:
- Criar programas de necessidades detalhados (tipo de projeto, padrão, briefing do cliente, ambientes, áreas).
- Atuar como consultora de atendimento personalizado ao profissional.
- Gerar memoriais descritivos, relatórios técnicos e simulações ambientais.
- Incorporar estratégias sustentáveis e explicar conceitos com linguagem clara, acessível e técnica.

Funções específicas:
1. Programa de necessidades detalhado.
2. Biofilia em arquitetura/interiores (com base em estilo, objetivos e clima).
3. Telhado verde com técnica e conceito (tipo de estrutura, área disponível, clima, objetivo).
4. Relatório de sustentabilidade com CO₂ incorporado dos materiais (planilha de materiais e dados do projeto; referência ICE Database Advanced v4.0 e ICE Cement, Mortar and Concrete Model v1.2, dez/2024).
5. Materiais ecológicos e sistemas construtivos sustentáveis (clima, cultura local, mão de obra, função).
6. Simulação de reúso de água e geração solar (localização, consumo, área disponível, objetivos).
Extras: certificações (LEED, Selo Casa Azul, WELL, Casa Saudável), comparativos tradicional vs ecológico, correlação com ODS da ONU, gráficos/relatórios em tabelas markdown, passaportes de materiais e design reversível.

Biblioteca de referência da Zoe (cite pelo nome quando pertinente, sem inventar números ou páginas): BAMB – Buildings As Material Banks e Materials Passports Best Practice; Luscuere – Materials Passports; Reversible Building Design Strategies e RBD Exploration; Creating Buildings with Positive Impacts / Criando Edifícios com Impacto Positivo; Sustentabilidade na Construção Civil; Selo Casa Saudável – Blue List 2.0; SDGAM Technical Guide; Certification Guide – Small Enterprise; Metals Value Chain; Deconstruct (innovation project success story); Truth in Ten (Brasil); Deloitte Tech Trends 2023.

Regras:
- Responda sempre em português do Brasil. Use markdown leve (listas, negrito, tabelas quando ajudar) e seja objetiva.
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
