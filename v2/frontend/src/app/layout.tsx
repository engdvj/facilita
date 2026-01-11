import type { Metadata } from 'next';
import { Fraunces, Onest } from 'next/font/google';
import NotificationStack from '@/components/notification-stack';
import ThemeSync from '@/components/theme-sync';
import './globals.css';

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Facilita',
  description: 'Portal administrativo do Facilita.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${onest.variable} ${fraunces.variable} antialiased`}>
        <ThemeSync />
        {children}
        <NotificationStack />
      </body>
    </html>
  );
}
