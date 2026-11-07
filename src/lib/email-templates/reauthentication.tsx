import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de confirmação ARQECO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirme sua identidade</Heading>
        <Text style={text}>Use o código abaixo para confirmar sua identidade:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Este código expira em breve. Se você não fez esta solicitação,
          ignore esta mensagem.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Montserrat, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', backgroundColor: '#f7f5ef', borderTop: '4px solid #204b32' }
const h1 = {
  fontSize: '26px',
  fontFamily: 'Playfair Display, Georgia, serif',
  fontWeight: 'bold' as const,
  color: '#204b32',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '26px',
  fontFamily: 'Playfair Display, Georgia, serif',
  fontWeight: 'bold' as const,
  color: '#204b32',
  margin: '0 0 30px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
