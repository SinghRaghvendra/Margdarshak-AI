
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Link from 'next/link';

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
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="py-6 text-center border-t">
            <div className="flex justify-center gap-x-6 gap-y-2 flex-wrap mb-4">
               <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms-conditions" className="text-xs text-muted-foreground hover:text-primary">
                Terms & Conditions
              </Link>
              <Link href="/cancellation-refund" className="text-xs text-muted-foreground hover:text-primary">
                Cancellation & Refund
              </Link>
            </div>
          <p className="text-xs text-muted-foreground">
            Margdarshak AI powered by AI Councel Lab
          </p>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
