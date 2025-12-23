
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
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';


interface StoredRoadmapData {
  markdown: string;
  generatedAt: number; // Timestamp
  language: string;
  plan: string;
}

interface ViewModeData {
    markdown: string;
    careerName: string;
    plan: string;
    language: string;
    userName: string;
}

const REPORT_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export default function RoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  
  const [currentRoadmapMarkdown, setCurrentRoadmapMarkdown] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false); // Default to false
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [pageData, setPageData] = useState<{
    purchasedPlan: string;
    language: string;
    userName: string;
    selectedCareer: string;
    allSuggestions?: any[]; // Optional for view mode
  } | null>(null);

  const roadmapContentRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false); // Add a ref to track initialization.


  useEffect(() => {
    // Ensure this effect runs only once on mount, once user and db are available.
    if (user && db && !hasInitialized.current) {
      hasInitialized.current = true; // Mark as initialized
      initializePage(user);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, db]);

  const initializePage = async (currentUser: User) => {
    try {
        // PRIORITY 1: Check for "View Mode" from My Reports page.
        const viewModeDataString = localStorage.getItem('margdarshak_view_report_data');
        if (viewModeDataString) {
            const viewData: ViewModeData = JSON.parse(viewModeDataString);
            
            setPageData({
                purchasedPlan: viewData.plan,
                language: viewData.language,
                userName: viewData.userName,
                selectedCareer: viewData.careerName,
            });
            setCurrentRoadmapMarkdown(viewData.markdown);
            setIsGeneratingReport(false);
            setPageLoading(false);
            
            // Important: Clear the item after use so it doesn't persist.
            localStorage.removeItem('margdarshak_view_report_data');
            toast({ title: "Viewing Saved Report", description: `Displaying your report for ${viewData.careerName}.`});
            return;
        }

        // PRIORITY 2: Proceed with the "Generate New Report" flow.
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || !userDoc.data().paymentSuccessful) {
            toast({ title: 'Payment Required', description: 'Please purchase a plan to generate a report.', variant: 'destructive' });
            router.replace('/pricing');
            return;
        }
        
        const selectedCareer = localStorage.getItem('margdarshak_selected_career');
        const allSuggestionsString = localStorage.getItem('margdarshak_all_career_suggestions');

        if (!selectedCareer || !allSuggestionsString) {
            toast({ title: 'Data Missing', description: 'Career selection is missing. Please select a career first.', variant: 'destructive' });
            router.replace('/career-suggestions');
            return;
        }

        const userData = userDoc.data();
        const plan = userData.purchasedPlan;
        if (!plan) {
            toast({ title: 'No Plan Purchased', description: 'Please purchase a plan first.', variant: 'destructive' });
            router.replace('/pricing');
            return;
        }
      
        const pageInfo = {
            purchasedPlan: plan,
            language: userData.language || 'English',
            userName: userData.name || 'User',
            selectedCareer: selectedCareer,
            allSuggestions: JSON.parse(allSuggestionsString),
        };
      
        setPageData(pageInfo);
        await fetchAndSetRoadmap(currentUser, pageInfo);

    } catch (error: any) {
       toast({ title: 'Error loading page', description: error.message || 'An unexpected error occurred.', variant: 'destructive'});
       router.replace('/welcome-guest');
    } finally {
        setPageLoading(false);
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

  const fetchAndSetRoadmap = async (currentUser: User, pageInfo: NonNullable<typeof pageData>) => {
    const { purchasedPlan, language, selectedCareer, allSuggestions } = pageInfo;
    const cachedReportKey = `margdarshak_roadmap_${selectedCareer.replace(/\s/g, '_')}_${purchasedPlan}_${language}`;
    const cachedDataString = localStorage.getItem(cachedReportKey);

    if (cachedDataString) {
      try {
        const cachedReport: StoredRoadmapData = JSON.parse(cachedDataString);
        if (Date.now() - cachedReport.generatedAt < REPORT_CACHE_DURATION) {
          setCurrentRoadmapMarkdown(cachedReport.markdown);
          toast({ title: 'Report Loaded from Cache', description: `Showing cached ${purchasedPlan} report for ${selectedCareer}.` });
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
        body: JSON.stringify({ 
            userId: currentUser.uid, 
            plan: purchasedPlan, 
            language, 
            career: selectedCareer,
            allSuggestions // Pass all suggestions to the API
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate report.');
      }
      
      setGenerationProgress(100);
      setCurrentRoadmapMarkdown(result.roadmapMarkdown);

      const newCachedReport: StoredRoadmapData = { markdown: result.roadmapMarkdown, generatedAt: Date.now(), language, plan: purchasedPlan };
      localStorage.setItem(cachedReportKey, JSON.stringify(newCachedReport));
      
      toast({ title: 'Report Generated & Saved!', description: `Your ${language} report is ready.` });

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
    toast({ title: 'Generating PDF', description: `Preparing your report...` });

    const html2pdf = (await import('html2pdf.js')).default;
    const element = roadmapContentRef.current;
    const filename = `AI_Councel_Report_${pageData.userName.replace(/\s+/g, '_')}_${pageData.purchasedPlan}.pdf`;

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
      .catch((err) => toast({ title: 'PDF Generation Failed', variant: 'destructive' }))
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
          <CardTitle className="text-4xl font-bold capitalize">{pageData.purchasedPlan} Report</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            Your detailed {pageData.language} report for <strong className="text-primary/90">{pageData.selectedCareer}</strong>.
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
