
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'AI Councel Blog – Career Advice, Guidance & Insights',
    description: 'Explore articles on career guidance, AI-powered career matching, personality-based career tests, and how to choose the right career path in the modern job market.',
};

const allBlogPosts = [
    {
      title: 'Career Counselling in India: Complete Guide for Students & Parents (2026)',
      excerpt: 'A complete guide to understanding the importance and process of career counselling in India for students and parents in 2026.',
      href: '/blog/career-counselling-in-india-guide',
      date: '2026-01-01',
    },
    {
      title: 'Is Career Counselling Worth It? An Honest, Data-Backed Answer',
      excerpt: 'Explore the real value of career counselling. Is it just motivational talk, or a crucial investment? We look at the data to find out.',
      href: '/blog/is-career-counselling-worth-it',
      date: '2026-01-01',
    },
    {
      title: 'AI Career Counselling vs. Human Counsellors: What Actually Works?',
      excerpt: 'AI is transforming career guidance. We compare AI-powered counselling with traditional human counsellors to see what works best in 2026.',
      href: '/blog/ai-vs-human-career-counselling',
      date: '2026-01-01',
    },
    {
      title: 'Career Counselling After 10th: 5 Mistakes 90% of Students Make',
      excerpt: 'Class 10 is a critical stage for career decisions. Learn about the common mistakes students make when choosing a stream and how to avoid them.',
      href: '/blog/career-counselling-after-10th-mistakes',
      date: '2026-01-01',
    },
    {
      title: 'Career Counselling After 12th: A Guide for Science, Commerce, and Arts Students',
      excerpt: 'The decision after 12th grade can define your career. This guide covers the options and confusion for students from all streams.',
      href: '/blog/career-counselling-after-12th-streams',
      date: '2026-01-01',
    },
    {
      title: 'How to Find Your Dream Career (Without Ruining Your Life)',
      excerpt: 'Stop gambling with your future. Learn how to find a career you love using AI-driven data without risking your financial stability.',
      href: '/blog/find-your-dream-career',
      date: '2024-08-04',
    },
    {
      title: 'Dream Career vs. Reality: The Honest Truth',
      excerpt: 'What is the reality of following your passion? Learn the 80/20 rule of dream jobs and how to find a path that actually works in the real world.',
      href: '/blog/dream-career-vs-reality',
      date: '2024-08-05',
    },
    {
      title: 'How to Choose the Right Career in 2025',
      excerpt: 'A modern guide to choosing the right career. Learn how to balance your passions, skills, and market demand to find a fulfilling and future-proof job path with the help of AI.',
      href: '/blog/how-to-choose-the-right-career',
      date: '2024-08-03',
    },
    {
      title: 'Are Career Tests Accurate? A Look at AI-Powered Assessments',
      excerpt: 'Explore the accuracy of career tests, from traditional personality quizzes to modern AI-powered career assessments and data-driven guidance.',
      href: '/blog/are-career-tests-accurate',
      date: '2024-08-02',
    },
    {
      title: 'Which Career Is Best for Students? A Clear Guide to Choosing the Right Career',
      excerpt: 'Struggling with career confusion as a student? Learn how to find a path that aligns with your skills, interests, and personality using data-driven insights.',
      href: '/blog/which-career-is-best-for-students',
      date: '2024-08-01',
    },
    {
      title: 'What Is the Best Career Move for Working Professionals Feeling Stuck?',
      excerpt: 'Feeling stuck, underpaid, or unfulfilled in your job? The best career move is not quitting blindly—it’s making a strategic, informed transition.',
      href: '/blog/best-career-move-for-working-professionals',
      date: '2024-07-31',
    },
    {
      title: 'Best Career Options for 2026: How to Future-Proof Your Career',
      excerpt: "The job market is changing fast. To succeed in 2026 and beyond, choosing a future-proof career is essential. Here's how.",
      href: '/blog/best-career-options-for-2026',
      date: '2024-07-30',
    },
    {
      title: 'Which Career Is Best for Me? A Data-Driven Guide',
      excerpt: 'Feeling lost about your career? This guide helps you answer "Which career is best for me?" by focusing on a data-driven approach using AI-powered career assessments.',
      href: '/blog/which-career-is-best-for-me',
      date: '2024-07-29',
    },
];


export default function BlogPage() {
  return (
    <div className="py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">The AI Councel Blog</h1>
            <p className="text-lg text-muted-foreground">
                Your resource for expert career advice, industry trends, and data-driven guidance to help you navigate your professional journey with confidence.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allBlogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((post) => (
                <Card key={post.href} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl leading-snug">
                            <Link href={post.href} className="hover:text-primary transition-colors">{post.title}</Link>
                        </CardTitle>
                        <CardDescription>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
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
    </div>
  );
}
