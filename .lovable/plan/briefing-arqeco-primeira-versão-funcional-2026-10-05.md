# Briefing ARQECO — primeira versão funcional

"Seu espaço começa a ser projetado a partir de você."

## Como vai funcionar

**Para o cliente**
1. Depois que o pagamento é confirmado, o painel do cliente (/painel) passa a mostrar os projetos reais que ele comprou (não mais os dados de exemplo).
2. Cada projeto tem um cartão "Responder briefing" com a situação: não iniciado, em andamento (x%) ou enviado.
3. O briefing abre em uma jornada de quiz editorial, com barra de progresso, botões Voltar/Continuar e salvamento automático. O cliente pode sair e continuar depois.

**Etapas**
1. Boas-vindas ("Vamos começar pelo que realmente importa: você.", 10–15 min)
2. Sobre você: contato, finalidade, pessoas que usam o espaço (várias), crianças/idosos/pets/trabalho/estudo, acessibilidade
3. Sobre o imóvel: tipo, situação, cidade, endereço, áreas, prazo para iniciar + envio de arquivos (planta, fotos, vídeos, medidas…) com pré-visualização
4. Ambientes: cartões de seleção múltipla (sala, cozinha, suíte… "outro" com nome livre)
5. Como você vive: usos, desafios, problema principal, sentimentos desejados (até 5) e indesejados, "quero que este espaço seja um lugar onde eu possa…"
6. Estilo, cores e texturas: galeria visual de estilos (até 3, até 2 rejeitados, mistura), paletas (até 3), materiais (até 5) e moodboards de combinação (1–3)
7. Necessidades e referências: módulo próprio só para cada ambiente escolhido (itens que não podem faltar, problema, o que mudar), móveis existentes, orçamento, links/imagens de referência, "transformação desejada"
8. Resumo e envio: cartões com tudo, edição por etapa, autorizações obrigatórias, registro de data do envio, tela "Briefing recebido."

**Perfil estético e DNA do Projeto**
- Combinação automática das escolhas (ex.: "Minimalismo Natural Contemporâneo"), apresentada como "perfil identificado a partir das suas escolhas".
- DNA do Projeto no topo do briefing: ambientes, sensações, cores, materiais, prioridades e faixa de orçamento.

**Para a equipe (/admin)**
- Nova aba "Briefings": lista com cliente, projeto, situação, data e filtros (situação, estilo, ambiente).
- Página de visualização: DNA do Projeto no topo, todas as respostas em blocos, arquivos para download, mudança de situação (recebido → em análise → aprovado → revisão solicitada).
- Nova aba "Biblioteca visual": cadastrar/editar estilos, paletas, materiais e moodboards (imagem, nome, descrição, palavras-chave internas, cores, ordem, ativo/inativo), sem mexer no código.
- Arquitetos atribuídos ao contrato também veem o briefing no painel profissional.

**Imagens iniciais**: gero imagens para os 9 estilos, paletas e moodboards; todas podem ser trocadas depois no admin.

## Fora desta versão (estrutura já preparada)
- Resumo inteligente por IA (campos reservados; a IA nunca inventa dados, usa "Não informado").
- Seção Eco-Holística (bem-estar etc.) sem diagnósticos automáticos.

## Detalhes técnicos
- Projeto criado automaticamente pelo webhook de pagamento confirmado (`projects` ligado ao `service_bookings`, status BRIEFING_PENDING); envio do briefing muda para BRIEFING_COMPLETED e grava em `project_status_history`.
- Novas tabelas: `briefings` (1 por projeto, `answers jsonb` versionado, `progress`, `current_step`, `aesthetic_profile`, `project_dna jsonb`, `ai_summary` nulo, `eco_holistic jsonb` nulo, status, `submitted_at`, consentimentos), `briefing_rooms` e `briefing_people` (linhas normalizadas para filtros), `briefing_files`, `briefing_visual_options` (kind: style/palette/material/moodboard, imagem, tags[], cores[], sort, is_active).
- RLS: cliente lê/edita só o próprio briefing enquanto não enviado; admin tudo; profissional atribuído só leitura. Biblioteca visual: leitura pública dos ativos, escrita só admin.
- Bucket privado `briefing-files` com pastas por usuário; downloads por URL assinada.
- Autosave com debounce (~1s) no cliente; definição das perguntas em um módulo de configuração tipado para alimentar IA futuramente.
- Rota `/_authenticated/briefing/$projectId`; /painel passa para área autenticada com dados reais.
