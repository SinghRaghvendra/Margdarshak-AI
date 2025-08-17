
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WelcomeGuestPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg mx-auto shadow-xl text-center">
        <CardHeader>
          <Gift className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Welcome to AI Councel!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            We're excited to help you on your personalized career discovery journey.
            Click the button below to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/signup" passHref>
            <Button className="w-full max-w-xs mx-auto text-lg py-6">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
