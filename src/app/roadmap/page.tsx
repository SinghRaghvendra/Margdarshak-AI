
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinned, Download, Loader2, Milestone } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { generateRoadmap, type GenerateRoadmapInput, type GenerateRoadmapOutput } from '@/ai/flows/detailed-roadmap';
import { saveReport, getLatestReport, type ReportData, type CompressedTraits } from '@/services/report-service';
import { differenceInYears, parseISO } from 'date-fns';
import { calculateLifePathNumber } from '@/lib/numerology';
import { Progress } from '@/components/ui/progress';
import type { User } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/client-provider';
import { doc, setDoc, getDoc } from 'firebase/firestore';


interface UserInfo {
  uid: string;
  name: string;
  email: string;
  contact: string;
  country: string;
  language: string;
  lastPaymentId?: string;
}

interface BirthDetails {
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;
  timeOfBirth: string;
}

interface PersonalizedAnswers {
  q1: string; q2: string; q3: string; q4: string; q5: string;
}

interface StoredRoadmapData {
  markdown: string;
  generatedAt: number; // Timestamp
  language: string; // Store language for which report was generated
}

interface CareerSuggestionFromStorage {
  name: string;
  matchScore: string;
  personalityProfile: string;
  rationale: string;
}

const REPORT_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

type BaseRoadmapInputDataType = Omit<GenerateRoadmapInput, 'careerSuggestion' | 'userTraits' | 'matchScore' | 'personalityProfile' | 'preferredLanguage'> & {
  userTraits: CompressedTraits;
};


