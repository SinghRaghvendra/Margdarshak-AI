
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
import { useUser } from '@/firebase';
import * as pdfjsLib from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;
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

    const [resumeText, setResumeText] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resumeContentRef = useRef<HTMLDivElement>(null);

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
        setResumeText('');
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
        if (!user) {
            toast({ title: 'Authentication Error', description: 'You must be logged in.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        toast({ title: 'Starting Analysis...', description: 'The AI is reviewing your documents. This may take a moment.' });

        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/optimize-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ resumeText, jobDescription }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An unknown error occurred.');
            }
            
            setAnalysisResult(data);
            toast({ title: 'Analysis Complete!', description: 'Your resume report is ready below.' });

        } catch (err: any) {
            setError(err.message);
            toast({ title: 'Analysis Failed', description: err.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = (content: string, format: 'txt' | 'doc') => {
        const mimeType = format === 'txt' ? 'text/plain' : 'application/msword';
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `optimized_resume.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPdf = async () => {
        if (!resumeContentRef.current || !analysisResult) {
          toast({ title: 'Error', description: 'Content not available for PDF generation.', variant: 'destructive' });
          return;
        }
        setIsGeneratingPdf(true);
        toast({ title: 'Generating PDF', description: `Preparing your resume...` });
    
        const html2pdf = (await import('html2pdf.js')).default;
        const element = resumeContentRef.current;
        const filename = `AI_Councel_Optimized_Resume.pdf`;
    
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
    
        html2pdf().from(element).set(opt).save()
          .then(() => toast({ title: 'PDF Downloaded', description: `Resume saved as ${filename}` }))
          .catch((err) => toast({ title: 'PDF Generation Failed', variant: 'destructive' }))
          .finally(() => setIsGeneratingPdf(false));
    };


    if (userLoading) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
    }
    
    const matchScoreValue = analysisResult?.matchScore ? parseInt(analysisResult.matchScore.replace('%', '')) : 0;
    
    return (
        <div className="py-12 bg-secondary/30">
            <div className="container mx-auto px-4 space-y-8">
                 <Card className="w-full max-w-4xl mx-auto shadow-2xl">
                    <CardHeader className="text-center">
                        <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
                        <CardTitle className="text-4xl font-bold">AI Resume Optimizer</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-2">
                           Upload your resume and a job description to get a data-driven analysis and an ATS-optimized rewrite.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
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

                 {error && (
                    <Alert variant="destructive" className="max-w-4xl mx-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Analysis Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                 )}

                 {analysisResult && (
                    <Card className="w-full max-w-4xl mx-auto shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center">Your Resume Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Match Score */}
                            <div className="text-center p-6 bg-secondary/50 rounded-lg">
                                <h3 className="text-lg font-semibold text-muted-foreground">Match Score</h3>
                                <p className="text-6xl font-bold text-primary my-2">{analysisResult.matchScore}</p>
                                <Progress value={matchScoreValue} className="w-full max-w-sm mx-auto h-3" />
                                <p className="text-sm text-muted-foreground mt-3">Your resume's alignment with the job description.</p>
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-xl font-semibold"><CheckCircle className="h-5 w-5 mr-2 text-green-500" />Strengths</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none pt-2 text-muted-foreground"><ReactMarkdown>{analysisResult.strengths}</ReactMarkdown></AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="text-xl font-semibold"><AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />Weaknesses</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none pt-2 text-muted-foreground"><ReactMarkdown>{analysisResult.weaknesses}</ReactMarkdown></AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="text-xl font-semibold"><BarChart className="h-5 w-5 mr-2 text-blue-500" />Skill Gap</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none pt-2 text-muted-foreground"><ReactMarkdown>{analysisResult.skillGap}</ReactMarkdown></AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger className="text-xl font-semibold"><BrainCircuit className="h-5 w-5 mr-2 text-purple-500" />Interview Prep</AccordionTrigger>
                                    <AccordionContent className="prose max-w-none pt-2 text-muted-foreground"><ReactMarkdown>{analysisResult.interviewPrep}</ReactMarkdown></AccordionContent>
                                </AccordionItem>
                            </Accordion>

                             <div>
                                <h3 className="text-2xl font-bold mb-4 mt-8 text-center">ATS-Optimized Resume</h3>
                                <Card className="bg-background">
                                    <CardContent className="p-4">
                                        <div ref={resumeContentRef} className="prose prose-sm sm:prose-base max-w-none">
                                            <ReactMarkdown>{analysisResult.optimizedResume}</ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="mt-4 flex flex-wrap gap-4 justify-center">
                                    <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                                        {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                        Download as PDF
                                    </Button>
                                    <Button onClick={() => handleDownload(analysisResult.optimizedResume, 'doc')} variant="secondary">
                                        <Download className="mr-2 h-4 w-4" /> Download as Doc
                                    </Button>
                                     <Button onClick={() => handleDownload(analysisResult.optimizedResume, 'txt')} variant="secondary">
                                        <Download className="mr-2 h-4 w-4" /> Download as TXT
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 )}
            </div>
        </div>
    );
}
