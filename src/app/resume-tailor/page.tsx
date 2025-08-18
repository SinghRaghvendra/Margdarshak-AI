
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { tailorResume } from '@/ai/flows/resume-tailor-flow';
import { ResumeTailorInputSchema, type ResumeTailorOutput } from '@/ai/schemas/resume-tailor-schema';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FileText, Briefcase, Wand2, ArrowRight, TrendingUp, CheckCircle, Upload } from 'lucide-react';

type ResumeTailorFormValues = z.infer<typeof ResumeTailorInputSchema>;

export default function ResumeTailorPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<ResumeTailorOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ResumeTailorFormValues>({
    resolver: zodResolver(ResumeTailorInputSchema),
    defaultValues: {
      resumeText: '',
      jobDescription: '',
      additionalInstructions: '',
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        toast({ title: 'Invalid File Type', description: 'Please upload a PDF file.', variant: 'destructive' });
        return;
    }

    toast({ title: 'Parsing PDF...', description: 'Please wait while we extract text from your resume.' });
    
    // Dynamically import pdf.js to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        try {
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                fullText += pageText + '\n\n';
            }
            form.setValue('resumeText', fullText);
            toast({ title: 'PDF Parsed Successfully', description: 'Your resume text has been added to the form.' });
        } catch (error) {
            console.error('Error parsing PDF:', error);
            toast({ title: 'PDF Parsing Error', description: 'Could not read text from the PDF. Please paste the text manually.', variant: 'destructive' });
        }
    };
    reader.readAsArrayBuffer(file);
  };


  const onSubmit = async (data: ResumeTailorFormValues) => {
    setIsLoading(true);
    setAiResult(null);
    toast({ title: 'AI is at work!', description: 'Tailoring your resume and writing your cover letter...' });

    try {
      const result = await tailorResume(data);
      setAiResult(result);
      toast({ title: 'Success!', description: 'Your tailored resume and cover letter are ready.' });
    } catch (error) {
      console.error('Error tailoring resume:', error);
      toast({
        title: 'AI Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-10">
        <Wand2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">Free AI Resume Tailor</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Instantly tailor your resume and generate a cover letter for any job. Paste your details, and let AI highlight your strengths.
        </p>
      </div>

      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Your Information</CardTitle>
          <CardDescription>
            Provide your resume, the job description, and any special instructions for the AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="resumeText"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5" /> Your Resume</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" /> Upload PDF
                        </Button>
                      </div>
                       <FormControl>
                        <Textarea
                          placeholder="Paste your full resume text here..."
                          className="min-h-[300px] h-full resize-y"
                          {...field}
                        />
                      </FormControl>
                      <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5" /> Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the target job description here..."
                          className="min-h-[300px] h-full resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="additionalInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Optional Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='e.g., "Emphasize my leadership skills," or "Make the tone more formal."'
                        className="min-h-[80px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    Tailor My Resume & Generate Cover Letter <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card className="w-full max-w-4xl mx-auto shadow-xl mt-10">
            <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <LoadingSpinner size={48} />
                    <p className="mt-4 text-muted-foreground text-center">AI is analyzing and writing... this can take up to a minute.</p>
                </div>
            </CardContent>
         </Card>
      )}

      {aiResult && (
        <Card className="w-full max-w-4xl mx-auto shadow-xl mt-10">
          <CardHeader>
            <CardTitle className="text-2xl">Your Tailored Application</CardTitle>
            <CardDescription>
              Review your AI-generated resume, cover letter, and ATS insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resume" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="resume">Tailored Resume</TabsTrigger>
                <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                <TabsTrigger value="insights">ATS Insights</TabsTrigger>
              </TabsList>
              <TabsContent value="resume" className="mt-4 prose max-w-none">
                 <ReactMarkdown>{aiResult.tailoredResume}</ReactMarkdown>
              </TabsContent>
              <TabsContent value="cover-letter" className="mt-4 prose max-w-none">
                 <ReactMarkdown>{aiResult.coverLetter}</ReactMarkdown>
              </TabsContent>
              <TabsContent value="insights" className="mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-lg flex items-center"><TrendingUp className="mr-2"/>ATS Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                <span className="line-through text-muted-foreground/70">{aiResult.atsScoreBefore}%</span>
                                <ArrowRight className="inline mx-2"/>
                                <span className="text-primary">{aiResult.atsScoreAfter}%</span>
                            </p>
                            <p className="text-sm text-muted-foreground">Estimated improvement in passing automated screening.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-lg flex items-center"><CheckCircle className="mr-2"/>Matched Keywords</CardTitle>
                        </Header>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                {aiResult.matchedKeywords.map((kw, i) => <li key={i}>{kw}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <Card className="mt-6">
                     <CardHeader className="pb-2">
                       <CardTitle className="text-lg">Further Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                           {aiResult.improvementSuggestions.map((sugg, i) => <li key={i}>{sugg}</li>)}
                        </ul>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
