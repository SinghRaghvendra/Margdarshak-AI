
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Career Counselling After 12th (Science, Commerce, Arts) | AI Councel',
    description: 'Your guide to career counselling after 12th for Science, Commerce, and Arts students. Discover hidden opportunities and avoid common mistakes.',
    keywords: ['career counselling after 12th', 'career options after 12th science', 'career options after 12th commerce', 'career options after 12th arts'],
};

export default function BlogPostCareerCounsellingAfter12th() {
    return (
        <article className="py-12 max-w-3xl mx-auto">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Career Counselling After 12th: A Guide for Science, Commerce & Arts</h1>
            </header>

            <div className="prose max-w-none text-foreground/90">
                <p>The decision after Class 12th is a make-or-break moment. It determines your degree, your initial skill path, and your entry into the professional world. A mistake here isn't just a waste of fees; it's a waste of years.</p>
                <p>Students from all streams—Science, Commerce, and Arts—face unique forms of confusion. Here’s a breakdown of the common traps and hidden opportunities for each.</p>

                <Tabs defaultValue="science" className="w-full mt-8">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="science">Science</TabsTrigger>
                        <TabsTrigger value="commerce">Commerce</TabsTrigger>
                        <TabsTrigger value="arts">Arts</TabsTrigger>
                    </TabsList>
                    <TabsContent value="science" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Science Students: Beyond Engineering & Medicine</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-2">The common confusion is a binary choice: Engineering or Medicine. But this ignores a world of high-growth careers:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Data Science & AI/ML: For those with strong analytical skills.</li>
                                    <li>Product Management: For those who blend technical understanding with user empathy.</li>
                                    <li>Biotechnology: For those interested in research beyond an MBBS.</li>
                                    <li>UX Research: For science students with an interest in human psychology.</li>
                                </ul>
                                <p className="mt-4 font-semibold">Career counselling for science students should reveal fit beyond marks and open doors to these modern roles.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="commerce">
                         <Card>
                            <CardHeader>
                                <CardTitle>Commerce Students: Hidden Opportunities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-2">The default path is often B.Com or CA. But the most exciting commerce careers today are in tech-driven fields:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Fintech (Financial Technology): Combining finance knowledge with tech skills.</li>
                                    <li>Business Analytics: Using data to drive business decisions.</li>
                                    <li>Product Management: Leading the development of digital products.</li>
                                    <li>Digital Marketing & Growth Hacking: For those with a knack for numbers and strategy.</li>
                                </ul>
                                <p className="mt-4 font-semibold">Counselling helps commerce students see beyond the traditional and into these high-demand specializations.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="arts">
                         <Card>
                            <CardHeader>
                                <CardTitle>Arts/Humanities Students: The Most Underrated Group</CardTitle>
                            </Header>
                            <CardContent>
                                <p className="mb-2">Often seen as the "backup" option, Arts students possess skills desperately needed in the modern economy: creativity, communication, and critical thinking. High-growth careers include:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>UX/UI Design: The architects of the digital world.</li>
                                    <li>Content Strategy & Marketing: The storytellers for major brands.</li>
                                    <li>Applied Psychology: In fields like HR, market research, and user behavior analysis.</li>
                                    <li>Public Policy & Research: For those who want to drive large-scale change.</li>
                                </ul>
                                <p className="mt-4 font-semibold">Counselling for Arts students is about removing the stigma and building a clear, confident path to a successful career.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>


                <h2 className="text-2xl font-semibold mt-8 mb-4">The Right Question to Ask</h2>
                <p>After 12th, don’t just ask, “Which course is best?”</p>
                <p>Ask, “Which career fits me long-term, and what course is the first step?”</p>
                <p>A good career counselling process helps you answer this by providing:</p>
                <ul>
                    <li>A deep psychometric assessment of your personality and aptitude.</li>
                    <li>A data-driven match score against hundreds of careers.</li>
                    <li>Visibility into the salary, lifestyle, and day-to-day reality of a role.</li>
                    <li>A clear learning roadmap of what to study and what skills to build.</li>
                </ul>

                <Card className="mt-12 bg-primary/10 border-primary/50 border-l-4">
                    <CardHeader>
                        <CardTitle>Make Your Next Decision the Right One</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                           Your decision after 12th grade is too important to leave to chance. Use our AI-powered assessment to find the degree and career path that perfectly aligns with your unique profile.
                        </p>
                        <Link href="/career-assessment">
                            <Button>Find Your Best-Fit Career <ArrowRight className="ml-2 h-5 w-5"/></Button>
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
