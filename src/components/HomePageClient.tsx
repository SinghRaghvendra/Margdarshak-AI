'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle, CheckCircle, ArrowRight, Brain, Target, MapPinned, Workflow, Search, Group, Cpu, Milestone, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { testimonials } from '@/lib/testimonials';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import SignupPopup from './SignupPopup';


export default function HomePageClient() {
  const router = useRouter();
  const auth = useAuth();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for the popup

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Effect to trigger the popup
  useEffect(() => {
    // Only run this effect on the client
    if (typeof window !== 'undefined') {
        // Check if the popup has been shown in this session
        const popupShown = sessionStorage.getItem('margdarshak_popup_shown');
        
        // If there is no user and the popup hasn't been shown
        if (!user && !popupShown) {
            const timer = setTimeout(() => {
                setIsPopupOpen(true);
                // Mark that the popup has been shown for this session
                sessionStorage.setItem('margdarshak_popup_shown', 'true');
            }, 3000); // 3 seconds

            return () => clearTimeout(timer); // Cleanup the timer
        }
    }
  }, [user]); // Rerun when user state changes

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
      icon: <Target className="h-8 w-8 text-primary mb-4" />,
      title: 'AI-Powered Career Matching',
      description: 'Receive a data-driven list of your top 3 career matches, complete with a "fit score".',
       className: 'md:col-span-1',
       href: careerGuidanceHref,
       cta: 'See Your Matches'
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

  const problemsAndSolutions = [
      {
        icon: <Search className="h-8 w-8 text-primary" />,
        painPoint: 'Overwhelmed by countless options?',
        solutionPoints: [
            'AI matching narrows thousands of careers to your top 3.',
            'Analyzes your personality, interests & motivations.',
            'Replaces confusion with a clear, ranked list.'
        ]
      },
       {
        icon: <Group className="h-8 w-8 text-primary" />,
        painPoint: 'Relying on biased, unsolicited advice?',
        solutionPoints: [
            'Get objective, data-driven suggestions.',
            'Based on your unique profile, not popular opinion.',
            'Make choices with confidence, backed by science.'
        ]
      },
      {
        icon: <Cpu className="h-8 w-8 text-primary" />,
        painPoint: 'Unsure how skills translate to a real job?',
        solutionPoints: [
           'Maps your specific traits to real-world roles.',
           'Identifies "adjacent skills" for career pivots.',
           'Shows you where you already have an advantage.'
        ]
      },
      {
        icon: <Milestone className="h-8 w-8 text-primary" />,
        painPoint: 'Lacking a clear, long-term direction?',
        solutionPoints: [
            'Receive a step-by-step 10-year career roadmap.',
            'Outlines skills to learn and salary expectations.',
            'Turns your career into a manageable project plan.'
        ]
      },
  ];

  const homeFaqs = [
      {
          question: 'Which career is best for me?',
          answer: "Choosing the best career depends on your skills, interests, and personality. Instead of guessing, an AI-based career assessment analyzes these factors to recommend careers that match your profile.",
      },
      {
          question: 'What career suits my personality?',
          answer: "Personality plays a major role in career satisfaction. Career tests evaluate traits like introversion, creativity, and problem-solving style to suggest suitable career paths.",
      },
      {
          question: 'Are career tests accurate?',
          answer: "Career tests are accurate when they analyze multiple factors like skills, interests, and behavior patterns. AI-powered career assessments improve accuracy by learning from large datasets and real career outcomes.",
      },
      {
          question: 'Can AI help me choose a career?',
          answer: "Yes. AI helps eliminate bias and guesswork by matching your profile with career paths that have historically led to success for similar individuals.",
      }
  ];

  const blogPosts = [
    {
      title: 'Which Career Is Best for Students?',
      excerpt: 'Struggling with career confusion as a student? Learn how to find a path that aligns with your skills, interests, and personality using data-driven insights.',
      href: '/blog/which-career-is-best-for-students',
    },
    {
      title: 'Best Career Move for Professionals Feeling Stuck?',
      excerpt: 'The best career move is not quitting blindly—it’s making a strategic, informed transition. Here\'s how to find your next step with confidence.',
      href: '/blog/best-career-move-for-working-professionals',
    },
    {
      title: 'Best Career Options for 2026',
      excerpt: "The job market is changing fast. To succeed in 2026 and beyond, choosing a future-proof career is essential. Discover top options here.",
      href: '/blog/best-career-options-for-2026',
    },
  ];
  
  const heroBackgroundImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop";

  return (
    <div>
      {/* Render the popup */}
      <SignupPopup isOpen={isPopupOpen} onOpenChange={setIsPopupOpen} />
      
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-24 md:py-40 text-center text-white overflow-hidden"
        style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative z-10 container mx-auto px-4">
              <div className="mb-6">
                <Logo />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
                  AI-Powered Career Guidance
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Stop Guessing. Start Planning. Get a data-driven, personalized 10-year career roadmap. Our AI analyzes your unique strengths to find the path you're built for.
              </p>
              <Link href={careerGuidanceHref}>
                  <Button size="lg" className="text-lg py-7 px-10 shadow-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90" suppressHydrationWarning={true}>
                      Start Your Free Assessment <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
              </Link>
          </div>
      </section>

      {/* Page Content */}
      <div id="page-content" className="relative z-10 bg-background">
        
        {/* Features Bento Grid Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Your Career Clarity Toolkit</h2>
              <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
                From self-discovery to job application, our AI-powered tools guide you at every step.
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

        {/* Pain Points Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Feeling Lost? You're Not Alone.</h2>
              <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                The modern job market is confusing. AI COUNCEL replaces that confusion with a clear, data-driven action plan so you can move forward with confidence.
              </p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {problemsAndSolutions.map((item, index) => (
                <Card key={index} className="bg-card shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                    {item.icon}
                    <CardTitle className="text-lg font-semibold">{item.painPoint}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {item.solutionPoints.map((solution, i) => (
                            <li key={i} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{solution}</span>
                            </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
             <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={careerGuidanceHref}>
                    <Button size="lg" className="text-lg py-6 px-8 shadow-md font-bold" suppressHydrationWarning>
                        Start Career Quiz Now
                    </Button>
                </Link>
                <Link href="/pricing">
                    <Button size="lg" variant="outline" className="text-lg py-6 px-8 shadow-md">
                        View Pricing
                    </Button>
                </Link>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">What People Are Saying</h2>
              <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
                Real stories from students, parents, and professionals who found clarity with us.
              </p>
            </div>
            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={[ Autoplay({ delay: 4000, stopOnInteraction: true })]}
              className="w-full max-w-4xl mx-auto"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="flex flex-col h-full justify-between bg-card">
                        <CardContent className="pt-6">
                          <p className="text-sm md:text-base text-muted-foreground italic">"{testimonial.quote}"</p>
                        </CardContent>
                        <CardHeader>
                          <CardTitle className="text-base font-bold">{testimonial.name}</CardTitle>
                          <CardDescription className="text-sm">{testimonial.role}</CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">From Our Blog</h2>
              <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
                Explore our latest articles for insights and guidance on your career journey.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl leading-snug">
                      <Link href={post.href} className="hover:text-primary transition-colors">{post.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardContent>
                    <Link href={post.href}>
                      <Button variant="link" className="p-0">Read More <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/blog">
                <Button variant="outline" size="lg">
                  View All Articles
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
                    <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
                        Quick answers to your most pressing career questions.
                    </p>
                </div>
                <div className="max-w-3xl mx-auto">
                    <Accordion type="single" collapsible className="w-full space-y-3">
                        {homeFaqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <Card className="bg-card/50 hover:bg-card transition-shadow shadow-sm hover:shadow-md">
                                    <AccordionTrigger className="text-lg font-semibold text-left px-6 py-4 hover:no-underline">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-4 text-base text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <div className="text-center mt-12">
                  <Link href="/career-faqs" passHref>
                    <Button variant="outline">
                      View All FAQs <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
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
              <Button size="lg" className="text-lg py-7 px-10 shadow-lg font-bold" suppressHydrationWarning={true}>
                {isLoggedIn ? "Continue Your Journey" : "Start Your Free Assessment"}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
