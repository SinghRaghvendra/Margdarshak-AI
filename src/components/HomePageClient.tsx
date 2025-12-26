
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardList, Lightbulb, MapPinned, ArrowRight, HelpCircle, CheckCircle, Wand2, User, Sparkles as NewJourneyIcon, BookOpen, Search, AlertTriangle, Cpu, Milestone, TrendingUp, Group, XCircle, Users, BarChart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import Logo from '@/components/Logo';
import { useAuth } from '@/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HomePageClient() {
  const router = useRouter();
  const auth = useAuth();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

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

  const handleStartNewJourney = () => {
    // Clear all localStorage items related to the journey
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_') && key !== 'margdarshak_user_info') {
            localStorage.removeItem(key);
        }
    });
    // Redirect to the beginning of the journey for a logged-in user
    router.push('/birth-details');
  };


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
      {
        icon: <AlertTriangle className="h-8 w-8 text-primary" />,
        painPoint: 'Afraid of making the wrong choice?',
        solutionPoints: [
            'Future-path analysis shows long-term career outlook.',
            'Highlights potential challenges and opportunities.',
            'Reduces risk by making informed decisions upfront.'
        ]
      },
      {
        icon: <TrendingUp className="h-8 w-8 text-primary" />,
        painPoint: 'Worried if a career is future-proof?',
        solutionPoints: [
            'Analyzes market trends and demand signals.',
            'Prioritizes roles with strong long-term growth.',
            'Helps you invest time in skills that will last.'
        ]
      },
  ];

  const researchPoints = [
    {
      icon: <XCircle className="h-10 w-10 text-primary mb-3" />,
      title: 'The Awareness Gap',
      description: 'A staggering 93% of Indian students know about only seven career options, while hundreds of high-growth fields remain hidden.'
    },
    {
      icon: <Users className="h-10 w-10 text-primary mb-3" />,
      title: 'The Guidance Gap',
      description: 'With less than 10,000 trained counsellors for over 400 million students and professionals, getting personalized, unbiased advice is nearly impossible.'
    },
    {
      icon: <BarChart className="h-10 w-10 text-primary mb-3" />,
      title: 'The Skill Gap',
      description: 'The half-life of a professional skill has dropped to just a few years. What was valuable yesterday may be obsolete tomorrow, making the right guidance more critical than ever.'
    }
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

  const careerQuestions = [
      "Which career is best for me?",
      "How to choose the right career in 2025",
      "What career suits my personality?",
      "Are career tests accurate?",
      "Can AI help me choose a career?",
      "How does career matching work?",
      "Career options after graduation",
      "How to find the right career path",
      "Career guidance for students",
      "Career advice for working professionals",
      "AI vs human career counseling"
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


  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative isolate z-0 pt-10 pb-20 md:pt-16 md:pb-32 flex flex-col items-center justify-center text-center bg-gradient-to-br from-background to-secondary/30 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-background/50"
        ></div>

        <div
          className={`relative w-[250px] h-[250px] mb-8 flex items-center justify-center transition-transform duration-300 ${isHovered ? 'energized' : ''}`}
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
             {isLoggedIn ? (
              <>
                <Link href={careerGuidanceHref}>
                    <Button size="lg" className="text-lg py-7 px-10 shadow-lg">
                        <User className="mr-2 h-5 w-5" /> Continue Journey
                    </Button>
                </Link>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button size="lg" variant="outline" className="text-lg py-7 px-10 shadow-lg">
                         <NewJourneyIcon className="mr-2 h-5 w-5" /> Start New Journey
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to start a new journey?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear any of your previous in-progress journey data from this browser session (such as test answers). Saved reports in your profile will not be affected.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStartNewJourney}>
                            Yes, Start New Journey
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
                <Link href={careerGuidanceHref}>
                  <Button size="lg" className="text-lg py-7 px-10 shadow-lg" suppressHydrationWarning={true}>
                    <User className="mr-2 h-5 w-5" /> Get Career Guidance
                  </Button>
                </Link>
            )}
          </div>
        </div>
      </section>

      {/* All other sections are wrapped in a new div to isolate them */}
      <div id="page-content" className="relative z-10 bg-background">
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
                The modern job market is confusing. AI Councel replaces that confusion with a data-driven, personalized action plan so you can move forward with confidence.
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
                                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                <span>{solution}</span>
                            </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Research Points Section */}
        <section id="research-points" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why Traditional Career Guidance Is Failing</h2>
                     <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                        The world of work has changed, but the methods for choosing a career have not. Here's the reality.
                    </p>
                </div>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {researchPoints.map((point, index) => (
                        <Card key={index} className="bg-card/50 border-l-4 border-primary text-center p-6">
                           {point.icon}
                           <h3 className="text-xl font-bold mt-2">{point.title}</h3>
                           <p className="text-muted-foreground mt-2">{point.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>


        {/* Blog Section */}
        <section id="blog" className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
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
        <section id="faq" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 md:mb-16">
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
        
        {/* SEO Questions Section */}
        <section id="career-questions" className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
              <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">Trending Career Questions</h2>
                  <p className="text-md md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                      Explore the most common questions people ask when making a career decision. Click any question to get AI-backed guidance.
                  </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                  {careerQuestions.map((question, index) => (
                      <Link
                          key={index}
                          href="/career-assessment"
                          className="block p-4 bg-card hover:bg-accent rounded-lg font-medium text-card-foreground hover:text-accent-foreground transition-all duration-200 ease-in-out transform hover:-translate-y-1 shadow-sm hover:shadow-lg"
                      >
                          {question}
                      </Link>
                  ))}
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
    </div>
  );
}
