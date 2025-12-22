'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, ArrowRight, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const plans = [
    {
        id: 'verdict',
        title: 'Career Verdict',
        price: 99,
        description: 'Get your single best career match and a concise explanation of why it fits you.',
        features: [
            'Top Career Recommendation',
            'Personalized Match Score',
            'Concise Career Fit Assessment (2-3 paragraphs)',
            'Personality Alignment Summary'
        ],
        cta: 'Get Your Verdict',
    },
    {
        id: 'clarity',
        title: 'Career Clarity Report',
        price: 199,
        isPopular: true,
        description: 'Understand your options with a deep dive into your top 3 matches and personality.',
        features: [
            'Everything in Career Verdict',
            'Top 3 Career Recommendations',
            'In-depth Personality & Strengths Analysis',
            'Astrological & Numerological Insights',
            'General Career Demand Outlook'
        ],
        cta: 'Get Clarity Report',
    },
    {
        id: 'blueprint',
        title: 'Complete Career Blueprint',
        price: 399,
        description: 'The ultimate guide. A full 10-year, step-by-step plan to achieve your top career choice.',
        features: [
            'Everything in Career Clarity Report',
            'Detailed 10-Year Career Roadmap',
            'Year-by-Year Role & Salary Progression',
            'Specific Education & Skills Path',
            '20-Year Future Trends & Outlook'
        ],
        cta: 'Get Full Blueprint',
    }
];

export default function PricingPage() {
  return (
    <div className="py-12">
      <Card className="w-full max-w-5xl mx-auto text-center shadow-none border-none">
        <CardHeader>
          <Ticket className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">Simple, Transparent Pricing</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Choose the plan that's right for your career journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 ${plan.isPopular ? 'border-primary ring-2 ring-primary' : ''}`}
                >
                    {plan.isPopular && <div className="bg-primary text-primary-foreground text-sm font-bold text-center py-1 rounded-t-lg flex items-center justify-center"><Star className="h-4 w-4 mr-1"/> Most Popular</div>}
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="flex items-baseline justify-center gap-2 mt-4">
                            <span className="text-4xl font-extrabold">₹{plan.price}</span>
                            <span className="text-sm font-medium text-muted-foreground">/ one-time</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-3 text-left">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardContent>
                        <Link href="/signup" passHref>
                            <Button 
                                className="w-full text-lg py-6"
                                variant={plan.isPopular ? 'default' : 'outline'}
                            >
                              Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
              ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
