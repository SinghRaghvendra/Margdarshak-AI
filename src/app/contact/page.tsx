
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      <path d="M14.05 16.95A8.91 8.91 0 0 1 12.03 16a1 1 0 0 1-.4-1.54l1.53-2.52a1 1 0 0 0-.44-1.34l-2.5-1.52a1 1 0 0 1-.5-1.78l1.37-1.37a1 1 0 0 0 0-1.41l-1.37-1.37a1 1 0 0 1-1.78-.5l-1.52-2.5a1 1 0 0 0-1.34-.44l-2.52 1.53a1 1 0 0 1-1.54-.4A8.91 8.91 0 0 1 7.05 5.97M18 2a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4v0a4 4 0 0 0 4-4v0a4 4 0 0 0-4-4Z"></path>
    </svg>
);


export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Have questions or need support? We're here to help.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-2">
              <p className="text-md font-medium flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground"/>
                Email Support
              </p>
              <a href="mailto:hello@aicouncel.com" className="text-xl font-semibold text-primary hover:underline">
                hello@aicouncel.com
              </a>
          </div>
           <div className="flex flex-col items-center gap-2">
              <p className="text-md font-medium flex items-center gap-2">
                <WhatsAppIcon className="h-5 w-5 text-muted-foreground"/>
                WhatsApp Support
              </p>
              <a href="https://wa.me/918130670022" target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-primary hover:underline">
                +91-8130670022
              </a>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Our team will get back to you as soon as possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