export default function RoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [currentRoadmapMarkdown, setCurrentRoadmapMarkdown] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [baseRoadmapInputData, setBaseRoadmapInputData] = useState<BaseRoadmapInputDataType | null>(null);
  const [allCareerSuggestions, setAllCareerSuggestions] = useState<CareerSuggestionFromStorage[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const roadmapContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        initializePageData(user);
      } else {
        toast({ title: 'Authentication Error', description: 'You must be logged in to view this page.', variant: 'destructive'});
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

   useEffect(() => {
    if (selectedCareer && baseRoadmapInputData && allCareerSuggestions.length > 0 && currentUser) {
      fetchAndSetRoadmap(selectedCareer, baseRoadmapInputData.preferredLanguage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCareer, baseRoadmapInputData, allCareerSuggestions, currentUser]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGeneratingReport && generationProgress < 99) {
      timer = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 99) {
            clearInterval(timer);
            return 99;
          }
          return prev + 1;
        });
      }, 250); // This will take about 25 seconds to reach 99%
    }
    return () => clearInterval(timer);
  }, [isGeneratingReport, generationProgress]);

  const initializePageData = (user: User) => {
    try {
      const prerequisites: { [key: string]: string } = {
        'margdarshak_user_info': '/signup',
        'margdarshak_birth_details': '/birth-details',
        'margdarshak_user_traits': '/psychometric-test',
        'margdarshak_personalized_answers': '/personalized-questions',
        'margdarshak_selected_career': '/career-suggestions',
        'margdarshak_all_career_suggestions': '/career-suggestions',
      };

      for (const [key, redirectPath] of Object.entries(prerequisites)) {
        if (!localStorage.getItem(key)) {
          toast({ title: 'Missing Information', description: `Your journey is incomplete. Please complete all steps. Redirecting...`, variant: 'destructive', duration: 5000 });
          router.replace(redirectPath);
          return;
        }
      }
      
      const storedSelection = localStorage.getItem('margdarshak_selected_career')!;
      const storedAllSuggestions = localStorage.getItem('margdarshak_all_career_suggestions')!;
      const storedUserInfo = localStorage.getItem('margdarshak_user_info')!;
      const storedBirthDetails = localStorage.getItem('margdarshak_birth_details')!;
      const traitsString = localStorage.getItem('margdarshak_user_traits')!;
      const storedPersonalizedAnswers = localStorage.getItem('margdarshak_personalized_answers')!;

      setSelectedCareer(storedSelection);
      setAllCareerSuggestions(JSON.parse(storedAllSuggestions));
      
      const userInfoParsed: UserInfo = JSON.parse(storedUserInfo);
      setUserInfo(userInfoParsed);
      const birthDetailsParsed: BirthDetails = JSON.parse(storedBirthDetails);
      const personalizedAnswersParsed: PersonalizedAnswers = JSON.parse(storedPersonalizedAnswers);
      const traitsParsed: CompressedTraits = JSON.parse(traitsString);
      let age: number;
      let lifePathNum: number;

      try {
        age = differenceInYears(new Date(), parseISO(birthDetailsParsed.dateOfBirth));
        lifePathNum = calculateLifePathNumber(birthDetailsParsed.dateOfBirth);
      } catch(e: any) {
        console.error("Error calculating age or life path:", e);
        toast({ title: 'Error processing birth date', description: e.message || 'Birth date might be invalid. Redirecting.', variant: 'destructive' });
        router.replace('/birth-details');
        return;
      }

      setBaseRoadmapInputData({
        userTraits: traitsParsed,
        country: userInfoParsed.country || 'India', // Default to India if country is not set
        userName: userInfoParsed.name,
        dateOfBirth: birthDetailsParsed.dateOfBirth,
        timeOfBirth: birthDetailsParsed.timeOfBirth,
        placeOfBirth: birthDetailsParsed.placeOfBirth,
        age: age,
        personalizedAnswers: personalizedAnswersParsed,
        lifePathNumber: lifePathNum,
        preferredLanguage: userInfoParsed.language || 'English',
      });

    } catch (error) {
       toast({ title: 'Error loading roadmap page', description: 'An unexpected error occurred. Please try again.', variant: 'destructive'});
       router.replace('/welcome-guest');
    } finally {
      setPageLoading(false);
    }
  }


  const fetchAndSetRoadmap = async (careerName: string, language: string) => {
    if (!baseRoadmapInputData || !currentUser || !db || !userInfo) {
      toast({ title: 'Error', description: 'Cannot generate report, essential data or DB connection missing.', variant: 'destructive' });
      return;
    }

    const careerDetails = allCareerSuggestions.find(s => s.name === careerName);
    if (!careerDetails) {
        toast({ title: 'Error', description: `Details for career "${careerName}" not found.`, variant: 'destructive' });
        setCurrentRoadmapMarkdown(`## Report Generation Failed\n\nCould not find details for the career: ${careerName}.`);
        setIsGeneratingReport(false);
        return;
    }

    const cachedReportKey = `margdarshak_roadmap_${careerName.replace(/\s+/g, '_')}_${language}`;
    const cachedDataString = localStorage.getItem(cachedReportKey);
    if (cachedDataString) {
      try {
        const cachedReport: StoredRoadmapData = JSON.parse(cachedDataString);
        if (Date.now() - cachedReport.generatedAt < REPORT_CACHE_DURATION && cachedReport.language === language) {
          setCurrentRoadmapMarkdown(cachedReport.markdown);
          toast({ title: 'Report Loaded from Cache', description: `Showing cached ${language} report for ${careerName}.` });
          setIsGeneratingReport(false);
          return;
        } else {
          localStorage.removeItem(cachedReportKey); 
        }
      } catch (e) {
        localStorage.removeItem(cachedReportKey); 
      }
    }
    
    setIsGeneratingReport(true);
    setCurrentRoadmapMarkdown(null);
    setGenerationProgress(0);
    
    try {
        const dbReport = await getLatestReport(db, currentUser.uid, careerName, language);
        if (dbReport) {
            setCurrentRoadmapMarkdown(dbReport.reportMarkdown);
            toast({ title: 'Report Loaded from Database', description: `Showing your previously generated ${language} report for ${careerName}.` });
            setIsGeneratingReport(false);
            return;
        }
    } catch(e) {
        console.error("Error fetching report from DB, proceeding to generate.", e);
    }
    
    toast({ title: `Generating ${language} Report for ${careerName}`, description: 'This may take a moment...' });

    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists() || !userDoc.data().paymentSuccessful) {
        toast({ title: 'Payment Required', description: 'A new payment is required to generate this report.', variant: 'destructive' });
        router.push('/payment');
        return;
    }
    const paymentId = userDoc.data().lastPaymentId;

    const roadmapInput: GenerateRoadmapInput = {
      ...baseRoadmapInputData,
      userTraits: JSON.stringify(baseRoadmapInputData.userTraits, null, 2),
      careerSuggestion: careerName,
      matchScore: careerDetails.matchScore,
      personalityProfile: careerDetails.personalityProfile,
      preferredLanguage: language,
    };

    try {
      const roadmapOutput: GenerateRoadmapOutput = await generateRoadmap(roadmapInput);
      setGenerationProgress(100);
      setCurrentRoadmapMarkdown(roadmapOutput.roadmapMarkdown);
      
      const newCachedReport: StoredRoadmapData = { markdown: roadmapOutput.roadmapMarkdown, generatedAt: Date.now(), language: language };
      localStorage.setItem(cachedReportKey, JSON.stringify(newCachedReport));
      
      const reportToSave: ReportData = {
          userId: currentUser.uid,
          userName: baseRoadmapInputData.userName,
          careerName: careerName,
          reportMarkdown: roadmapOutput.roadmapMarkdown,
          language: language,
          paymentId: paymentId,
          assessmentData: {
              userTraits: baseRoadmapInputData.userTraits,
              matchScore: careerDetails.matchScore,
              personalityProfile: careerDetails.personalityProfile
          }
      };
      await saveReport(db, reportToSave);

      // Consume the payment token after successful generation and save
      localStorage.setItem('margdarshak_payment_successful', 'false');
      await setDoc(userDocRef, { paymentSuccessful: false }, { merge: true });

      toast({ title: 'Report Generated & Saved!', description: `Detailed ${language} roadmap for ${careerName} is ready.` });
    } catch (error) {
      console.error(`Error generating ${language} roadmap for ${careerName}:`, error);
      toast({ title: `Error Generating Report for ${careerName}`, description: `Could not generate ${language} roadmap. Please try again or contact support.`, variant: 'destructive', duration: 7000 });
      setCurrentRoadmapMarkdown(`## Report Generation Failed\n\nWe encountered an error while generating the ${language} report for ${careerName}. Please try again later.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!roadmapContentRef.current || !currentRoadmapMarkdown || !selectedCareer) {
      toast({ title: 'Error', description: 'Roadmap content not available for download.', variant: 'destructive' });
      return;
    }
    setIsGeneratingPdf(true);
    toast({ title: 'Generating PDF', description: `Your ${baseRoadmapInputData?.preferredLanguage} roadmap PDF is being prepared...` });

    const html2pdf = (await import('html2pdf.js')).default;
    const element = roadmapContentRef.current;
    const safeUserName = baseRoadmapInputData?.userName.replace(/\s+/g, '_') || 'User';
    const safeCareerName = selectedCareer.toLowerCase().replace(/\s/g, '_');
    const filename = `AI_Councel_Report_${safeUserName}_${safeCareerName}_${baseRoadmapInputData?.preferredLanguage}.pdf`;

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: -window.scrollY, allowTaint: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save()
      .then(() => {
        toast({ title: 'PDF Downloaded', description: `Report for ${selectedCareer} saved as ${filename}` });
      })
      .catch((err) => {
        console.error("Error generating PDF:", err);
        toast({ title: 'PDF Generation Failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
      })
      .finally(() => {
        setIsGeneratingPdf(false);
      });
  };

  if (pageLoading || !baseRoadmapInputData || !currentUser) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">Your Career Roadmap</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            A detailed report for {selectedCareer} (Report Language: {baseRoadmapInputData.preferredLanguage}).
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 py-4">
            {isGeneratingReport ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <p className="text-muted-foreground">Generating detailed {baseRoadmapInputData.preferredLanguage} report for {selectedCareer}...</p>
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
                    <p className="text-muted-foreground">The report for {selectedCareer} could not be displayed.</p>
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

    
