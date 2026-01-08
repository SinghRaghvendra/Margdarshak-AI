
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Link from 'next/link';
import Script from 'next/script';
import { Mail } from 'lucide-react';
import AppProviders from '@/components/AppProviders';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Councel Career Guide | AI COUNCEL LAB',
  description: 'AI-Powered Career Guidance. Get a data-driven career roadmap or instantly tailor your resume for any job application. Your professional journey, guided by AI.',
  keywords: ['career guide', 'resume builder', 'AI career advice', 'career roadmap', 'psychometric test', 'career suggestions', 'AI resume tailor'],
  other: {
    'facebook-domain-verification': '5sdewoekcpkipvjg1thrcwsf33cvy8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AppProviders>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-8 text-sm border-t bg-secondary/30">
              <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
                  {/* Left Column: Policies & Contact */}
                  <div className="space-y-4">
                      <div>
                          <h3 className="font-semibold text-foreground">Policies</h3>
                          <ul className="space-y-1 text-muted-foreground mt-1">
                              <li><Link href="/privacy-policy" className="hover:text-primary hover:underline">Privacy Policy</Link></li>
                              <li><Link href="/terms-conditions" className="hover:text-primary hover:underline">Terms & Conditions</Link></li>
                              <li><Link href="/cancellation-refund" className="hover:text-primary hover:underline">Cancellation & Refund</Link></li>
                          </ul>
                      </div>
                      <div>
                          <h3 className="font-semibold text-foreground">Contact Us</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mt-1">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <a href="mailto:support@aicouncel.com" className="hover:text-primary hover:underline">
                                  support@aicouncel.com
                              </a>
                          </div>
                      </div>
                  </div>

                  {/* Middle Column: About Us */}
                  <div className="space-y-4">
                      <div>
                          <h3 className="font-semibold text-foreground">About Us</h3>
                          <p className="text-muted-foreground mt-1">
                              AI Councel Lab is an innovation-driven AI company that builds next-generation artificial intelligence solutions for individuals and businesses. We specialize in practical and impactful tools powered by advanced AI research and design to deliver measurable value.
                          </p>
                      </div>
                  </div>

                  {/* Right Column: Our Vision */}
                  <div className="space-y-4">
                      <div>
                          <h3 className="font-semibold text-foreground">Our Vision</h3>
                          <p className="text-muted-foreground mt-1">
                              Our vision is to help people discover their true potential and secure the best opportunities to grow and succeed with confidence. We create AI products that make careers smarter and opportunities more accessible.
                          </p>
                      </div>
                  </div>
              </div>
              <div className="container mx-auto px-4 flex justify-between items-center mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                      © 2024 AI Councel Lab. All rights reserved.
                  </p>
              </div>
          </footer>
          <Toaster />
        </AppProviders>
        
        {/* Google Analytics Tag */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-Z6P0652JC4"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z6P0652JC4');
          `}
        </Script>

        {/* Microsoft Clarity Tag */}
        <Script id="microsoft-clarity">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uy249dxclm");
          `}
        </Script>
      </body>
    </html>
  );
}
