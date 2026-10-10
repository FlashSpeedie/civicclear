import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CivicClear AI — Make confusing documents understandable',
  description: 'Turn complicated school instructions, scholarship applications, financial-aid requirements, and official letters into clear next steps with source-backed explanations.',
  keywords: ['document analysis', 'scholarship help', 'financial aid', 'school forms', 'official letters', 'plain language'],
  authors: [{ name: 'CivicClear AI' }],
  creator: 'CivicClear AI',
  publisher: 'CivicClear AI',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://civiclear.ai',
    title: 'CivicClear AI — Make confusing documents understandable',
    description: 'Turn complicated documents into clear next steps with source-backed explanations.',
    siteName: 'CivicClear AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CivicClear AI',
    description: 'Make confusing documents understandable.',
  },
  verification: {
    other: {
      'civiclear-ai': 'true',
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a18' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
        {children}
      </body>
    </html>
  );
}