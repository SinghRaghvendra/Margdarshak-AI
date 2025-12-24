
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, BookOpen, Search, Tag, Calendar, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { allBlogPosts } from '@/lib/blog-data';


const sortedPosts = allBlogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const featuredPostTitle = "Career Counselling in India: Complete Guide for Students & Parents (2026)";
const featuredPost = sortedPosts.find(p => p.title === featuredPostTitle);
const regularPosts = sortedPosts.filter(p => p.title !== featuredPostTitle);


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
    const postsToFilter = featuredPost ? regularPosts.concat(featuredPost) : regularPosts;
    return postsToFilter.filter(post => {
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
  
  // Separate filtered posts into featured and regular again
  const finalFeaturedPost = filteredPosts.find(p => p.title === featuredPostTitle);
  const finalRegularPosts = filteredPosts.filter(p => p.title !== featuredPostTitle);


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

                {/* Featured Post */}
                {finalFeaturedPost && (
                    <Card className="mb-12 col-span-1 md:col-span-2 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/50 bg-secondary/30">
                         <CardHeader>
                            <div className="flex items-center gap-2 text-primary font-semibold">
                                <Star className="h-5 w-5"/>
                                <span>Featured Post</span>
                            </div>
                            <CardTitle className="text-3xl leading-tight mt-2">
                                <Link href={finalFeaturedPost.href} className="hover:text-primary transition-colors">{finalFeaturedPost.title}</Link>
                            </CardTitle>
                            <CardDescription className="text-base">{new Date(finalFeaturedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-md text-muted-foreground mb-4">{finalFeaturedPost.excerpt}</p>
                            <div className="flex flex-wrap gap-2">
                                {finalFeaturedPost.tags.map(tag => (
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
                        <CardFooter>
                            <Link href={finalFeaturedPost.href}>
                                <Button>Read Full Article <ArrowRight className="ml-2 h-4 w-4" /></Button>
                            </Link>
                        </CardFooter>
                    </Card>
                )}
                
                {finalRegularPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {finalRegularPosts.map((post) => (
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
                                <CardFooter>
                                    <Link href={post.href}>
                                        <Button variant="link" className="p-0">Read More <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    !finalFeaturedPost && (
                        <div className="text-center py-16 col-span-full">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold">No Posts Found</h3>
                            <p className="text-muted-foreground mt-2 mb-6">
                                Your search or filter criteria did not match any posts. Try clearing the filters.
                            </p>
                            <Button onClick={clearFilters}>Clear All Filters</Button>
                        </div>
                    )
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
