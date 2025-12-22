
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinned, Download, Loader2, Milestone } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';


interface StoredRoadmapData {
  markdown: string;
  generatedAt: number; // Timestamp
  language: string;
}

const REPORT_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function RoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  
  const [currentRoadmapMarkdown, setCurrentRoadmapMarkdown] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pageData, setPageData] = useState<{
    selectedCareer: string;
    language: string;
    userName: string;
  } | null>(null);

  const roadmapContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        initializePage(user);
      } else {
        toast({ title: 'Authentication Error', description: 'You must be logged in to view this page.', variant: 'destructive'});
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router, toast]);

  const initializePage = async (user: User) => {
    try {
      const prerequisites = [
        'margdarshak_user_info',
        'margdarshak_selected_career',
      ];
      for (const key of prerequisites) {
        if (!localStorage.getItem(key)) {
          toast({ title: 'Missing Information', description: `Your journey is incomplete. Redirecting...`, variant: 'destructive' });
          router.replace('/welcome-guest');
          return;
        }
      }

      const storedSelection = localStorage.getItem('margdarshak_selected_career')!;
      const storedUserInfo = localStorage.getItem('margdarshak_user_info')!;
      const userInfo = JSON.parse(storedUserInfo);

      setPageData({
        selectedCareer: storedSelection,
        language: userInfo.language || 'English',
        userName: userInfo.name || 'User',
      });
      setPageLoading(false);
      await fetchAndSetRoadmap(user, storedSelection, userInfo.language || 'English');
    } catch (error) {
       toast({ title: 'Error loading page', description: 'An unexpected error occurred. Please try again.', variant: 'destructive'});
       router.replace('/welcome-guest');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGeneratingReport && generationProgress < 99) {
      timer = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 1, 99));
      }, 250);
    }
    return () => clearInterval(timer);
  }, [isGeneratingReport, generationProgress]);

  const fetchAndSetRoadmap = async (user: User, careerName: string, language: string) => {
    const cachedReportKey = `margdarshak_roadmap_${careerName.replace(/\s+/g, '_')}_${language}`;
    const cachedDataString = localStorage.getItem(cachedReportKey);

    if (cachedDataString) {
      try {
        const cachedReport: StoredRoadmapData = JSON.parse(cachedDataString);
        if (Date.now() - cachedReport.generatedAt < REPORT_CACHE_DURATION && cachedReport.language === language) {
          setCurrentRoadmapMarkdown(cachedReport.markdown);
          toast({ title: 'Report Loaded from Cache', description: `Showing cached ${language} report.` });
          setIsGeneratingReport(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem(cachedReportKey);
      }
    }

    setIsGeneratingReport(true);
    setCurrentRoadmapMarkdown(null);
    setGenerationProgress(0);
    toast({ title: `Generating ${language} Report`, description: 'This may take a moment...' });

    try {
      const response = await fetch('/api/generate-and-save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, careerName, language }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate report.');
      }
      
      setGenerationProgress(100);
      setCurrentRoadmapMarkdown(result.roadmapMarkdown);

      const newCachedReport: StoredRoadmapData = { markdown: result.roadmapMarkdown, generatedAt: Date.now(), language };
      localStorage.setItem(cachedReportKey, JSON.stringify(newCachedReport));
      
      // Consume the payment token after successful generation
      localStorage.setItem('margdarshak_payment_successful', 'false');

      toast({ title: 'Report Generated & Saved!', description: `Detailed ${language} roadmap for ${careerName} is ready.` });

    } catch (error: any) {
      console.error(`Error generating report:`, error);
      toast({ title: `Error Generating Report`, description: error.message, variant: 'destructive', duration: 7000 });
      setCurrentRoadmapMarkdown(`## Report Generation Failed\n\nWe encountered an error: ${error.message}. Please try again later or contact support.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!roadmapContentRef.current || !pageData) {
      toast({ title: 'Error', description: 'Content not available.', variant: 'destructive' });
      return;
    }
    setIsGeneratingPdf(true);
    toast({ title: 'Generating PDF', description: `Preparing your ${pageData.language} roadmap...` });

    const html2pdf = (await import('html2pdf.js')).default;
    const element = roadmapContentRef.current;
    const filename = `AI_Councel_Report_${pageData.userName.replace(/\s+/g, '_')}_${pageData.selectedCareer.toLowerCase().replace(/\s/g, '_')}.pdf`;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save()
      .then(() => toast({ title: 'PDF Downloaded', description: `Report saved as ${filename}` }))
      .catch((err) => toast({ title: 'PDF Generation Failed', description: 'Could not generate PDF.', variant: 'destructive' }))
      .finally(() => setIsGeneratingPdf(false));
  };

  if (pageLoading || !pageData) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">Your Career Roadmap</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            A detailed report for {pageData.selectedCareer} (Language: {pageData.language}).
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 py-4">
            {isGeneratingReport ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <p className="text-muted-foreground">Generating detailed {pageData.language} report...</p>
                <Progress value={generationProgress} className="w-full max-w-md" />
                <p className="text-sm text-primary font-semibold">{Math.round(generationProgress)}%</p>
              </div>
            ) : currentRoadmapMarkdown ? (
              <div ref={roadmapContentRef} className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-foreground">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-primary border-b pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-6 mb-3 text-primary/90" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-accent-foreground" {...props} />,
                    p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-foreground/90" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-6 border-border" {...props} />
                  }}
                >
                  {currentRoadmapMarkdown}
                </ReactMarkdown>
              </div>
            ) : (
               <div className="text-center py-10">
                    <p className="text-muted-foreground">The report could not be displayed.</p>
               </div>
            )}
        </CardContent>
         <CardContent className="mt-6 pb-6 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              onClick={handleDownloadPdf} 
              disabled={isGeneratingPdf || isGeneratingReport || !currentRoadmapMarkdown} 
              className="w-full sm:w-auto"
            >
              {isGeneratingPdf ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
              Download PDF
            </Button>
            <Button onClick={() => router.push('/my-reports')} variant="outline" className="w-full sm:w-auto">
              <Milestone className="mr-2 h-5 w-5" />
              View All My Reports
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
