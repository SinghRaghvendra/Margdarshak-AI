
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import PromotionalBanner from '@/components/PromotionalBanner';

export const metadata: Metadata = {
  title: 'Margdarshak AI',
  description: 'AI-Powered Career Guidance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        <PromotionalBanner />
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Margdarshak AI powered by AI Councel Lab
          </p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
