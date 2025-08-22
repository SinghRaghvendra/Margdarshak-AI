
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Lightbulb, MapPinned, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function HomePage() {
  const features = [
    {
      icon: <ClipboardList className="h-10 w-10 text-primary mb-4" />,
      title: 'Personalized Career Guidance',
      description: 'Uncover your innate strengths and ideal work style through our insightful psychometric assessment, then receive a comprehensive 10-year career roadmap.',
      href: "/signup",
      cta: "Start Your Career Journey",
    },
    {
      icon: <MapPinned className="h-10 w-10 text-primary mb-4" />,
      title: 'Comprehensive Career Blueprints',
      description: 'Receive an in-depth 10-year roadmap for your chosen careers, including localized salary insights, educational guidance, skill development strategies, and a 20-year future outlook.',
    },
  ];

  const painPoints = [
      { point: "Overwhelmed by countless career options with no clear direction." },
      { point: "Anxious about making a wrong choice that will impact your future." },
      { point: "Unsure how your skills and interests translate into a real-world job." },
      { point: "Lacking a concrete plan to achieve your long-term career goals." },
      { point: "Feeling stuck or unfulfilled in your current academic or career path." },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 flex items-center justify-center text-center bg-gradient-to-br from-background to-secondary/30">
        <div className="absolute inset-0">
          <Image
            src="https://placehold.co/1920x800.png"
            alt="Generic hero image representing career journey"
            fill
            className="opacity-20 object-cover"
            data-ai-hint="career journey"
            priority
          />
           <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Unlock Your Future with Margdarshak AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Get a data-driven career roadmap or instantly tailor your resume for any job application. Your professional journey, guided by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" passHref>
              <Button size="lg" className="text-lg py-7 px-10 shadow-lg">
                <User className="mr-2 h-5 w-5" /> Get Career Guidance
              </Button>
            </Link>
             <Link href="/resume-tailor" passHref>
              <Button size="lg" variant="secondary" className="text-lg py-7 px-10 shadow-lg">
                <Wand2 className="mr-2 h-5 w-5" /> Use Free Resume Tailor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">A Dual Approach to Career Success</h2>
            <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
              We provide a holistic, data-driven approach to career guidance, leveraging technology and personalized data.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
                <CardHeader className="items-center text-center">
                  {feature.icon}
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex-grow">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
                <CardContent>
                    <Link href={feature.href} passHref>
                        <Button className="w-full">
                           {feature.cta} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
       <section id="pain-points" className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
           <div className="text-center mb-12 md:mb-16">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Feeling Lost? You're Not Alone.</h2>
            <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
              Choosing a career path is one of life's biggest decisions, and it's normal to feel uncertain. Do any of these sound familiar?
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-6">
            {painPoints.map((item, index) => (
                <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-foreground/80">{item.point}</p>
                </div>
            ))}
          </div>
           <div className="text-center mt-12">
             <p className="text-lg text-foreground max-w-3xl mx-auto">
                Delaying clarity can lead to years of dissatisfaction and missed opportunities. <span className="font-semibold text-primary">Margdarshak AI</span> replaces confusion with a data-driven, personalized action plan, so you can move forward with confidence and purpose as soon as possible.
             </p>
           </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Take Control of Your Career?</h2>
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
