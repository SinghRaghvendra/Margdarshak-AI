
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Is Career Counselling Worth It? The Honest Truth (2026) | AI Councel',
    description: 'An honest look at whether career counselling is worth the investment. We analyze the data and compare the costs of guidance vs. the costs of a wrong career choice.',
    keywords: ['is career counselling worth it', 'career counselling benefits', 'value of career counselling', 'career counselling cost India'],
};

export default function BlogPostIsCareerCounsellingWorthIt() {
    return (
        <article className="py-12 max-w-3xl mx-auto">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Is Career Counselling Worth It? The Honest Truth Backed by Data (2026)</h1>
            </header>

            <div className="prose max-w-none text-foreground/90">
                <p>The short answer is: **Yes, but only if it's done right.**</p>
                <p>Career counselling is worth the investment if it is structured, assessment-based, personalized, and action-oriented. Otherwise, it’s just expensive motivational talk.</p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">The Hidden Cost of a Wrong Career Choice</h2>
                <p>Let's look at the data. Multiple surveys show that a staggering number of Indian graduates—sometimes as high as **78%**—regret their field of study or career choice. This isn't just a small "what if"; it has massive consequences:</p>
                <ul>
                    <li>**Lost Time:** Professionals switching careers lose an average of 2–4 years trying to correct their path.</li>
                    <li>**Financial Loss:** The cost of a degree that goes unused, plus years of lower-than-potential income, can run into lakhs.</li>
                    <li>**Mental Health:** Being in a job that doesn't fit your personality or skills is a direct path to burnout, anxiety, and chronic stress.</li>
                </ul>
                <p>Seen this way, the question changes. It’s not "Can I afford career counselling?" but "Can I afford the cost of *not* getting proper guidance?"</p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">When Is Career Counselling a Waste of Money?</h2>
                <p>Career counselling is **NOT** worth it if it involves:</p>
                <ul className="space-y-2">
                    <li className="flex items-start"><X className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" /><span>**Generic Advice:** Telling you to "follow your passion" without a plan.</span></li>
                    <li className="flex items-start"><X className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" /><span>**One-Size-Fits-All Models:** Pushing you towards the same 3-4 "safe" careers (engineering, MBA, etc.).</span></li>
                    <li className="flex items-start"><X className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" /><span>**No Psychometric Assessment:** Relying solely on conversation and opinion without data.</span></li>
                    <li className="flex items-start"><X className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" /><span>**No Actionable Roadmap:** Leaving you with a vague idea but no concrete steps to take.</span></li>
                </ul>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">When Career Counselling Is a High-Value Investment</h2>
                <p>It becomes a valuable investment when it delivers clear outcomes:</p>
                <ul className="space-y-2">
                    <li className="flex items-start"><Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" /><span>**For Students:** Provides stream clarity after 10th and degree clarity after 12th, giving them confidence in their decisions.</span></li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" /><span>**For Professionals:** Identifies why they feel stuck and provides a clear path for growth or a strategic pivot.</span></li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" /><span>**For Career Switchers:** Drastically reduces the risk of moving into another unsuitable field by mapping transferable skills to new roles.</span></li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8 mb-4">The Verdict: Cost vs. Value</h2>
                <p>A good career counselling program costs less than the fees for one semester of a degree you might regret. Its true value lies in the **risk it eliminates and the time it saves**.</p>
                <p>Career counselling is worth it when it saves you from the wrong career. It’s an investment in your single greatest asset: your future.</p>

                <Card className="mt-12 bg-primary/10 border-primary/50 border-l-4">
                    <CardHeader>
                        <CardTitle>Ready for a Worthwhile Investment in Your Future?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Stop guessing and start making data-driven decisions. Our AI career assessment provides a clear, actionable roadmap based on your unique profile.
                        </p>
                        <Link href="/career-assessment">
                            <Button>Get Your Career Roadmap <ArrowRight className="ml-2 h-5 w-5"/></Button>
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
