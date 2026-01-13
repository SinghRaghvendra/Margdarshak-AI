
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Wand2, FileText, Briefcase, Loader2, Download, AlertTriangle, CheckCircle, BarChart, BrainCircuit, Bot } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as pdfjsLib from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Since pdfjs-dist is a large library, we need to set the worker source.
// This is a common pattern for using it in web applications.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface AnalysisResult {
    matchScore: string;
    strengths: string;
    weaknesses: string;
    skillGap: string;
    interviewPrep: string;
    optimizedResume: string;
}


export default function ResumeBuilderPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const db = useFirestore();

    const [resumeText, setResumeText] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial check to redirect if not logged in
    useEffect(() => {
        if (!userLoading && !user) {
            toast({ title: 'Login Required', description: 'Please log in to use the Resume Optimizer.', variant: 'destructive'});
            router.push('/login?redirect=/resumebuilder');
        }
    }, [user, userLoading, router, toast]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setResumeText(''); // Reset previous text
        setIsLoading(true);
        toast({ title: 'Reading Resume...', description: 'Extracting text from your file.'});

        try {
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                    fullText += pageText + '\n';
                }
                setResumeText(fullText);
            } else if (file.type === 'text/plain') {
                const text = await file.text();
                setResumeText(text);
            } else {
                throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
            }
             toast({ title: 'Success', description: 'Resume text extracted successfully.' });
        } catch (err: any) {
            setError(err.message);
            toast({ title: 'Error Reading File', description: err.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerate = async () => {
        // This is where the main logic will go.
        // For now, it's a placeholder.
        toast({ title: 'Coming Soon!', description: 'The AI analysis feature is under development.' });
    };

    if (userLoading) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
    }
    
    return (
        <div className="py-12 bg-secondary/30">
            <div className="container mx-auto px-4">
                 <Card className="w-full max-w-4xl mx-auto shadow-2xl">
                    <CardHeader className="text-center">
                        <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
                        <CardTitle className="text-4xl font-bold">AI Resume Optimizer</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-2">
                           Upload your resume and a job description to get a data-driven analysis and an ATS-optimized rewrite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Step 1: Upload Resume */}
                        <div className="space-y-2">
                           <Label htmlFor="resume-upload" className="text-xl font-semibold flex items-center gap-2"><FileText className="h-6 w-6 text-primary"/> Your Resume</Label>
                           <div 
                                className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                               <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                               <p className="mt-2 text-sm text-muted-foreground">
                                   Click to upload or drag and drop your resume (PDF or TXT).
                               </p>
                               <Input 
                                    ref={fileInputRef}
                                    id="resume-upload" 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                    accept=".pdf,.txt"
                                />
                           </div>
                           {fileName && (
                               <div className="text-sm text-muted-foreground font-medium p-2 bg-secondary rounded-md">
                                   ✓ {fileName}
                               </div>
                           )}
                           <Textarea 
                                placeholder="Or paste your resume text here..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="min-h-[150px] mt-2"
                            />
                        </div>

                        {/* Step 2: Job Description */}
                        <div className="space-y-2">
                           <Label htmlFor="job-description" className="text-xl font-semibold flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary"/> Job Description</Label>
                            <Textarea 
                                id="job-description"
                                placeholder="Paste the full job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="min-h-[200px]"
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex-col">
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || !resumeText || !jobDescription}
                            className="w-full text-lg py-7"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                            Generate Analysis & Optimized Resume
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">1 Free analysis remaining.</p>
                    </CardFooter>
                 </Card>

                 {/* Future content will go here */}

            </div>
        </div>
    );
}

