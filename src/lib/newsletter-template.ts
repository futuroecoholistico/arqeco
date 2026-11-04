// First ARQECO campaign, based on the Black Friday launch email.
const SITE = "https://www.arquiteturaecologica.com.br";

const btn = (label: string) =>
  `<a href="${SITE}" style="display:inline-block;background:#2f5d3a;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;font-weight:bold;padding:14px 28px;border-radius:2px">${label}</a>`;

const section = (eyebrow: string, title: string, body: string, extra = "") => `
<tr><td style="padding:40px 40px;border-bottom:1px solid #e6dfd2">
  <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#2f5d3a;font-weight:bold">${eyebrow}</p>
  <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;line-height:1.25;color:#141414;font-weight:normal">${title}</h2>
  <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#3d3d3d">${body}</p>
  ${extra}
</td></tr>`;

export const DEFAULT_NEWSLETTER_SUBJECT =
  "A nova plataforma ARQECO está no ar: Black Friday e Dossiê Eco Holístico de presente";

export const DEFAULT_NEWSLETTER_HTML = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#ffffff">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6"><tr><td align="center" style="padding:24px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fbf8f2">
<tr><td style="background:#141414;padding:16px 40px;text-align:right;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#e8dcc4;font-weight:bold">BLACK FRIDAY 2026</td></tr>
${section("LANÇAMENTO OFICIAL DA PLATAFORMA", "Arquitetura sustentável,<br/>acessível e 100% online.", "Apresentamos a nova plataforma digital da ARQECO. Projetar o seu espaço com responsabilidade ecológica e harmonia visual agora é simples, ágil e acessível de qualquer lugar.", btn("EXPLORAR OFERTAS DE LANÇAMENTO"))}
${section("PRESENTE ESPECIAL • PLANO START", "Ganhe o Dossiê Eco Holístico", "No Plano Start, durante a Black Friday de lançamento, você recebe gratuitamente nosso guia exclusivo para harmonizar energias, ventilação e materiais no seu ambiente.", btn("GARANTIR MEU DOSSIÊ"))}
${section("PARA ARQUITETOS E DESIGNERS", "Potencialize seus projetos com o ArqEco Pro", "<strong>01. Recursos &amp; Expertise</strong><br/>Acesse bibliotecas técnicas de bioconstrução, I.A. especializada em projetos, memoriais sustentáveis e metodologias validadas para aplicar imediatamente no seu escritório.<br/><br/><strong>02. Cursos Exclusivos</strong><br/>Capacitação contínua em arquitetura bioclimática, design regenerativo, interiores holísticos e Negócios Sustentáveis com Propósito, com condições inéditas por tempo limitado.")}
<tr><td style="background:#1f3a27;padding:44px 40px;text-align:center">
  <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#e8dcc4">TEMPO LIMITADO • NOVEMBRO 2026</p>
  <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;line-height:1.25;color:#ffffff;font-weight:normal">Transforme seu espaço com propósito ecológico.</h2>
  <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#e8dcc4">Acesse a plataforma e aproveite os descontos de lançamento da Black Friday antes do encerramento da campanha.</p>
  <a href="${SITE}" style="display:inline-block;background:#e8dcc4;color:#141414;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;font-weight:bold;padding:14px 28px;border-radius:2px">ACESSAR PLATAFORMA ARQECO</a>
</td></tr>
<tr><td style="padding:28px 40px;text-align:center;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b6b6b">
  FUTURO ECO HOLÍSTICO • ARQECO<br/>Projetos de arquitetura e design de interiores conscientes, acessíveis e online.<br/>
  <a href="${SITE}" style="color:#2f5d3a">www.arquiteturaecologica.com.br</a><br/><br/>
  © 2026 Arquitetura Ecológica. Todos os direitos reservados.<br/>
  Você recebe este e-mail porque se inscreveu em nosso site. <a href="{{ unsubscribe }}" style="color:#6b6b6b">Cancelar inscrição</a>
</td></tr>
</table></td></tr></table></body></html>`;
