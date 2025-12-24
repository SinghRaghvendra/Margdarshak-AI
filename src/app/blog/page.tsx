'use client';

import { useState, useMemo } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, BookOpen, Search, Tag, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const allBlogPosts = [
    {
      title: 'Will AI Take My Job? How to Choose a Career That’s "Robot-Proof"',
      excerpt: 'Worried about AI taking your job? Discover the most stable, high-paying careers for the future and how to build a robot-proof career path.',
      href: '/blog/will-ai-take-my-job',
      date: '2026-01-01',
      tags: ['AI', 'Future of Work', 'Career Advice'],
    },
    {
      title: 'Passion or Salary? The Truth About Dream Careers in India',
      excerpt: 'Is it better to follow your passion or chase a high salary? Discover why the most successful careers in 2026 are the ones that combine both.',
      href: '/blog/passion-vs-salary',
      date: '2026-01-01',
      tags: ['Dream Career', 'Career Choice', 'India'],
    },
    {
      title: 'Career Counselling in India: Complete Guide for Students & Parents (2026)',
      excerpt: 'A complete guide to understanding the importance and process of career counselling in India for students and parents in 2026.',
      href: '/blog/career-counselling-in-india-guide',
      date: '2026-01-01',
      tags: ['Career Counselling', 'India', 'Students'],
    },
    {
      title: 'Is Career Counselling Worth It? An Honest, Data-Backed Answer',
      excerpt: 'Explore the real value of career counselling. Is it just motivational talk, or a crucial investment? We look at the data to find out.',
      href: '/blog/is-career-counselling-worth-it',
      date: '2026-01-01',
      tags: ['Career Counselling', 'Career Advice'],
    },
    {
      title: 'AI Career Counselling vs. Human Counsellors: What Actually Works?',
      excerpt: 'AI is transforming career guidance. We compare AI-powered counselling with traditional human counsellors to see what works best in 2026.',
      href: '/blog/ai-vs-human-career-counselling',
      date: '2026-01-01',
      tags: ['AI', 'Career Counselling', 'Technology'],
    },
    {
      title: 'Career Counselling After 10th: 5 Mistakes 90% of Students Make',
      excerpt: 'Class 10 is a critical stage for career decisions. Learn about the common mistakes students make when choosing a stream and how to avoid them.',
      href: '/blog/career-counselling-after-10th-mistakes',
      date: '2026-01-01',
      tags: ['Career Counselling', 'Students', '10th Grade'],
    },
    {
      title: 'Career Counselling After 12th: A Guide for Science, Commerce, and Arts Students',
      excerpt: 'The decision after 12th grade can define your career. This guide covers the options and confusion for students from all streams.',
      href: '/blog/career-counselling-after-12th-streams',
      date: '2026-01-01',
      tags: ['Career Counselling', 'Students', '12th Grade'],
    },
    {
      title: 'How to Find Your Dream Career (Without Ruining Your Life)',
      excerpt: 'Stop gambling with your future. Learn how to find a career you love using AI-driven data without risking your financial stability.',
      href: '/blog/find-your-dream-career',
      date: '2025-08-04',
      tags: ['Dream Career', 'Career Choice', 'Career Advice'],
    },
    {
      title: 'Dream Career vs. Reality: The Honest Truth',
      excerpt: 'What is the reality of following your passion? Learn the 80/20 rule of dream jobs and how to find a path that actually works in the real world.',
      href: '/blog/dream-career-vs-reality',
      date: '2025-08-05',
      tags: ['Dream Career', 'Passion vs Profession', 'Career Advice'],
    },
    {
      title: 'Why Most People Never Find Their Dream Career',
      excerpt: 'Discover the psychological traps like Analysis Paralysis and the Sunk Cost Fallacy that prevent you from finding your dream job.',
      href: '/blog/why-most-people-never-find-their-dream-career',
      date: '2025-08-06',
      tags: ['Dream Career', 'Psychology', 'Career Change'],
    },
    {
      title: 'How to Choose the Right Career in 2025',
      excerpt: 'A modern guide to choosing the right career. Learn how to balance your passions, skills, and market demand to find a fulfilling and future-proof job path with the help of AI.',
      href: '/blog/how-to-choose-the-right-career',
      date: '2025-08-03',
      tags: ['Career Choice', 'Career Guidance', '2025'],
    },
    {
      title: 'Are Career Tests Accurate? A Look at AI-Powered Assessments',
      excerpt: 'Explore the accuracy of career tests, from traditional personality quizzes to modern AI-powered career assessments and data-driven guidance.',
      href: '/blog/are-career-tests-accurate',
      date: '2025-08-02',
      tags: ['Career Tests', 'AI', 'Accuracy'],
    },
    {
      title: 'Which Career Is Best for Students? A Clear Guide to Choosing the Right Career',
      excerpt: 'Struggling with career confusion as a student? Learn how to find a path that aligns with your skills, interests, and personality using data-driven insights.',
      href: '/blog/which-career-is-best-for-students',
      date: '2025-08-01',
      tags: ['Students', 'Career Guidance', 'Career Choice'],
    },
    {
      title: 'What Is the Best Career Move for Working Professionals Feeling Stuck?',
      excerpt: 'Feeling stuck, underpaid, or unfulfilled in your job? The best career move is not quitting blindly—it’s making a strategic, informed transition.',
      href: '/blog/best-career-move-for-working-professionals',
      date: '2025-07-31',
      tags: ['Working Professionals', 'Career Change', 'Career Growth'],
    },
    {
      title: 'Best Career Options for 2026: How to Future-Proof Your Career',
      excerpt: "The job market is changing fast. To succeed in 2026 and beyond, choosing a future-proof career is essential. Here's how.",
      href: '/blog/best-career-options-for-2026',
      date: '2025-07-30',
      tags: ['2026', 'Future of Work', 'Career Options'],
    },
    {
      title: 'Which Career Is Best for Me? A Data-Driven Guide',
      excerpt: 'Feeling lost about your career? This guide helps you answer "Which career is best for me?" by focusing on a data-driven approach using AI-powered career assessments.',
      href: '/blog/which-career-is-best-for-me',
      date: '2025-07-29',
      tags: ['Career Choice', 'Career Guidance', 'Self-Assessment'],
    },
];

