// Gerado a partir da Anamnese Eco Holística® enviada pela autora da metodologia.
import type { Pergunta } from "./questionario";

export const ANAMNESE: Pergunta[] = [
 {
  "id": "anam01",
  "secao": "Identificação do ambiente",
  "label": "Qual ambiente será analisado?",
  "tipo": "radio",
  "opcoes": [
   "Sala de estar",
   "Sala de jantar",
   "Quarto de casal",
   "Quarto individual",
   "Quarto infantil",
   "Cozinha",
   "Banheiro ou lavabo",
   "Home office",
   "Escritório corporativo",
   "Consultório ou sala de atendimento",
   "Sala de espera ou recepção",
   "Espaço comercial",
   "Espaço de meditação ou prática integrativa",
   "Academia ou espaço de movimento",
   "Varanda ou sacada",
   "Jardim ou área externa",
   "Ambiente multifuncional",
   "Outro"
  ],
  "obrigatoria": true
 },
 {
  "id": "anam02",
  "secao": "Identificação do ambiente",
  "label": "Qual é a principal utilização desse ambiente?",
  "tipo": "radio",
  "opcoes": [
   "Descanso e recuperação",
   "Convivência e relacionamentos",
   "Alimentação",
   "Trabalho e produtividade",
   "Criatividade e expressão",
   "Atendimento a clientes ou pacientes",
   "Estudo e aprendizagem",
   "Práticas contemplativas ou espirituais",
   "Atividades físicas",
   "Recepção e circulação de pessoas",
   "Exposição de produtos e vendas",
   "Múltiplas atividades ao longo do dia",
   "Outra"
  ],
  "obrigatoria": true
 },
 {
  "id": "anam03",
  "secao": "Identificação do ambiente",
  "label": "Quem utiliza esse ambiente regularmente?",
  "tipo": "checkbox",
  "opcoes": [
   "Apenas uma pessoa adulta",
   "Casal",
   "Família com crianças",
   "Família com adolescentes",
   "Pessoas idosas",
   "Pessoas com mobilidade reduzida",
   "Profissionais e colaboradores",
   "Clientes, pacientes ou visitantes",
   "Animais de estimação",
   "Uso eventual por diferentes pessoas"
  ]
 },
 {
  "id": "anam04",
  "secao": "Identificação do ambiente",
  "label": "Com que frequência o ambiente é utilizado?",
  "tipo": "radio",
  "opcoes": [
   "Ocasionalmente",
   "Algumas horas por dia",
   "Entre 4 e 8 horas por dia",
   "Mais de 8 horas por dia",
   "Praticamente durante todo o dia",
   "A utilização varia conforme o dia"
  ]
 },
 {
  "id": "anam05",
  "secao": "Identificação do ambiente",
  "label": "Em quais períodos o ambiente é mais utilizado?",
  "tipo": "checkbox",
  "opcoes": [
   "Início da manhã",
   "Final da manhã",
   "Tarde",
   "Início da noite",
   "Noite",
   "Madrugada",
   "Durante todo o dia",
   "Não existe uma rotina definida"
  ]
 },
 {
  "id": "anam06",
  "secao": "Identificação do ambiente",
  "label": "Qual é a condição atual do imóvel?",
  "tipo": "radio",
  "opcoes": [
   "Imóvel próprio",
   "Imóvel alugado",
   "Imóvel comercial alugado",
   "Imóvel próprio em reforma",
   "Imóvel em construção",
   "Ambiente recém-entregue, ainda sem mobiliário",
   "Ambiente mobiliado e em uso",
   "Outro"
  ]
 },
 {
  "id": "anam07",
  "secao": "Experiência e percepção do ambiente",
  "label": "Como você costuma se sentir quando está nesse ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Acolhido e confortável",
   "Calmo e tranquilo",
   "Motivado e disposto",
   "Concentrado e produtivo",
   "Criativo e inspirado",
   "Seguro e protegido",
   "Conectado com a natureza",
   "Indiferente",
   "Inquieto ou desconfortável",
   "Sobrecarregado pelos estímulos",
   "Desconectado do espaço",
   "Sem privacidade",
   "Não consigo identificar uma sensação predominante"
  ],
  "max": 3,
  "ajuda": "selecione até três opções."
 },
 {
  "id": "anam08",
  "secao": "Experiência e percepção do ambiente",
  "label": "Como você percebe o ambiente em relação às características abaixo?",
  "tipo": "escala",
  "itens": [
   "Acolhimento",
   "Conforto físico",
   "Conforto visual",
   "Iluminação",
   "Ventilação",
   "Conforto acústico",
   "Organização",
   "Circulação",
   "Privacidade",
   "Conexão com a natureza",
   "Funcionalidade",
   "Identidade e personalidade"
  ],
  "opcoes": [
   "1 — Muito insatisfatório",
   "2 — Insatisfatório",
   "3 — Regular",
   "4 — Satisfatório",
   "5 — Muito satisfatório",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam09",
  "secao": "Experiência e percepção do ambiente",
  "label": "Quais situações mais incomodam você nesse ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Excesso de luz",
   "Falta de luz",
   "Calor excessivo",
   "Sensação de frio",
   "Ruídos externos",
   "Eco ou reverberação",
   "Pouca ventilação",
   "Sensação de ar parado",
   "Excesso de objetos",
   "Desorganização visual",
   "Falta de privacidade",
   "Falta de conforto",
   "Dificuldade de circulação",
   "Ausência de vegetação",
   "Falta de cores ou personalidade",
   "Sensação de vazio",
   "Excesso de cores ou estímulos",
   "Materiais que parecem frios ou pouco acolhedores",
   "Dificuldade de concentração",
   "Nenhuma dessas situações",
   "Outro"
  ]
 },
 {
  "id": "anam10",
  "secao": "Experiência e percepção do ambiente",
  "label": "Em quais situações você percebe mais desconforto?",
  "tipo": "checkbox",
  "opcoes": [
   "Ao chegar ao ambiente",
   "Durante o trabalho ou estudo",
   "Durante o descanso",
   "Ao receber outras pessoas",
   "Durante conversas ou reuniões",
   "Durante atividades de concentração",
   "Durante a noite",
   "Nas horas de maior incidência solar",
   "Quando o ambiente está cheio",
   "Quando estou sozinho",
   "Não percebo desconforto específico",
   "Outra situação"
  ]
 },
 {
  "id": "anam11",
  "secao": "Experiência e percepção do ambiente",
  "label": "Como você percebe a atmosfera geral do ambiente?",
  "tipo": "radio",
  "opcoes": [
   "Muito estimulante e movimentada",
   "Estimulante, mas equilibrada",
   "Neutra e funcional",
   "Acolhedora e confortável",
   "Tranquila e contemplativa",
   "Visualmente sobrecarregada",
   "Fria e impessoal",
   "Vazia ou pouco definida",
   "Não consigo avaliar"
  ]
 },
 {
  "id": "anam12",
  "secao": "Experiência e percepção do ambiente",
  "label": "Como você percebe a relação entre o ambiente e sua identidade?",
  "tipo": "radio",
  "opcoes": [
   "O ambiente representa muito bem minha personalidade e meus valores",
   "Representa parcialmente quem sou",
   "É funcional, mas não expressa minha identidade",
   "Parece impessoal ou genérico",
   "Não me identifico com o ambiente",
   "Ainda estou descobrindo como gostaria que ele me representasse"
  ]
 },
 {
  "id": "anam13",
  "secao": "Experiência e percepção do ambiente",
  "label": "O ambiente possui alguma história ou significado especial?",
  "tipo": "radio",
  "opcoes": [
   "Sim, está relacionado à história da minha família",
   "Sim, possui objetos ou lembranças afetivas",
   "Sim, representa uma nova fase da minha vida",
   "Sim, está associado à minha trajetória profissional",
   "Sim, está relacionado à minha espiritualidade ou filosofia de vida",
   "Não possui um significado especial para mim",
   "Prefiro não responder"
  ]
 },
 {
  "id": "anam13detalhe",
  "secao": "Experiência e percepção do ambiente",
  "label": "Se quiser, descreva esse significado",
  "tipo": "textarea",
  "mostrarSe": {
   "id": "anam13",
   "prefixo": "Sim"
  }
 },
 {
  "id": "anam14",
  "secao": "Rotina, conforto e necessidades",
  "label": "Quais atividades são realizadas nesse ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Descansar",
   "Dormir",
   "Trabalhar",
   "Estudar",
   "Ler",
   "Meditar ou contemplar",
   "Receber amigos e familiares",
   "Fazer refeições",
   "Cozinhar",
   "Realizar atendimentos",
   "Participar de reuniões",
   "Praticar atividades físicas",
   "Brincar com crianças",
   "Cuidar de plantas",
   "Expor produtos",
   "Realizar atividades criativas",
   "Outras"
  ]
 },
 {
  "id": "anam15",
  "secao": "Rotina, conforto e necessidades",
  "label": "Como está a organização dos móveis e objetos?",
  "tipo": "radio",
  "opcoes": [
   "Os móveis atendem às necessidades e a circulação é confortável",
   "Os móveis funcionam, mas há pontos de circulação apertada",
   "Existem móveis ou objetos sem função definida",
   "O ambiente possui muitos objetos e estímulos visuais",
   "O ambiente está praticamente vazio",
   "A disposição atual não atende à utilização do espaço",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam16",
  "secao": "Rotina, conforto e necessidades",
  "label": "Como você percebe o conforto físico durante o uso do ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Móveis confortáveis e adequados às atividades",
   "Assentos desconfortáveis",
   "Mobiliário inadequado à altura ou à atividade",
   "Superfícies excessivamente duras",
   "Falta de apoio para as atividades",
   "Temperatura desconfortável",
   "Iluminação inadequada para as tarefas",
   "Ruído que interfere no uso",
   "Circulação prejudicada",
   "O ambiente atende bem às minhas necessidades",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam17",
  "secao": "Rotina, conforto e necessidades",
  "label": "Como você percebe a privacidade?",
  "tipo": "radio",
  "opcoes": [
   "Adequada para todas as atividades",
   "Adequada na maior parte do tempo",
   "Insuficiente em alguns momentos",
   "Insuficiente para as atividades realizadas",
   "O ambiente é excessivamente fechado",
   "Não se aplica à utilização desse espaço"
  ]
 },
 {
  "id": "anam18",
  "secao": "Rotina, conforto e necessidades",
  "label": "Como você percebe a flexibilidade do ambiente?",
  "tipo": "radio",
  "opcoes": [
   "O espaço se adapta facilmente às diferentes atividades",
   "É possível fazer pequenos ajustes",
   "O layout atende a uma única atividade",
   "O mobiliário dificulta a adaptação",
   "O ambiente precisa de uma reorganização",
   "Não se aplica"
  ]
 },
 {
  "id": "anam19",
  "secao": "Iluminação, ventilação e conforto ambiental",
  "label": "Como você percebe a iluminação natural?",
  "tipo": "radio",
  "opcoes": [
   "Muito baixa durante todo o dia",
   "Baixa, mas suficiente para algumas atividades",
   "Adequada na maior parte do dia",
   "Intensa e agradável",
   "Excessiva, provocando ofuscamento",
   "Excessiva, aumentando a sensação de calor",
   "Varia bastante conforme o horário",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam20",
  "secao": "Iluminação, ventilação e conforto ambiental",
  "label": "Como você percebe a iluminação artificial?",
  "tipo": "checkbox",
  "opcoes": [
   "Há pouca iluminação",
   "A iluminação é muito intensa",
   "Existe apenas uma fonte principal de luz",
   "Há iluminação geral e pontos de luz complementares",
   "Existem luminárias direcionadas para tarefas específicas",
   "A intensidade pode ser ajustada",
   "A iluminação permite criar diferentes atmosferas",
   "Existem pontos escuros ou sombras desconfortáveis",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam21",
  "secao": "Iluminação, ventilação e conforto ambiental",
  "label": "Como é a ventilação natural?",
  "tipo": "radio",
  "opcoes": [
   "Não há janelas ou aberturas para o exterior",
   "Há aberturas, mas a circulação de ar é limitada",
   "Há ventilação moderada",
   "Há boa circulação de ar",
   "Há aberturas em lados diferentes, favorecendo a ventilação cruzada",
   "Há correntes de ar desconfortáveis",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam22",
  "secao": "Iluminação, ventilação e conforto ambiental",
  "label": "Como você percebe a temperatura do ambiente?",
  "tipo": "radio",
  "opcoes": [
   "Geralmente muito quente",
   "Mais quente em determinados horários",
   "Geralmente muito frio",
   "Mais frio em determinados horários",
   "Confortável durante a maior parte do dia",
   "Varia significativamente ao longo das estações",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam23",
  "secao": "Iluminação, ventilação e conforto ambiental",
  "label": "Como você percebe o ambiente sonoro?",
  "tipo": "checkbox",
  "opcoes": [
   "Predominantemente silencioso",
   "Sons agradáveis do exterior",
   "Ruídos de trânsito ou da rua",
   "Ruídos de vizinhos",
   "Ruídos de equipamentos",
   "Eco ou reverberação",
   "Sons de conversas que interferem nas atividades",
   "Música ou sons ambientes frequentes",
   "Preciso de maior isolamento acústico",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam24",
  "secao": "Iluminação, ventilação e conforto ambiental",
  "label": "Há sinais de umidade ou problemas relacionados à qualidade do ar?",
  "tipo": "checkbox",
  "opcoes": [
   "Não percebo sinais aparentes",
   "Há cheiro persistente de umidade",
   "Há manchas de umidade",
   "Há sinais visíveis de mofo",
   "O ambiente acumula poeira com facilidade",
   "Existem odores persistentes",
   "Há pouca renovação do ar",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam25",
  "secao": "Materiais, cores e elementos naturais",
  "label": "Quais materiais predominam no ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Madeira",
   "Cerâmica ou porcelanato",
   "Pedra natural",
   "Concreto",
   "Vidro",
   "Metal",
   "Tecidos",
   "Fibras naturais",
   "Materiais sintéticos",
   "Gesso e superfícies pintadas",
   "Materiais reaproveitados",
   "Não sei identificar"
  ]
 },
 {
  "id": "anam26",
  "secao": "Materiais, cores e elementos naturais",
  "label": "Quais características visuais predominam?",
  "tipo": "checkbox",
  "opcoes": [
   "Superfícies lisas",
   "Texturas naturais",
   "Materiais visualmente rústicos",
   "Superfícies brilhantes",
   "Superfícies foscas",
   "Formas retas e geométricas",
   "Formas curvas e orgânicas",
   "Poucos contrastes",
   "Contrastes marcantes",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam27",
  "secao": "Materiais, cores e elementos naturais",
  "label": "Quais cores predominam no ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Branco",
   "Bege e areia",
   "Marrom e madeira",
   "Ocre e terracota",
   "Verde",
   "Azul",
   "Turquesa",
   "Amarelo",
   "Laranja",
   "Vermelho",
   "Rosa",
   "Roxo e lilás",
   "Cinza",
   "Preto",
   "Prata e tons metálicos",
   "Cores variadas"
  ]
 },
 {
  "id": "anam28",
  "secao": "Materiais, cores e elementos naturais",
  "label": "Como você percebe a composição de cores atual?",
  "tipo": "radio",
  "opcoes": [
   "Suave e harmoniosa",
   "Neutra e discreta",
   "Muito fria",
   "Muito quente",
   "Muito escura",
   "Muito clara",
   "Monótona",
   "Visualmente sobrecarregada",
   "Desconectada da função do ambiente",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam29",
  "secao": "Materiais, cores e elementos naturais",
  "label": "Há elementos naturais no ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Plantas naturais",
   "Flores",
   "Madeira natural",
   "Pedra",
   "Cerâmica ou argila",
   "Fibras naturais",
   "Água ou elementos aquáticos",
   "Vista para jardins ou vegetação",
   "Luz natural abundante",
   "Paisagens ou imagens da natureza",
   "Nenhum dos elementos citados"
  ]
 },
 {
  "id": "anam30",
  "secao": "Materiais, cores e elementos naturais",
  "label": "Como você percebe a presença de vegetação?",
  "tipo": "radio",
  "opcoes": [
   "Não há plantas ou vegetação",
   "Há poucas plantas",
   "Há plantas distribuídas pelo ambiente",
   "Há uma composição significativa de plantas",
   "Existe integração com jardim ou vegetação externa",
   "Há plantas, mas a manutenção é difícil",
   "Não se aplica"
  ]
 },
 {
  "id": "anam31",
  "secao": "Materiais, cores e elementos naturais",
  "label": "Qual é a disponibilidade de luz para o cultivo de plantas?",
  "tipo": "radio",
  "opcoes": [
   "Pouquíssima luz natural",
   "Luz indireta durante boa parte do dia",
   "Luz natural moderada",
   "Luz direta durante algumas horas",
   "Luz direta intensa durante grande parte do dia",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam32",
  "secao": "Materiais, cores e elementos naturais",
  "label": "Existem limitações para utilizar plantas naturais?",
  "tipo": "checkbox",
  "opcoes": [
   "Não existem limitações conhecidas",
   "Pouco tempo para manutenção",
   "Pouca iluminação natural",
   "Pouco espaço disponível",
   "Presença de animais de estimação",
   "Presença de crianças pequenas",
   "Sensibilidades relacionadas a pólen ou fragrâncias vegetais",
   "Dificuldade de acesso para rega e manutenção",
   "Preferência por plantas de baixa manutenção",
   "Prefiro não utilizar plantas naturais"
  ]
 },
 {
  "id": "anam33",
  "secao": "Rotina e preferências sensoriais",
  "label": "Quais estímulos sensoriais fazem parte da sua rotina nesse ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Luz natural",
   "Iluminação artificial intensa",
   "Iluminação indireta",
   "Sons da natureza",
   "Música",
   "Silêncio",
   "Aromas",
   "Contato com plantas",
   "Contato com materiais naturais",
   "Cores vibrantes",
   "Cores suaves",
   "Muitos estímulos visuais",
   "Poucos estímulos visuais"
  ]
 },
 {
  "id": "anam34",
  "secao": "Rotina e preferências sensoriais",
  "label": "Você apresenta alguma sensibilidade que deve ser considerada na escolha de materiais e estímulos?",
  "tipo": "checkbox",
  "opcoes": [
   "Sensibilidade a aromas ou fragrâncias",
   "Sensibilidade a sons",
   "Sensibilidade à iluminação intensa",
   "Sensibilidade a determinadas cores",
   "Sensibilidade a poeira",
   "Sensibilidade a pólen",
   "Sensibilidade a determinados materiais",
   "Necessidade de circulação acessível",
   "Necessidade de reduzir estímulos visuais",
   "Nenhuma das opções",
   "Prefiro não responder"
  ]
 },
 {
  "id": "anam35",
  "secao": "Rotina e preferências sensoriais",
  "label": "Como você prefere a atmosfera sonora do ambiente?",
  "tipo": "radio",
  "opcoes": [
   "Silêncio predominante",
   "Sons suaves da natureza",
   "Música instrumental",
   "Sons ambientes discretos",
   "Sons que estimulem a concentração",
   "Sons que criem uma atmosfera contemplativa",
   "Varia conforme a atividade",
   "Não desejo estímulos sonoros adicionais"
  ]
 },
 {
  "id": "anam36",
  "secao": "Rotina e preferências sensoriais",
  "label": "Qual característica descreve melhor sua relação com aromas?",
  "tipo": "radio",
  "opcoes": [
   "Gosto de aromas suaves",
   "Prefiro aromas naturais e herbais",
   "Prefiro aromas cítricos",
   "Prefiro aromas florais",
   "Prefiro aromas amadeirados",
   "Prefiro ambientes sem fragrâncias",
   "Tenho sensibilidade a aromas",
   "Não tenho preferência definida"
  ]
 },
 {
  "id": "anam37",
  "secao": "Sustentabilidade e ciclo de vida",
  "label": "Você conhece a origem dos principais materiais utilizados no ambiente?",
  "tipo": "radio",
  "opcoes": [
   "Conheço a origem da maioria dos materiais",
   "Conheço apenas alguns",
   "Não conheço a origem dos materiais",
   "O ambiente ainda está em fase de projeto",
   "Não sei informar"
  ]
 },
 {
  "id": "anam38",
  "secao": "Sustentabilidade e ciclo de vida",
  "label": "Quais soluções de sustentabilidade já estão presentes?",
  "tipo": "checkbox",
  "opcoes": [
   "Aproveitamento da iluminação natural",
   "Ventilação natural",
   "Lâmpadas LED",
   "Equipamentos eficientes",
   "Madeira de origem responsável",
   "Materiais reciclados ou reaproveitados",
   "Móveis restaurados ou reutilizados",
   "Tintas e acabamentos de baixa emissão",
   "Plantas e integração com a natureza",
   "Dispositivos economizadores de água",
   "Captação ou reaproveitamento de água",
   "Energia solar",
   "Separação e destinação adequada de resíduos",
   "Nenhuma das opções",
   "Não sei informar"
  ]
 },
 {
  "id": "anam39",
  "secao": "Sustentabilidade e ciclo de vida",
  "label": "Como é realizada a manutenção do ambiente?",
  "tipo": "radio",
  "opcoes": [
   "A manutenção é simples",
   "Exige cuidados frequentes",
   "Há materiais que demandam manutenção especializada",
   "Existem problemas recorrentes de conservação",
   "A manutenção é difícil por falta de acesso",
   "Não sei avaliar"
  ]
 },
 {
  "id": "anam40",
  "secao": "Sustentabilidade e ciclo de vida",
  "label": "Qual é a situação dos móveis e objetos existentes?",
  "tipo": "radio",
  "opcoes": [
   "Estão em boas condições e atendem às necessidades",
   "Estão em boas condições, mas precisam ser reorganizados",
   "Alguns precisam de reparos",
   "Há itens que poderiam ser restaurados ou reaproveitados",
   "Muitos itens não atendem mais às necessidades",
   "O ambiente está praticamente vazio",
   "O ambiente está em fase de projeto"
  ]
 },
 {
  "id": "anam41",
  "secao": "Viabilidade da transformação",
  "label": "Qual é o limite de investimento disponível para as melhorias?",
  "tipo": "radio",
  "opcoes": [
   "Não pretendo investir financeiramente neste momento",
   "Até R$ 500",
   "De R$ 501 a R$ 2.000",
   "De R$ 2.001 a R$ 5.000",
   "De R$ 5.001 a R$ 15.000",
   "Acima de R$ 15.000",
   "Ainda não defini um orçamento"
  ]
 },
 {
  "id": "anam42",
  "secao": "Viabilidade da transformação",
  "label": "Qual é o nível de intervenção atualmente viável?",
  "tipo": "radio",
  "opcoes": [
   "Apenas reorganizar os móveis e objetos",
   "Incluir acessórios e elementos decorativos",
   "Modificar cores e iluminação",
   "Substituir móveis e materiais",
   "Realizar pequenas intervenções físicas",
   "Realizar uma reforma parcial",
   "Realizar uma reforma completa",
   "Ainda não sei"
  ]
 },
 {
  "id": "anam43",
  "secao": "Viabilidade da transformação",
  "label": "Existem restrições para realizar mudanças?",
  "tipo": "checkbox",
  "opcoes": [
   "Imóvel alugado",
   "Restrições de condomínio",
   "Impossibilidade de realizar obras",
   "Necessidade de manter móveis existentes",
   "Limitações financeiras",
   "Necessidade de preservar elementos históricos ou arquitetônicos",
   "Restrições de acessibilidade",
   "Necessidade de manter o ambiente em funcionamento durante as intervenções",
   "Limitações para instalação elétrica ou hidráulica",
   "Nenhuma restrição conhecida",
   "Outra"
  ]
 },
 {
  "id": "anam44",
  "secao": "Viabilidade da transformação",
  "label": "Em qual prazo as mudanças poderão ser realizadas?",
  "tipo": "radio",
  "opcoes": [
   "Imediatamente",
   "Em até 7 dias",
   "Em até 30 dias",
   "Em até 90 dias",
   "Gradualmente, ao longo de vários meses",
   "Ainda não há previsão"
  ]
 },
 {
  "id": "anam45",
  "secao": "Anamnese complementar dos cinco elementos",
  "label": "Como você percebe a sensação de estabilidade e acolhimento físico?",
  "tipo": "radio",
  "opcoes": [
   "O ambiente parece pouco acolhedor",
   "Predominam superfícies duras e pouco confortáveis",
   "Existe algum acolhimento, mas poderia melhorar",
   "O ambiente oferece bom conforto físico",
   "O ambiente é acolhedor e confortável",
   "Não sei avaliar"
  ],
  "elemento": "Terra"
 },
 {
  "id": "anam46",
  "secao": "Anamnese complementar dos cinco elementos",
  "label": "Como você percebe a circulação e a fluidez do espaço?",
  "tipo": "radio",
  "opcoes": [
   "Há obstáculos frequentes",
   "A circulação é limitada",
   "A circulação funciona, mas poderia melhorar",
   "A circulação é confortável",
   "O espaço permite movimentos fluidos e diferentes usos",
   "Não sei avaliar"
  ],
  "elemento": "Água"
 },
 {
  "id": "anam47",
  "secao": "Anamnese complementar dos cinco elementos",
  "label": "Como você percebe a energia visual e a iluminação do ambiente?",
  "tipo": "radio",
  "opcoes": [
   "O ambiente parece escuro ou pouco estimulante",
   "A iluminação é insuficiente para algumas atividades",
   "A iluminação é funcional, mas poderia melhorar",
   "A iluminação e a atmosfera visual são agradáveis",
   "O ambiente possui estímulos intensos ou excessivos",
   "Não sei avaliar"
  ],
  "elemento": "Fogo"
 },
 {
  "id": "anam48",
  "secao": "Anamnese complementar dos cinco elementos",
  "label": "Como você percebe a abertura, a leveza e a liberdade de movimento?",
  "tipo": "radio",
  "opcoes": [
   "O ambiente parece fechado e limitado",
   "Há pouca liberdade de circulação",
   "O espaço é funcional, mas poderia ser mais leve",
   "O ambiente parece aberto e confortável",
   "O espaço é muito aberto e oferece pouca proteção ou privacidade",
   "Não sei avaliar"
  ],
  "elemento": "Ar"
 },
 {
  "id": "anam49",
  "secao": "Anamnese complementar dos cinco elementos",
  "label": "Como você percebe a identidade e o significado desse espaço?",
  "tipo": "radio",
  "opcoes": [
   "O ambiente parece impessoal",
   "Não expressa meus valores ou minha identidade",
   "Há alguns elementos significativos",
   "O ambiente expressa minha identidade",
   "O espaço possui forte significado pessoal ou simbólico",
   "Prefiro ambientes neutros, sem simbolismo específico"
  ],
  "elemento": "Éter"
 },
 {
  "id": "anam50",
  "secao": "Anamnese complementar dos cinco elementos",
  "label": "Quais características você considera mais importantes para o uso cotidiano desse ambiente?",
  "tipo": "checkbox",
  "opcoes": [
   "Estabilidade e conforto físico",
   "Fluidez e flexibilidade",
   "Luz e vitalidade",
   "Leveza e liberdade de circulação",
   "Significado pessoal e identidade",
   "Integração com a natureza",
   "Funcionalidade",
   "Privacidade",
   "Sustentabilidade",
   "Facilidade de manutenção"
  ]
 }
];

export const REGRAS_ANAMNESE: string[] = [
 "se houver uma resposta afirmativa, o aplicativo poderá oferecer um campo opcional para a pessoa descrever esse significado. O conteúdo será utilizado para personalizar a curadoria simbólica, sem atribuir significados psicológicos automáticos.",
 "respostas que indiquem umidade ou mofo devem gerar uma recomendação de investigação da causa e correção apropriada. O aplicativo não deve tentar resolver esses problemas apenas com plantas, aromas ou elementos simbólicos.",
 "as recomendações de espécies devem considerar iluminação, manutenção, segurança e adequação ao ambiente. A aparência da fotografia, isoladamente, não é suficiente para determinar as condições de cultivo.",
 "este bloco não deve ser utilizado isoladamente para calcular as pontuações dos elementos. Suas respostas complementam a avaliação realizada a partir dos demais dados."
];
