
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <Ticket className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Our Pricing</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Simple and transparent. Choose the plan that's right for you.
            <br />
            (Detailed plans coming soon!)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border rounded-lg bg-card-foreground/5">
             <h3 className="text-2xl font-semibold text-primary mb-2">Comprehensive Career Report</h3>
             <p className="text-4xl font-bold mb-4">₹99 <span className="text-sm font-normal text-muted-foreground">/ one-time</span></p>
             <ul className="space-y-2 text-muted-foreground text-sm list-disc list-inside text-left ml-4">
                <li>Personalized Psychometric Analysis</li>
                <li>AI-Powered Career Suggestions</li>
                <li>Astrological & Numerological Insights</li>
                <li>Detailed 5-Year Career Roadmap</li>
                <li>Education & Skill Guidance</li>
                <li>20-Year Future Outlook</li>
                <li>Downloadable PDF Report</li>
             </ul>
          </div>
          <p className="text-muted-foreground text-sm">
            Currently, we offer a comprehensive career guidance package. More plans might be available in the future.
          </p>
           <Link href="/signup" passHref>
            <Button size="lg" className="w-full max-w-xs mx-auto text-lg py-6">
              Get Started
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