const metadata: Metadata = {
    title: 'AI Councel Blog – Career Advice, Guidance & Insights',
    description: 'Explore articles on career guidance, AI-powered career matching, personality-based career tests, and how to choose the right career path in the modern job market.',
};

const sortedPosts = allBlogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    sortedPosts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  const archives = useMemo(() => {
    const archiveData: { [year: number]: Set<number> } = {};
    sortedPosts.forEach(post => {
      const date = new Date(post.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      if (!archiveData[year]) {
        archiveData[year] = new Set();
      }
      archiveData[year].add(month);
    });
    return archiveData;
  }, []);

  const filteredPosts = useMemo(() => {
    return sortedPosts.filter(post => {
      const searchLower = searchTerm.toLowerCase();
      const postDate = new Date(post.date);
      
      const matchesSearch = searchTerm ? (
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower)
      ) : true;

      const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
      const matchesYear = selectedYear ? postDate.getFullYear() === selectedYear : true;
      const matchesMonth = selectedMonth !== null ? postDate.getMonth() === selectedMonth : true;

      return matchesSearch && matchesTag && matchesYear && matchesMonth;
    });
  }, [searchTerm, selectedTag, selectedYear, selectedMonth]);

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag(null);
    setSelectedYear(null);
    setSelectedMonth(null);
  }

  const getMonthName = (monthIndex: number) => {
      return new Date(0, monthIndex).toLocaleString('default', { month: 'long' });
  }

  return (
    <div className="py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
            <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">The AI Councel Blog</h1>
            <p className="text-lg text-muted-foreground">
                Your resource for expert career advice, industry trends, and data-driven guidance to help you navigate your professional journey with confidence.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Blog Posts Column */}
            <div className="lg:col-span-3">
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPosts.map((post) => (
                            <Card key={post.href} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-xl leading-snug">
                                        <Link href={post.href} className="hover:text-primary transition-colors">{post.title}</Link>
                                    </CardTitle>
                                    <CardDescription>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map(tag => (
                                            <Badge 
                                              key={tag} 
                                              variant={selectedTag === tag ? "default" : "secondary"}
                                              onClick={() => setSelectedTag(tag)}
                                              className="cursor-pointer"
                                            >
                                              {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardContent>
                                    <Link href={post.href}>
                                        <Button variant="link" className="p-0">Read More <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 col-span-full">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">No Posts Found</h3>
                        <p className="text-muted-foreground mt-2 mb-6">
                            Your search or filter criteria did not match any posts. Try clearing the filters.
                        </p>
                        <Button onClick={clearFilters}>Clear All Filters</Button>
                    </div>
                )}
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-1 space-y-8">
                {/* Search */}
                <div className="p-6 rounded-lg bg-card border shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center"><Search className="mr-2 h-5 w-5 text-primary"/>Search</h3>
                    <Input 
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tags */}
                <div className="p-6 rounded-lg bg-card border shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center"><Tag className="mr-2 h-5 w-5 text-primary"/>Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <Button 
                              key={tag} 
                              variant={selectedTag === tag ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setSelectedTag(tag)}
                            >
                                {tag}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Archives */}
                <div className="p-6 rounded-lg bg-card border shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center"><Calendar className="mr-2 h-5 w-5 text-primary"/>Archives</h3>
                     <Accordion type="single" collapsible className="w-full">
                        {Object.keys(archives).sort((a,b) => Number(b) - Number(a)).map(yearStr => {
                            const year = Number(yearStr);
                            const months = Array.from(archives[year]).sort((a,b) => b-a);
                            return (
                               <AccordionItem value={`year-${year}`} key={year}>
                                    <AccordionTrigger className="text-lg font-semibold">{year}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col items-start space-y-1 pl-2">
                                            {months.map(month => (
                                                <Button 
                                                  key={month}
                                                  variant="link"
                                                  className={`h-auto p-1 ${selectedYear === year && selectedMonth === month ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                                                  onClick={() => handleMonthSelect(year, month)}
                                                >
                                                    {getMonthName(month)}
                                                </Button>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </div>

                {/* Clear Filters */}
                {(searchTerm || selectedTag || selectedYear !== null) && (
                    <div className="p-4 rounded-lg bg-card border shadow-sm text-center">
                        <Button onClick={clearFilters} variant="secondary" className="w-full">Clear All Filters</Button>
                    </div>
                )}
            </aside>
        </div>
    </div>
  );
}
