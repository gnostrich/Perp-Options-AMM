import './globals.css'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { type ReactNode } from 'react'
import { cookieToInitialState } from 'wagmi'

import { getConfig } from '../wagmi'
import { Providers } from './providers'
import ReferralCapture from '@/components/base/ReferralCapture'

import { ibmPlexMono } from "@/lib/font";

export const metadata: Metadata = {
  title: "Temporal",
  description: "Future of Market Mechanisms",
  icons: "/favicon.ico"
};


export default async function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get('cookie'),
  )
  return (
    <html lang="en">
      <body
        style={{
          backgroundImage: 'url("/background_physics.webp")',
          backdropFilter: 'grayscale(100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          margin: 0,
        }}
        // style={{ backgroundImage: 'url("/background_physics.jpg")' }}
        // className="bg-black"
        // className={`${inter.className} bg-cover bg-fixed `}
        className={`${ibmPlexMono.className} bg-black `}
      >
        <Providers initialState={initialState}>
          <ReferralCapture />
          {props.children}
        </Providers>
      </body>
    </html>
  )
}
