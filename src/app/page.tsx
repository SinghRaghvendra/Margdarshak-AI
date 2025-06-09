
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Lightbulb, MapPinned, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function HomePage() {
  const features = [
    {
      icon: <ClipboardList className="h-10 w-10 text-primary mb-4" />,
      title: 'Personalized Psychometric Testing',
      description: 'Understand your unique strengths, traits, and work style with our comprehensive psychometric assessments.',
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-primary mb-4" />,
      title: 'AI-Powered Career Suggestions',
      description: 'Receive intelligent career recommendations tailored to your profile, interests, and astrological insights.',
    },
    {
      icon: <MapPinned className="h-10 w-10 text-primary mb-4" />,
      title: 'Detailed 5-Year Roadmaps',
      description: 'Get a step-by-step plan for your chosen career, including skills, courses, and salary expectations.',
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 flex items-center justify-center text-center bg-gradient-to-br from-background to-secondary/30">
        <div className="absolute inset-0">
          <Image
            src="https://placehold.co/1920x800.png"
            alt="Abstract background image for hero section"
            fill
            className="opacity-20 object-cover"
            data-ai-hint="abstract background"
            priority
          />
           <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Unlock Your Future: <br className="hidden sm:block" />Find Your Dream Career Today
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Margdarshak AI combines psychometrics, personalized insights, and AI to guide you on your unique career path towards fulfillment and success.
          </p>
          <Link href="/signup" passHref>
            <Button size="lg" className="text-lg py-7 px-10 shadow-lg">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why Choose Margdarshak AI?</h2>
            <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
              We provide a holistic approach to career guidance, leveraging technology and personalized data.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
                <CardHeader className="items-center text-center">
                  {feature.icon}
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Discover Your Path?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Take the first step towards a career that aligns with your true potential.
          </p>
          <Link href="/signup" passHref>
            <Button size="lg" className="text-lg py-7 px-10 shadow-lg">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
