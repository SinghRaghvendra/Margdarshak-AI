
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Bot, FileText, Image, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const tools = [
    {
        title: "Resume Optimizer",
        description: "Upload your resume and a job description to get an AI-powered analysis, an ATS-friendly rewrite, and a match score to see if it's the right fit.",
        icon: <FileText className="h-10 w-10 text-primary" />,
        href: "/resumebuilder",
        status: "active"
    },
    {
        title: "Image Resizer & Optimizer",
        description: "Quickly resize and compress your images for web use without losing quality. Perfect for portfolios and online applications.",
        icon: <Image className="h-10 w-10 text-muted-foreground" />,
        href: "#",
        status: "coming_soon"
    },
    {
        title: "Mobile Data Optimizer",
        description: "Analyze and optimize your mobile data usage with smart recommendations. Reduce costs and improve performance on the go.",
        icon: <Smartphone className="h-10 w-10 text-muted-foreground" />,
        href: "#",
        status: "coming_soon"
    }
];

export default function AiToolsPage() {
    return (
        <div className="py-12">
            <div className="container mx-auto px-4">
                <header className="text-center mb-12">
                    <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground">Explore Our AI Tools</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                        Powerful, practical tools designed to give you a competitive edge in your career and digital life.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {tools.map((tool) => (
                        <Card 
                            key={tool.title} 
                            className={`flex flex-col transition-all duration-300 ${tool.status === 'active' ? 'shadow-lg hover:shadow-2xl' : 'shadow-sm bg-secondary/30'}`}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    {tool.icon}
                                    {tool.status === 'coming_soon' && (
                                        <Badge variant="outline">Coming Soon</Badge>
                                    )}
                                </div>
                                <CardTitle className={`mt-4 text-2xl font-bold ${tool.status !== 'active' && 'text-muted-foreground'}`}>{tool.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription className="text-base">{tool.description}</CardDescription>
                            </CardContent>
                            <CardContent>
                                <Link href={tool.href} passHref>
                                    <Button className="w-full text-lg py-6" disabled={tool.status !== 'active'}>
                                        {tool.status === 'active' ? 'Use Tool' : 'Coming Soon'} <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
