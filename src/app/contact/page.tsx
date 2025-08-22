
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MessageSquare } from 'lucide-react';


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
                <MessageSquare className="h-5 w-5 text-muted-foreground"/>
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
