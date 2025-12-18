'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

const FaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Which career is best for me?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "The best career depends on your skills, interests, and personality. AI Councel uses an AI-based career assessment to recommend suitable career paths."
            }
        },
        {
            "@type": "Question",
            "name": "How do I choose the right career?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Choosing the right career involves self-assessment and research. Our platform simplifies this by providing a personalized career test and AI-driven career matching to guide your decision."
            }
        },
        {
            "@type": "Question",
            "name": "What career suits my personality?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "A career that suits your personality aligns with your natural strengths and preferences. Our career assessment is designed to identify these traits and suggest careers where you can thrive."
            }
        },
        {
            "@type": "Question",
            "name": "Can AI help me choose a career?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. AI career guidance uses data-driven insights to analyze your profile and suggest careers that match your strengths, increasing your chances of finding a fulfilling job."
            }
        }
    ]
};


export default function CareerAssessmentPage() {
    const router = useRouter();

    const handleStartAssessment = () => {
        // This will redirect to the start of the user journey
        router.push('/signup');
    };

    return (
        <>
            {/* Add the FAQ Schema to the page */}
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(FaqSchema) }}
            />
            <div className="py-12 flex items-center justify-center">
                <Card className="w-full max-w-2xl shadow-xl">
                    <CardHeader className="text-center">
                        <Lightbulb className="h-16 w-16 text-primary mx-auto mb-4" />
                        <CardTitle className="text-3xl md:text-4xl font-bold">AI-Powered Career Assessment & Career Match</CardTitle>
                        <CardDescription className="text-lg md:text-xl text-muted-foreground mt-4">
                            Not sure which career is right for you? Our AI career assessment analyzes your skills, interests, and personality to give you a personalized career match.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="mb-8 text-muted-foreground">
                            Take the first step toward a fulfilling professional life. Our comprehensive assessment is designed to provide clarity and direction for your career journey.
                        </p>
                        <Button size="lg" className="text-lg py-7 px-10 shadow-lg" onClick={handleStartAssessment}>
                            Start Your Free Career Assessment <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <div className="mt-8 text-sm text-muted-foreground space-y-4">
                            <p>
                                After completing the assessment, you will receive AI-driven career suggestions. For a small fee, you can unlock a detailed 10-year roadmap for your chosen career.
                            </p>
                            <p>
                                <a href="/career-test" className="text-primary hover:underline font-medium mx-2">Career Test</a>|
                                <a href="/ai-career-guidance" className="text-primary hover:underline font-medium mx-2">AI Career Guidance</a>|
                                <a href="/career-match" className="text-primary hover:underline font-medium mx-2">Career Match</a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

// Dummy pages for internal linking SEO boost
export function CareerTestPage() { return <div>Career Test Page</div>; }
export function AiCareerGuidancePage() { return <div>AI Career Guidance Page</div>; }
export function CareerMatchPage() { return <div>Career Match Page</div>; }
