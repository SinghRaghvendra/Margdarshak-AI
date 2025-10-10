
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList, Lightbulb, MapPinned, ArrowRight, HelpCircle, CheckCircle, Wand2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Logo from '@/components/Logo';


export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / (width / 2);
    const y = (clientY - top - height / 2) / (height / 2);
    setRotation({ x: -y * 10, y: x * 10 }); // Multiplier adjusts sensitivity
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
      setIsHovered(true);
  }


  const isLoggedIn = !!user;
  const careerGuidanceHref = isLoggedIn ? "/welcome-guest" : "/signup";


  const features = [
    {
      icon: <ClipboardList className="h-10 w-10 text-primary mb-4" />,
      title: 'Personalized Career Guidance',
      description: 'Uncover your innate strengths and ideal work style through our insightful psychometric assessment, then receive a comprehensive 10-year career roadmap.',
      href: careerGuidanceHref,
      cta: isLoggedIn ? "Continue Your Journey" : "Start Your Career Journey",
      isExternal: false,
    },
  ];

  const painPoints = [
      { point: "Overwhelmed by countless career options with no clear direction." },
      { point: "Anxious about making a wrong choice that will impact your future." },
      { point: "Unsure how your skills and interests translate into a real-world job." },
      { point: "Lacking a concrete plan to achieve your long-term career goals." },
      { point: "Getting rejected by automated systems before a human sees your resume." },
  ];


  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)]">
      {/* Hero Section */}
      <section
        className="relative pt-10 pb-20 md:pt-16 md:pb-32 flex flex-col items-center justify-center text-center bg-gradient-to-br from-background to-secondary/30 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-0"></div>

        <div
          className={`relative w-[250px] h-[250px] mb-8 flex items-center justify-center [transform-style:preserve-3d] transition-transform duration-300 ${isHovered ? 'energized' : ''}`}
          style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
        >
          {/* Base Pulsating Waves */}
          <div className="pulsing-waves"></div>

          {/* Explosion waves on hover */}
          {isHovered && (
             <div className="explosion-container">
                {[...Array(11)].map((_, i) => (
                    <div key={i} className="explosion-wave" style={{ animationDelay: `${i * 0.05}s` }}></div>
                ))}
             </div>
          )}


          {/* Atomic Orbits */}
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          <div className="orbit orbit-3"></div>

          {/* Logo */}
          <div
              className={`absolute logo-container ${isHovered ? 'logo-popped' : ''}`}
          >
              <Image
                src="/logo.png"
                alt="AI Councel Lab Logo"
                width={150}
                height={150}
                priority
              />
          </div>
        </div>

        {/* Text and CTA content, raised above the animation */}
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Unlock Your Future with AI Councel
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Get a data-driven career roadmap to guide your professional journey with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={careerGuidanceHref}>
              <Button size="lg" className="text-lg py-7 px-10 shadow-lg" suppressHydrationWarning={true}>
                <User className="mr-2 h-5 w-5" /> {isLoggedIn ? "Continue Journey" : "Get Career Guidance"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Navigate Your Career with AI-Powered Guidance</h2>
            <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
             Our tools are designed to provide clear, data-driven insights into your professional life. Let AI illuminate your path to a fulfilling career.
            </p>
          </div>
          <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
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
                    <Link href={feature.href} target={feature.isExternal ? '_blank' : '_self'} rel={feature.isExternal ? 'noopener noreferrer' : ''}>
                          <Button className="w-full" suppressHydrationWarning={true}>
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
              The modern job market is confusing. Do any of these sound familiar?
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
                <span className="font-semibold text-primary">AI Councel</span> replaces confusion with data-driven, personalized action plans, so you can move forward with confidence and purpose.
             </p>
           </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Ready to Take Control of Your Career?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Take the first step towards a career that aligns with your true potential.
          </p>
          <Link href={careerGuidanceHref}>
            <Button size="lg" className="text-lg py-7 px-10 shadow-lg" suppressHydrationWarning={true}>
              {isLoggedIn ? "Continue Your Journey" : "Get Started Now"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
