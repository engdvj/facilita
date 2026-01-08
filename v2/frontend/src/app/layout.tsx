import type { Metadata } from 'next';
import { Fraunces, Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Facilita V2',
  description: 'Portal administrativo do Facilita V2.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${sora.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
