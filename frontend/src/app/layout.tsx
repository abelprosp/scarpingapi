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
  title: 'NoviqSearch — API de Busca e Dados Web',
  description:
    'API SERP com 2.700 créditos grátis. Planos a partir de R$ 197/mês com 100.000 créditos. Busca web, mapas, imagens, research e mais.',
  openGraph: {
    title: 'NoviqSearch',
    description: 'API de busca para desenvolvedores — 2.700 créditos grátis ao cadastrar.',
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
