import { IBM_Plex_Mono, Chakra_Petch } from 'next/font/google'

export const ibmPlexMono = IBM_Plex_Mono({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const chakraPetch = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})