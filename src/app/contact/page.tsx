
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

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
        <CardContent className="space-y-4">
          <p className="text-md">
            For any inquiries, please reach out to us at:
          </p>
          <p className="text-xl font-semibold text-primary">
            support@aicouncellab.com
          </p>
          <p className="text-sm text-muted-foreground">
            Our team will get back to you as soon as possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
