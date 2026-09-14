import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { BRAND_FAVICON_PATH, BRAND_LOGO_PATH, BRAND_MARK_PATH, BRAND_NAME } from '@/lib/brand';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: BRAND_NAME,
    template: `%s · ${BRAND_NAME}`,
  },
  description: 'Logga arbetstid och beräkna lön före och efter skatt',
  applicationName: BRAND_NAME,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: BRAND_FAVICON_PATH, type: 'image/png', sizes: '948x948' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '512x512' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: BRAND_NAME,
    description: 'Logga arbetstid och beräkna lön före och efter skatt',
    siteName: BRAND_NAME,
    images: [{ url: BRAND_LOGO_PATH, width: 792, height: 918, alt: BRAND_NAME }],
  },
  twitter: {
    card: 'summary',
    title: BRAND_NAME,
    description: 'Logga arbetstid och beräkna lön före och efter skatt',
    images: [BRAND_MARK_PATH],
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="sv" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
