
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Career Counselling After 10th: 5 Mistakes 90% Students Make | AI Councel',
    description: 'Learn the 5 critical mistakes 90% of students make after Class 10th when choosing a career stream (Science, Commerce, Arts) and how proper career counselling can help.',
    keywords: ['career counselling after 10th', 'stream selection mistakes', 'career guidance after 10th', 'what to do after 10th'],
};

export default function BlogPostCareerCounsellingAfter10th() {
    return (
        <article className="py-12 max-w-3xl mx-auto">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Career Counselling After 10th: 5 Mistakes 90% of Students Make</h1>
            </header>

            <div className="prose max-w-none text-foreground/90">
                <p>Why is Class 10 a dangerous career stage? Because at 15, students are asked to make a choice that will affect the next 20 years of their life—choosing between Science, Commerce, and Arts—often without knowing anything about themselves or the world of work.</p>
                <p>This leads to common, predictable mistakes. Here are the five biggest errors 90% of students and parents make, and how to avoid them.</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">The Top 5 Stream Selection Mistakes</h2>
                
                <div className="space-y-6 my-8">
                    <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 text-destructive mr-2"/>Mistake #1: Choosing Science "Because It’s Safe"</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>This is the most common trap. Parents believe Science keeps all options open. The truth? A forced Science stream closes the door to a student's happiness and true potential. **Science is not safe if it doesn’t fit the student's aptitude.**</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 text-destructive mr-2"/>Mistake #2: Marks-Based Stream Selection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Getting 95 in Math does not mean you will be a great engineer. High marks indicate good memory and discipline, but **marks do not measure aptitude or interest.** Many high-scoring students end up in careers they hate.</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 text-destructive mr-2"/>Mistake #3: Following the Herd (Peer Pressure)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>"All my friends are taking Commerce, so I will too." This is a recipe for disaster. Your friends' personalities and skills are different from yours. Their path is not your path.</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 text-destructive mr-2"/>Mistake #4: Ignoring New-Age Careers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>The world has moved beyond just doctor and engineer. Fields like AI/ML, UX Design, Product Management, and Data Analytics are high-growth, high-paying careers. Choosing a stream without considering these is like planning for a world that no longer exists.</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-secondary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 text-destructive mr-2"/>Mistake #5: Lack of Self-Awareness</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>The biggest mistake is making a decision without data. You wouldn't buy a phone without checking its features, so why choose a career without understanding your own "features" (your personality, interests, and cognitive style)?</p>
                        </CardContent>
                    </Card>
                </div>


                <h2 className="text-2xl font-semibold mt-8 mb-4">What Good Career Counselling After 10th Should Do</h2>
                <p>Effective counselling at this stage isn't about choosing a career for life. It's about choosing the right **direction**. It must include:</p>
                <ul>
                    <li>**Personality & Aptitude Assessment:** To understand the student's core nature.</li>
                    <li>**Interest Mapping:** To see what fields genuinely excite them.</li>
                    <li>**Career Exploration:** To show them the vast range of modern careers available.</li>
                    <li>**Stream-to-Career Pathing:** To connect a stream choice to a long-term vision.</li>
                </ul>

                <Card className="mt-12 bg-primary/10 border-primary/50 border-l-4">
                    <CardHeader>
                        <CardTitle>Avoid Costly Mistakes. Make a Data-Driven Decision.</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                           Our AI-powered assessment helps students understand their unique profile, so they can choose the right stream with confidence. Don't guess about the future.
                        </p>
                        <Link href="/career-assessment">
                            <Button>Take the Stream Selector Assessment <ArrowRight className="ml-2 h-5 w-5"/></Button>
                        </Link>
                    </CardContent>
                </Card>

                 <div className="mt-12 border-t pt-6 text-center">
                    <Link href="/blog" className="text-primary hover:underline">
                        &larr; Back to all articles
                    </Link>
                </div>
            </div>
        </article>
    );
}
