import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Seu link de acesso à {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Acesse sua conta</Heading>
        <Text style={text}>
          Clique no botão abaixo para entrar na {siteName}. Este link expira
          em breve.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Entrar na ARQECO
        </Button>
        <Text style={footer}>
          Se você não solicitou este link, ignore esta mensagem.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
const button = {
  backgroundColor: '#204b32',
  color: '#ffffff',
  fontSize: '14px',
  border: '1px solid #204b32',
  borderRadius: '4px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #ffffff !important; color: #000000 !important; }
  }
  [data-ogsc] .dm-btn { background-color: #ffffff !important; color: #000000 !important; }
  [data-ogsb] .dm-btn { background-color: #ffffff !important; color: #000000 !important; }
`
