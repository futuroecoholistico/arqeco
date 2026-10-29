# ARQECO e Eco-Holístico em uma só plataforma

## Resultado
Incorporar o APP ECO HOLISTICO à ARQECO, com uma conta por pessoa, uma única base de dados e painéis específicos para cada categoria. Preservar os projetos, planos, comissões, briefings e controles de segurança que já existem.

## 1. Cadastro e entrada
- Ao clicar em **Entrar**, apresentar as categorias **Cliente**, **Arquiteto/designer**, **Fornecedor** e **Afiliado/creator**, além de **Já tenho conta**.
- Novos usuários informam nome, e-mail, telefone, cidade e categoria; depois confirmam o e-mail e completam seus dados e foto.
- Usuários existentes entram normalmente, sem refazer o cadastro. Quem ainda não tem categoria completa essa informação uma vez.
- Arquitetos/designers, fornecedores e afiliados/creators completam o cadastro de identidade com CPF, documento e selfie, mantendo a aprovação da equipe.
- Escolher uma categoria não concede privilégios: acesso profissional e administrativo continua dependendo de aprovação autorizada.

## 2. Painéis por categoria
- **Cliente:** dados e foto, projetos adquiridos, briefing, novo Dossiê Eco-Holístico e histórico de dossiês.
- **Arquiteto/designer:** dados e foto, situação do cadastro, projetos atribuídos, ambientes, briefings, agenda e Zoe após aprovação.
- **Fornecedor:** dados e foto, situação do cadastro, produtos, curadoria e vendas.
- **Afiliado/creator:** dados e foto, situação do cadastro, links dos planos, indicações, ecos, comissões e datas de pagamento.
- Mostrar apenas a navegação da categoria da pessoa. Administradores mantêm acesso à gestão; não exibir o botão de administração a outros usuários.

## 3. Dossiê dentro da ARQECO
- Incorporar o questionário para ambientes residenciais, corporativos, comerciais, terapêuticos e de hotelaria.
- Preservar foto do ambiente, anamnese, documento da marca opcional, análise, recomendações, imagens de transformação, impressão/PDF, histórico e feedback.
- Substituir os links externos do Start por acesso interno ao Dossiê, mantendo o código de indicação ao longo do cadastro.
- Creditar **20 ecos** somente após a geração bem-sucedida do Dossiê por uma pessoa indicada, uma única vez por pessoa, sem autoindicação.
- Manter as comissões dos planos pagos em **10% do valor fechado**, após confirmação do pagamento, com recebimento no dia 15 do mês seguinte.
- O Start permanece gratuito. O aplicativo de origem também contém um desbloqueio do relatório completo por **R$ 49,90 / 7 dias**; esse recurso será preservado separadamente, sem alterar os preços dos planos ARQECO. Se a intenção for tornar também esse conteúdo integralmente gratuito, ajustar esse ponto antes da implementação.

## 4. Administração unificada
- Criar a área **Cadastros** com todos os inscritos, inclusive clientes e pessoas que ainda não enviaram um pedido de parceria.
- Exibir nome, e-mail, categoria, telefone, cidade, foto, data de cadastro e situação de confirmação/aprovação, com busca e filtros.
- Manter a análise privada de documentos e selfies e a aprovação dos parceiros.
- Acrescentar visão dos dossiês e feedbacks, preservando as áreas existentes de contratos, briefings, planos e indicações.

## 5. Dados existentes e transição
- Novos cadastros e dossiês passam a usar o Lovable Cloud da ARQECO.
- O código do outro projeto está disponível, mas seus registros e usuários não vieram junto. Construir e testar a integração sem inventar ou copiar registros privados.
- Depois da prévia, solicitar no chat do **APP ECO HOLISTICO** a exportação dos usuários, dossiês, feedbacks, acessos pagos e arquivos com seus vínculos, para importação aqui.
- Preservar os identificadores de origem e relacionar os registros às contas corretas somente após confirmação segura do e-mail. Não mesclar contas apenas por um nome informado.
- Usuários migrados manterão seus perfis e dados; no primeiro acesso, verificarão o e-mail e escolherão uma nova senha. Senhas e sessões antigas não são transferidas.
- O site Eco-Holístico atual não será apagado nem alterado por esta integração. A publicação e a troca definitiva do acesso serão tratadas depois da verificação.

## Detalhes técnicos
- Adaptar os módulos TanStack existentes do aplicativo de origem, mantendo as versões atuais da ARQECO e suas integrações geradas.
- Criar esquema aditivo para dossiês, feedbacks, acessos e mapeamento de identidades, com permissões explícitas e acesso por proprietário/administrador.
- Manter papéis em `user_roles`, separados dos dados de perfil; não usar categoria selecionada pelo usuário como autorização.
- Separar fotos de perfil de documentos de identidade, com armazenamento privado e acesso controlado.
- Preservar Lovable AI, localização e pagamentos compatíveis; verificar configurações disponíveis antes de solicitar qualquer chave por formulário seguro.
- Preservar callbacks e avisos de pagamento do Dossiê sem colidir com os pagamentos dos planos ARQECO.
- Fazer o crédito interno de ecos de forma atômica e idempotente, dispensando a comunicação entre os dois aplicativos para novos dossiês.

## Verificação e entrega
- Testar cadastro, confirmação de e-mail, entrada e navegação de cada categoria.
- Testar criação e leitura de um dossiê real, upload, histórico, feedback e crédito de 20 ecos.
- Confirmar que outra pessoa não consegue ler registros privados nem acessar ações administrativas/profissionais.
- Conferir a lista de inscritos no admin, os fluxos existentes de planos e os títulos das páginas.
- Informar separadamente o que está pronto e o que ainda depende das exportações, configurações externas ou confirmação por e-mail; não declarar a migração completa antes dessas verificações.