# Projeto e acompanhamento Design Eco-Holístico

## Objetivo
Manter o **Projeto de Design Eco-Holístico** focado no projeto de interiores personalizado e apresentar logo abaixo um novo **Acompanhamento de Design Eco-Holístico** recorrente, voltado à evolução dos ambientes ao longo das mudanças de vida.

## Experiência no site
- No cartão atual, deixar apenas o projeto personalizado de interiores com harmonização eco-holística, a partir de R$ 350,00 por ambiente.
- Remover a modalidade “Faça você mesmo” desse cartão.
- Inserir abaixo uma seção própria para o acompanhamento, com texto humanizado sobre ambientes que acompanham as transformações da vida.
- Explicar que arquitetos e designers ajudam com dúvidas de layout, disposição da decoração e soluções personalizadas de harmonização.
- Exibir três opções:
  - **Mensal:** R$ 79,90 por mês.
  - **Trimestral:** R$ 209,70 a cada 3 meses, apresentado como 3× R$ 69,90.
  - **Anual:** compromisso de 12 meses, cobrado mensalmente em 12× R$ 59,90.
- Informar claramente que o acompanhamento inclui 1 encontro com especialista a cada 3 meses.

## Compra e gestão
- Criar um produto de acompanhamento no provedor de pagamentos, com preços recorrentes separados para mensal, trimestral e anual.
- Abrir o pagamento seguro incorporado na página, vinculado à conta da pessoa.
- Registrar assinatura, ambiente de pagamento, opção contratada, situação, período vigente e compromisso anual no banco.
- Atualizar esses dados somente por avisos assinados do provedor de pagamentos.
- Disponibilizar gestão da assinatura e do pagamento no painel da pessoa.

## Regras da assinatura
- A compra libera o acompanhamento conforme a situação confirmada pelo provedor.
- O encontro com especialista fica disponível uma vez a cada trimestre de acesso.
- O cancelamento interrompe novas cobranças e mantém o acesso até o fim do período já pago.
- No anual, registrar o compromisso de 12 meses e deixar essa condição explícita antes da compra.
- Mudanças entre opções entram em vigor imediatamente, com crédito ou cobrança proporcional calculados pelo provedor.
- Pagamentos em atraso permanecem em período de regularização; cancelamento definitivo encerra o acesso ao fim do período aplicável.

## Painel da equipe
- Incluir o acompanhamento no gerenciamento de planos, com visibilidade das três opções e seus valores.
- Mostrar clientes, modalidade, situação, próxima cobrança, período de acesso e próxima elegibilidade ao encontro trimestral.
- Manter preços apresentados pela página ligados aos identificadores fixos criados no provedor, sem aceitar valores enviados pelo navegador.

## Validação
- Validar a apresentação em computador e celular.
- Testar pagamento em modo de teste, confirmação por aviso assinado, acesso, cancelamento no fim do período e troca proporcional.
- Confirmar que o fluxo existente dos projetos avulsos continua funcionando sem alterações.

## Detalhes técnicos
- Usar o checkout incorporado já adotado no projeto e o cliente de pagamentos compartilhado.
- Criar tabela de assinaturas com acesso por proprietário e equipe, incluindo filtro obrigatório por ambiente de pagamento.
- Tratar criação, atualização, atraso e cancelamento pelos eventos de assinatura e fatura.
- Resolver os níveis pelo identificador legível do preço, nunca pelo identificador interno do produto.
- Validar acesso sensível no servidor; a interface serve apenas para orientar a experiência.
