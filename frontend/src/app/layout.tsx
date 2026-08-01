import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NoviqSearch — Infraestrutura de recuperação de conhecimento para IA',
  description:
    'A plataforma brasileira para conectar agentes de IA ao mundo. Search, Deep Research, Crawl, Browser, RAG, MCP e créditos de inteligência.',
  openGraph: {
    title: 'NoviqSearch — Web Intelligence Platform',
    description:
      'Infraestrutura de recuperação de conhecimento para agentes de IA, automações e SaaS builders.',
    url: 'https://noviqsearch.online',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
