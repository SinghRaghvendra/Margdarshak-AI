
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinned, Download, Loader2, Milestone, AlertTriangle, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import type { User } from 'firebase/auth';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc } from 'firebase/firestore';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface StoredRoadmapData {
  markdown: string;
  generatedAt: number;
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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [pageData, setPageData] = useState<{
    purchasedPlan: string;
    language: string;
    userName: string;
    selectedCareer: string;
    allSuggestions?: any[];
  } | null>(null);

  const roadmapContentRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const initializePage = async (currentUser: User) => {
    try {
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
            localStorage.removeItem('margdarshak_view_report_data');
            toast({ title: "Viewing Saved Report", description: `Displaying your report for ${viewData.careerName}.`});
            return;
        }

        const selectedCareer = localStorage.getItem('margdarshak_selected_career');
        const allSuggestionsString = localStorage.getItem('margdarshak_all_career_suggestions');
        const userInfoString = localStorage.getItem('margdarshak_user_info');
        const plan = JSON.parse(localStorage.getItem('margdarshak_selected_plan') || '{}').id;

        if (!selectedCareer || !allSuggestionsString || !userInfoString || !plan) {
            setInitializationError('Required journey data is missing from your session. This can happen if you refresh the page or open it in a new tab. Please go back to your career suggestions or "My Reports" page to start the report generation process again.');
            setPageLoading(false);
            return;
        }

        const userInfo = JSON.parse(userInfoString);
        const pageInfo = {
            purchasedPlan: plan,
            language: userInfo.language || 'English',
            userName: userInfo.name || 'User',
            selectedCareer: selectedCareer,
            allSuggestions: JSON.parse(allSuggestionsString),
        };
      
        setPageData(pageInfo);
        await fetchAndSetRoadmap(currentUser, pageInfo);

    } catch (error: any) {
       setInitializationError(error.message || 'An unexpected error occurred during page setup.');
       setPageLoading(false);
    } finally {
        if (!initializationError) {
          setPageLoading(false);
        }
    }
  };

  useEffect(() => {
    if (user && db && !hasInitialized.current) {
      hasInitialized.current = true;
      initializePage(user);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, db]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGeneratingReport) {
      timer = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 99) { clearInterval(timer); return 99; }
          return prev + 1;
        });
      }, 250); 
    }
    return () => clearInterval(timer);
  }, [isGeneratingReport]);

  const fetchAndSetRoadmap = async (currentUser: User, pageInfo: NonNullable<typeof pageData>) => {
    if (!db) return;
    const { purchasedPlan, language, selectedCareer, allSuggestions } = pageInfo;
    
    // Check for cached report first
    const cachedReportKey = `margdarshak_roadmap_${selectedCareer.replace(/\s/g, '_')}_${purchasedPlan}_${language}`;
    const cachedDataString = localStorage.getItem(cachedReportKey);
    if (cachedDataString) {
        const cachedReport: StoredRoadmapData = JSON.parse(cachedDataString);
        if (Date.now() - cachedReport.generatedAt < REPORT_CACHE_DURATION) {
            setCurrentRoadmapMarkdown(cachedReport.markdown);
            toast({ title: 'Report Loaded from Cache' });
            return;
        }
    }

    setIsGeneratingReport(true);
    setCurrentRoadmapMarkdown(null);
    setGenerationProgress(0);
    setGenerationError(null);
    setInitializationError(null); // Clear previous errors
    toast({ title: `Generating ${language} Report`, description: 'This may take up to 30 seconds...' });

    try {
        // Find an unspent payment entitlement
        const paymentsRef = collection(db, 'payments');
        const q = query(
            paymentsRef,
            where('userId', '==', currentUser.uid),
            where('planId', '==', purchasedPlan),
            where('status', '==', 'SUCCESS'),
            where('reportId', '==', null),
            orderBy('createdAt', 'asc'),
            limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error(`No unused '${purchasedPlan}' plan payment found. Please purchase a plan.`);
        }
        
        const paymentDoc = querySnapshot.docs[0];
        const paymentId = paymentDoc.id;

        const idToken = await currentUser.getIdToken(true);
        const response = await fetch('/api/generate-and-save-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
            body: JSON.stringify({ plan: purchasedPlan, language, career: selectedCareer, allSuggestions, paymentId }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to generate report.');
        
        setGenerationProgress(100);
        setCurrentRoadmapMarkdown(result.roadmapMarkdown);

        const newCachedReport: StoredRoadmapData = { markdown: result.roadmapMarkdown, generatedAt: Date.now() };
        localStorage.setItem(cachedReportKey, JSON.stringify(newCachedReport));
        
        toast({ title: 'Report Generated & Saved!', description: `Your ${language} report is ready.` });

    } catch (error: any) {
        console.error(`Error generating report:`, error);
        setGenerationError(error.message);
        toast({ title: `Error Generating Report`, description: error.message, variant: 'destructive', duration: 10000 });
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

  const handleRetry = () => {
    if (user && pageData) {
      fetchAndSetRoadmap(user, pageData);
    }
  }

  const pageError = generationError || initializationError;

  if (pageLoading || !pageData && !pageError) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold capitalize">{pageData?.purchasedPlan} Report</CardTitle>
          {pageData && (
              <CardDescription className="text-xl text-muted-foreground">
                Your detailed {pageData.language} report for <strong className="text-primary/90">{pageData.selectedCareer}</strong>.
              </CardDescription>
          )}
        </CardHeader>
        <CardContent className="px-2 sm:px-6 py-4">
            {isGeneratingReport ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <p className="text-muted-foreground">Generating detailed {pageData?.language} report...</p>
                <Progress value={generationProgress} className="w-full max-w-md" />
                <p className="text-sm text-primary font-semibold">{Math.round(generationProgress)}%</p>
                <p className="text-xs text-muted-foreground">Estimated time: 20-30 seconds</p>
              </div>
            ) : pageError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{initializationError ? 'Page Load Error' : 'Report Generation Failed'}</AlertTitle>
                <AlertDescription>
                  <p>{pageError}</p>
                  {generationError && <p className="mt-2">This can happen due to high server load or a network issue. Please try again.</p>}
                </AlertDescription>
                <div className="mt-4 flex gap-4">
                    {generationError && (
                        <Button onClick={handleRetry}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Generation
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push('/my-reports')}>
                        <Milestone className="mr-2 h-4 w-4" />
                        Go to My Reports
                    </Button>
                </div>
              </Alert>
            ) : currentRoadmapMarkdown ? (
              <div ref={roadmapContentRef} className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-foreground">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-primary border-b pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-6 mb-3 text-primary/90" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
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
                    <p className="text-muted-foreground">The report could not be displayed. Please try generating it again.</p>
               </div>
            )}
        </CardContent>
         <CardContent className="mt-6 pb-6 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              onClick={handleDownloadPdf} 
              disabled={isGeneratingPdf || isGeneratingReport || !currentRoadmapMarkdown || !!pageError} 
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
