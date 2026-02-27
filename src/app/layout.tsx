import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Link from 'next/link';
import Script from 'next/script';
import { Mail, Facebook, Linkedin, Youtube } from 'lucide-react';
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
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NQWZVCXC');
          `}
        </Script>
        {/* End Google Tag Manager */}
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '897502332801622');
            fbq('track', 'PageView');
          `}
        </Script>
        {/* End Meta Pixel Code */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NQWZVCXC"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Meta Pixel (noscript) */}
        <noscript>
            <img height="1" width="1" style={{display: 'none'}}
                 src="https://www.facebook.com/tr?id=897502332801622&ev=PageView&noscript=1" />
        </noscript>
        {/* End Meta Pixel (noscript) */}
        <AppProviders>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-12 text-sm border-t bg-secondary/30">
              <div className="container mx-auto px-4 space-y-12">
                  <div className="grid md:grid-cols-1 gap-8">
                      <div className="space-y-4">
                          <h3 className="text-xl font-bold text-foreground">About AI Councel Lab</h3>
                          <div className="text-muted-foreground space-y-4 leading-relaxed max-w-5xl">
                              <p>
                                  AI Councel Lab is an AI-powered career counselling platform in India designed to help students and professionals make informed, confident career decisions. We combine advanced artificial intelligence with experienced human career counsellors to deliver personalized, science-backed career guidance that aligns with individual strengths, interests, and long-term goals.
                              </p>
                              <p>
                                  Our platform provides comprehensive online career counselling, AI-based career assessments, psychometric analysis, and one-on-one mentoring sessions to help individuals navigate important academic and professional milestones. Whether you are searching for career options after 10th, career guidance after 12th, choosing the right stream, exploring high-growth fields like data science or artificial intelligence, or planning a career transition, AI Councel Lab offers structured and reliable support.
                              </p>
                              <p>
                                  Unlike traditional career counselling services, our AI-driven system analyzes skills, aptitude, personality traits, and market trends to generate personalized career recommendations. These insights are further validated by certified career counsellors and industry mentors, ensuring clarity and practical direction.
                              </p>
                              <p>
                                  We serve students across India seeking affordable and effective career counselling solutions. By making professional career guidance accessible online, we aim to remove confusion, reduce career-related stress, and empower individuals to take control of their future.
                              </p>
                          </div>
                      </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-12 pt-12 border-t border-border/50">
                      <div>
                          <h3 className="font-bold text-foreground mb-4">Our Tools</h3>
                          <ul className="space-y-2 text-muted-foreground mt-1">
                              <li><Link href="/aitools" className="hover:text-primary hover:underline">AI Tools & Optimization</Link></li>
                              <li><Link href="/career-mentors" className="hover:text-primary hover:underline">Mentors & Counselors</Link></li>
                              <li><Link href="/become-mentor" className="hover:text-primary hover:underline">Become a Mentor</Link></li>
                              <li><Link href="/resumebuilder" className="hover:text-primary hover:underline">AI Resume Optimizer</Link></li>
                          </ul>
                      </div>
                      <div>
                          <h3 className="font-bold text-foreground mb-4">Policies & Compliance</h3>
                          <ul className="space-y-2 text-muted-foreground mt-1">
                              <li><Link href="/privacy-policy" className="hover:text-primary hover:underline">Privacy Policy</Link></li>
                              <li><Link href="/terms-conditions" className="hover:text-primary hover:underline">Terms & Conditions</Link></li>
                              <li><Link href="/cancellation-refund" className="hover:text-primary hover:underline">Cancellation & Refund</Link></li>
                          </ul>
                      </div>
                      <div>
                          <h3 className="font-bold text-foreground mb-4">Support & Contact</h3>
                          <div className="space-y-3 text-muted-foreground mt-1">
                              <div className="flex items-center gap-3">
                                  <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                                  <a href="mailto:support@aicouncel.com" className="hover:text-primary hover:underline">
                                      support@aicouncel.com
                                  </a>
                              </div>
                              <p className="text-xs mt-4">
                                  Our vision is to help people discover their true potential and secure the best opportunities to grow and succeed with confidence. We create AI products that make careers smarter and opportunities more accessible.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-border/50">
                  <p className="text-xs text-muted-foreground text-center sm:text-left">
                      © 2024 AI Councel Lab. All rights reserved. Registered in India.
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
