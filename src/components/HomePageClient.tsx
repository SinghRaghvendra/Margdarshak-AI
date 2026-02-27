'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle, CheckCircle, ArrowRight, Brain, Target, MapPinned, Workflow, Search, Group, Cpu, Milestone, BookOpen, UserCheck, MessageCircle, Info, TrendingUp, Sparkles } from 'lucide-react';
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
      title: 'Expert Mentorship & Counseling',
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
                    <LogoIcon />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                  AI Guidance + Human Wisdom
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Map your future with our AI discovery tool, then validate it with industry-leading mentors and counselors. The complete career clarity platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={careerGuidanceHref}>
                    <Button size="lg" className="text-lg py-6 px-8 shadow-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                        Start Free Assessment <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
                <Link href="/career-mentors">
                    <Button size="lg" variant="outline" className="text-lg py-6 px-8 border-white text-white bg-transparent hover:bg-white/10 font-bold">
                        Talk to a Mentor <MessageCircle className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
              </div>
          </div>
      </section>

      <div id="page-content" className="relative z-10 bg-background">
        
        {/* Feeling Lost Section */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Feeling Lost? You're Not Alone.</h2>
                    <p className="text-xl text-muted-foreground">
                        The modern job market is confusing. AI COUNCEL replaces that confusion with a clear, data-driven action plan so you can move forward with confidence.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="bg-primary/10 p-3 rounded-xl h-fit">
                                <Search className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Overwhelmed by countless options?</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> AI matching narrows thousands of careers to your top 3.</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Analyzes your personality, interests & motivations.</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Replaces confusion with a clear, ranked list.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-primary/10 p-3 rounded-xl h-fit">
                                <Info className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Relying on biased, unsolicited advice?</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Get objective, data-driven suggestions.</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Based on your unique profile, not popular opinion.</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Make choices with confidence, backed by science.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="bg-primary/10 p-3 rounded-xl h-fit">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Unsure how skills translate to a real job?</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Maps your specific traits to real-world roles.</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Identifies "adjacent skills" for career pivots.</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Shows you where you already have an advantage.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-primary/10 p-3 rounded-xl h-fit">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Lacking a clear, long-term direction?</h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Receive a step-by-step 10-year career roadmap.</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Outlines skills to learn and salary expectations.</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Turns your career into a manageable project plan.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 text-center flex flex-col sm:flex-row justify-center gap-4">
                    <Link href={careerGuidanceHref}>
                        <Button size="lg" className="px-10 py-7 text-lg font-bold">Start Career Quiz Now</Button>
                    </Link>
                    <Link href="/pricing">
                        <Button size="lg" variant="outline" className="px-10 py-7 text-lg font-bold">View Pricing</Button>
                    </Link>
                </div>
            </div>
        </section>

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
            <h2 className="text-3xl md:text-4xl font-bold">Meet Our Mentors & Counselors</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Industry veterans and certified counselors ready to help you navigate your professional journey.
            </p>
          </div>
          <MentorCarousel />
          <div className="text-center mt-12">
            <Link href="/career-mentors">
              <Button size="lg" variant="outline">
                View All Mentors & Counselors <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-bold">What People Are Saying</h2>
                    <p className="text-lg text-muted-foreground mt-2">Real stories from students, parents, and professionals who found clarity with us.</p>
                </div>
                <Carousel 
                    opts={{ align: "start", loop: true }}
                    plugins={[Autoplay({ delay: 4000 })]}
                    className="w-full max-w-5xl mx-auto"
                >
                    <CarouselContent className="-ml-4">
                        {testimonials.map((t, idx) => (
                            <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full shadow-md">
                                    <CardContent className="pt-6">
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => <span key={i} className="text-primary text-sm">★</span>)}
                                        </div>
                                        <p className="italic text-muted-foreground mb-6">"{t.quote}"</p>
                                        <div>
                                            <p className="font-bold">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">{t.role}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious className="-left-12" />
                        <CarouselNext className="-right-12" />
                    </div>
                </Carousel>
            </div>
        </section>

        {/* Blog Preview Section */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div className="text-left">
                        <BookOpen className="h-12 w-12 text-primary mb-4" />
                        <h2 className="text-3xl md:text-4xl font-bold">From Our Blog</h2>
                        <p className="text-lg text-muted-foreground mt-2">Explore our latest articles for insights and guidance on your career journey.</p>
                    </div>
                    <Link href="/blog">
                        <Button variant="outline">View All Articles <ArrowRight className="ml-2 h-4 w-4"/></Button>
                    </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <BlogSummaryCard 
                        title="Which Career Is Best for Students?" 
                        excerpt="Struggling with career confusion as a student? Learn how to find a path that aligns with your skills, interests, and personality using data-driven insights."
                        href="/blog/which-career-is-best-for-students"
                    />
                    <BlogSummaryCard 
                        title="Best Career Move for Professionals Feeling Stuck?" 
                        excerpt="The best career move is not quitting blindly—it’s making a strategic, informed transition. Here's how to find your next step with confidence."
                        href="/blog/best-career-move-for-working-professionals"
                    />
                    <BlogSummaryCard 
                        title="Best Career Options for 2026" 
                        excerpt="The job market is changing fast. To succeed in 2026 and beyond, choosing a future-proof career is essential. Discover top options here."
                        href="/blog/best-career-options-for-2026"
                    />
                </div>
            </div>
        </section>

        {/* FAQ Section */}
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
                                    You can purchase a "Mentorship Starter Pack" for ₹999 which includes 3 one-on-one video calls (25 mins each). You can choose your preferred mentor or counselor and schedule sessions based on their availability.
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
                        <AccordionItem value="item-3">
                            <Card className="bg-card/50 hover:bg-card transition-shadow shadow-sm hover:shadow-md">
                                <AccordionTrigger className="text-lg font-semibold text-left px-6 py-4 hover:no-underline">
                                    Which career is best for me?
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4 text-base text-muted-foreground">
                                    The "best" career is the one that aligns with your natural traits, skills, and the evolving job market. Our AI analysis identifies this intersection for you.
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    </Accordion>
                    <div className="mt-8 text-center">
                        <Link href="/career-faqs">
                            <Button variant="link" className="text-primary font-bold">View All FAQs <ArrowRight className="ml-2 h-4 w-4"/></Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground text-center">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Take Control of Your Career?</h2>
                <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                    Take the first step towards a career that aligns with your true potential and secures your future.
                </p>
                <Link href={careerGuidanceHref}>
                    <Button size="lg" variant="secondary" className="px-12 py-8 text-xl font-bold shadow-2xl hover:scale-105 transition-transform">
                        Start Your Free Assessment
                    </Button>
                </Link>
            </div>
        </section>
      </div>
    </div>
  );
}

function LogoIcon() {
    return (
        <div className="text-primary text-4xl font-extrabold flex items-center justify-center">
            <span>AIC</span>
        </div>
    )
}

function BlogSummaryCard({ title, excerpt, href }: { title: string, excerpt: string, href: string }) {
    return (
        <Card className="flex flex-col h-full hover:shadow-xl transition-shadow group">
            <CardHeader>
                <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm line-clamp-3">{excerpt}</p>
            </CardContent>
            <div className="p-6 pt-0">
                <Link href={href}>
                    <Button variant="link" className="p-0 h-auto font-bold">Read More <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </Link>
            </div>
        </Card>
    )
}
