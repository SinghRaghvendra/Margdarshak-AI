
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle, CheckCircle, ArrowRight, Brain, Target, MapPinned, Workflow, Search, Group, Cpu, Milestone, BookOpen, UserCheck, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { testimonials } from '@/lib/testimonials';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import SignupPopup from './SignupPopup';
import MentorCarousel from './mentors/MentorCarousel';
import placeholderImages from '@/app/lib/placeholder-images.json';


export default function HomePageClient() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (typeof window !== 'undefined') {
        const popupShown = sessionStorage.getItem('margdarshak_popup_shown');
        if (!user && !popupShown) {
            const timer = setTimeout(() => {
                setIsPopupOpen(true);
                sessionStorage.setItem('margdarshak_popup_shown', 'true');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }
  }, [user, userLoading]);

  const isLoggedIn = !!user;
  const careerGuidanceHref = isLoggedIn ? "/welcome-guest" : "/signup";
  
  const bentoFeatures = [
    {
      icon: <Brain className="h-8 w-8 text-primary mb-4" />,
      title: 'Deep Psychometric Analysis',
      description: 'Go beyond simple quizzes. Our assessment analyzes your core personality, motivations, and cognitive style.',
      className: 'md:col-span-2',
      href: careerGuidanceHref,
      cta: 'Start Your Assessment'
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary mb-4" />,
      title: 'Expert Mentorship',
      description: 'Book one-on-one sessions with industry veterans to get real-world advice and networking tips.',
       className: 'md:col-span-1',
       href: '/career-mentors',
       cta: 'Find a Mentor'
    },
    {
      icon: <MapPinned className="h-8 w-8 text-primary mb-4" />,
      title: '10-Year Career Blueprint',
      description: 'Get a step-by-step roadmap for your top career choice, including skills to learn and salary projections.',
       className: 'md:col-span-1',
       href: careerGuidanceHref,
       cta: 'View Your Roadmap'
    },
    {
      icon: <Workflow className="h-8 w-8 text-primary mb-4" />,
      title: 'ATS-Optimized Resume Builder',
      description: 'Tailor your resume for any job description in seconds to beat the bots and land more interviews.',
      className: 'md:col-span-2',
      href: '/resumebuilder',
      cta: 'Optimize Your Resume'
    },
  ];

  const heroBackgroundImage = placeholderImages.hero[0].url;

  return (
    <div>
      <SignupPopup isOpen={isPopupOpen} onOpenChange={setIsPopupOpen} />
      
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-20 md:py-28 text-center text-white overflow-hidden"
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative z-10 container mx-auto px-4">
              <div className="mb-4 flex justify-center">
                <div className="bg-white/90 rounded-full p-3 shadow-lg">
                    <Image src="/logo.png" alt="AI Councel Logo" width={128} height={128} priority data-ai-hint="logo icon" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                  AI Guidance + Human Wisdom
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Map your future with our AI discovery tool, then validate it with industry-leading mentors. The complete career clarity platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={careerGuidanceHref}>
                    <Button size="lg" className="text-lg py-6 px-8 shadow-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                        Start Free Assessment <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
                <Link href="/career-mentors">
                    <Button size="lg" variant="outline" className="text-lg py-6 px-8 border-white text-white hover:bg-white/10 font-bold">
                        Talk to a Mentor <MessageCircle className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
              </div>
          </div>
      </section>

      <div id="page-content" className="relative z-10 bg-background">
        
        {/* Features Bento Grid Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Your Career Clarity Toolkit</h2>
              <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
                From self-discovery to expert guidance and job application.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {bentoFeatures.map((feature) => (
                <Link href={feature.href} key={feature.title} className={cn('block group', feature.className)}>
                  <Card className="p-6 h-full flex flex-col justify-between bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div>
                      {feature.icon}
                      <h3 className="text-xl font-bold mt-2">{feature.title}</h3>
                      <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
                    </div>
                    <div className="mt-4">
                      <div className="font-semibold text-primary group-hover:underline flex items-center">
                        {feature.cta} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mentor Carousel Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 text-center mb-12">
            <UserCheck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold">Meet Our Top Mentors</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Industry veterans ready to help you navigate your professional journey.
            </p>
          </div>
          <MentorCarousel />
          <div className="text-center mt-12">
            <Link href="/career-mentors">
              <Button size="lg" variant="outline">
                View All Mentors <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Are you an industry expert?</h2>
            <p className="text-xl mb-8 max-w-xl mx-auto opacity-90">
              Join our panel of elite mentors and help shape the careers of thousands of ambitious students.
            </p>
            <Link href="/become-mentor">
              <Button size="lg" variant="secondary" className="text-lg py-7 px-10 shadow-lg font-bold">
                Apply to Become a Mentor
              </Button>
            </Link>
          </div>
        </section>
        
        {/* Rest of homepage contents... */}
        <section id="faq" className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
                </div>
                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        <AccordionItem value="item-1">
                            <Card className="bg-card/50 hover:bg-card transition-shadow shadow-sm hover:shadow-md">
                                <AccordionTrigger className="text-lg font-semibold text-left px-6 py-4 hover:no-underline">
                                    How does the mentorship package work?
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4 text-base text-muted-foreground">
                                    You can purchase a "Mentorship Starter Pack" for ₹999 which includes 3 one-on-one video calls (25 mins each). You can choose your preferred mentor and schedule sessions based on their availability.
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <Card className="bg-card/50 hover:bg-card transition-shadow shadow-sm hover:shadow-md">
                                <AccordionTrigger className="text-lg font-semibold text-left px-6 py-4 hover:no-underline">
                                    Will I get a recording of my session?
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4 text-base text-muted-foreground">
                                    Yes! All sessions are recorded and automatically transcribed. You will receive meeting minutes and a summary in your "My Reports" dashboard.
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
