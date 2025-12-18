
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'AI Councel Blog – Career Advice, Guidance & Insights',
    description: 'Explore articles on career guidance, AI-powered career matching, personality-based career tests, and how to choose the right career path in the modern job market.',
};

const allBlogPosts = [
    {
      title: 'Which Career Is Best for Me?',
      excerpt: 'Struggling with career confusion? Learn how to find a path that aligns with your skills, interests, and personality using data-driven insights.',
      href: '/blog/which-career-is-best-for-me',
      date: '2024-07-28',
      seed: 101,
    },
    {
      title: 'How to Choose the Right Career in 2025',
      excerpt: 'The job market is changing. Discover a modern framework for choosing a career that is not only fulfilling but also future-proof.',
      href: '/blog/how-to-choose-the-right-career',
      date: '2024-07-27',
      seed: 102,
    },
    {
      title: 'Are Career Tests Accurate? A Look at AI-Powered Assessments',
      excerpt: "Not all career tests are created equal. We break down the science behind AI career assessments and why they're more reliable.",
      href: '/blog/are-career-tests-accurate',
      date: '2024-07-26',
      seed: 103,
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
            {allBlogPosts.map((post) => (
                <Card key={post.href} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                    <Link href={post.href} className="block">
                        <Image
                            src={`https://picsum.photos/seed/${post.seed}/600/400`}
                            alt={post.title}
                            width={600}
                            height={400}
                            className="w-full h-48 object-cover"
                            data-ai-hint="career skills"
                        />
                    </Link>
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
