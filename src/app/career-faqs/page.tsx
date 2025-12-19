
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Career FAQs – Career Guidance, Tests & AI Career Matching | AI Councel',
    description: 'Find answers to the most common career questions. Learn how to choose the right career, take career tests, and get AI-powered career guidance.',
};

const faqSections = [
    {
        title: 'Career Confusion FAQs',
        questions: [
            {
                question: 'Which career is best for me?',
                keyword: 'career guidance',
                answer: "Choosing the best career depends on your skills, interests, personality, and long-term goals. Instead of guessing, an AI-based career assessment analyzes these factors to recommend careers that match your profile.",
                blogLink: '/blog/which-career-is-best-for-me',
            },
            {
                question: 'How do I choose the right career?',
                keyword: 'how to choose the right career',
                answer: "The right career aligns with what you’re good at, what you enjoy, and what the market needs. Career confusion usually happens when one of these factors is ignored. AI career guidance helps balance all three using data-driven insights.",
                blogLink: '/blog/how-to-choose-the-right-career',
            },
            {
                question: 'What career suits my personality?',
                keyword: 'career test',
                answer: "Personality plays a major role in career satisfaction. Career tests evaluate traits like introversion, creativity, and problem-solving style to suggest suitable career paths.",
                blogLink: null, // No page created yet
            },
        ],
    },
    {
        title: 'Career Tests & Assessment FAQs',
        questions: [
            {
                question: 'Are career tests accurate?',
                keyword: 'career assessment',
                answer: "Career tests are accurate when they analyze multiple factors like skills, interests, and behavior patterns. AI-powered career assessments improve accuracy by learning from large datasets and real career outcomes.",
                blogLink: '/blog/are-career-tests-accurate',
            },
            {
                question: 'What is a career assessment?',
                keyword: 'career assessment',
                answer: "A career assessment is a structured evaluation of your strengths, interests, and personality to recommend suitable career options. Modern assessments use AI to deliver personalized career matches instead of generic advice.",
                blogLink: null,
            },
            {
                question: 'Is a free career test reliable?',
                keyword: 'career test online',
                answer: "Free career tests can offer initial insights, but deeper AI-driven assessments provide more accurate and personalized guidance for long-term career planning.",
                blogLink: null,
            },
        ],
    },
    {
        title: 'AI Career Guidance FAQs',
        questions: [
            {
                question: 'What is AI career guidance?',
                keyword: 'AI career guidance',
                answer: "AI career guidance uses artificial intelligence to analyze your profile and recommend careers based on real-world data, skill trends, and personal preferences.",
                blogLink: null,
            },
            {
                question: 'Can AI help me choose a career?',
                keyword: 'AI career guidance',
                answer: "Yes. AI helps eliminate bias and guesswork by matching your profile with career paths that have historically led to success for similar individuals.",
                blogLink: null,
            },
            {
                question: 'Is AI career counseling reliable?',
                keyword: 'AI career counseling',
                answer: "AI career counseling is reliable when used alongside validated psychological models and real career data. It provides consistency, scalability, and personalization that traditional counseling often lacks.",
                blogLink: null,
            },
        ],
    },
    {
        title: 'Students & Professionals FAQs',
        questions: [
            {
                question: 'Career options after graduation',
                keyword: 'career options after graduation',
                answer: "Career options after graduation vary based on your degree, skills, and interests. An AI career match helps identify both traditional and emerging career paths.",
                blogLink: null,
            },
            {
                question: 'Career guidance for students',
                keyword: 'career guidance for students',
                answer: "Students benefit from early career guidance by understanding their strengths and aligning education choices with future careers.",
                blogLink: null,
            },
            {
                question: 'Career advice for working professionals',
                keyword: 'career advice for professionals',
                answer: "Professionals often seek career advice when switching roles, industries, or aiming for growth. AI-based guidance helps identify upskilling paths and better-fit roles.",
                blogLink: null,
            },
        ],
    }
];

export default function CareerFaqsPage() {
  return (
    <div className="py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Career Questions & Answers</h1>
            <p className="text-lg text-muted-foreground">
                Choosing the right career is one of the most important decisions in life. Below are the most common career questions people ask before making a career decision. Each answer is designed to give clarity and guide you toward a personalized career assessment.
            </p>
        </div>

        <div className="max-w-3xl mx-auto">
            {faqSections.map((section) => (
                <div key={section.title} className="mb-10">
                    <h2 className="text-2xl font-bold text-primary mb-4 pb-2 border-b-2 border-primary/20">{section.title}</h2>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {section.questions.map((faq) => (
                            <AccordionItem value={faq.question} key={faq.question} className="border-b-0">
                                <Card className="bg-card/50 hover:bg-card transition-shadow shadow-sm hover:shadow-md">
                                    <AccordionTrigger className="text-lg font-semibold text-left px-6 py-4 hover:no-underline">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="prose max-w-none text-muted-foreground">
                                            <p>{faq.answer}</p>
                                            <div className="mt-4 space-y-2">
                                                <Link href="/career-assessment" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
                                                    <ChevronRight className="h-4 w-4 mr-1" /> Take the AI Career Assessment
                                                </Link>
                                                {faq.blogLink && (
                                                  <>
                                                    <br/>
                                                    <Link href={faq.blogLink} className="inline-flex items-center text-sm font-semibold text-primary/80 hover:underline">
                                                        <ChevronRight className="h-4 w-4 mr-1" /> Read Related Blog Post
                                                    </Link>
                                                  </>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            ))}
        </div>

        <div className="mt-20 text-center bg-secondary/30 py-12 rounded-lg">
            <h2 className="text-3xl font-bold">Still Confused About Your Career?</h2>
            <p className="text-muted-foreground mt-2 mb-6 max-w-xl mx-auto">
                Get personalized career guidance based on your skills, interests, and personality.
            </p>
            <Link href="/career-assessment">
                <Button size="lg" className="text-lg py-7 px-8">
                    Take the AI Career Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </Link>
        </div>
    </div>
  );
}

    