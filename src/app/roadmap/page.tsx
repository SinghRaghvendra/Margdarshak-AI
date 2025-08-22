
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPinned, Milestone, Download, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { generateRoadmap, type GenerateRoadmapInput } from '@/ai/flows/detailed-roadmap';
import { differenceInYears, parseISO } from 'date-fns';
import { calculateLifePathNumber } from '@/lib/numerology';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';


interface UserData {
  name: string;
  country: string;
  language: string;
  birthDetails: {
    dateOfBirth: string; // YYYY-MM-DD
    placeOfBirth: string;
    timeOfBirth: string;
  };
  personalizedAnswers: {
    q1: string; q2: string; q3: string; q4: string; q5:string;
  };
  userTraits: string;
  payment?: { successful: boolean; timestamp: string };
  allCareerSuggestions?: CareerSuggestionFromStorage[];
  selectedCareersList?: string[];
  roadmaps?: Record<string, StoredRoadmapData>; // e.g. { "Software_Engineer_English": { ... } }
}

interface StoredRoadmapData {
  markdown: string;
  generatedAt: number; // Timestamp
  language: string;
}

interface CareerSuggestionFromStorage {
  name: string;
  matchScore: string;
  personalityProfile: string;
  rationale: string;
}

const REPORT_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export default function RoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [activeCareerTab, setActiveCareerTab] = useState<string | null>(null);
  
  const [currentRoadmapMarkdown, setCurrentRoadmapMarkdown] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const roadmapContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);

            if (!data.payment?.successful) {
              toast({ title: 'Payment Required', description: 'Redirecting to payment.', variant: 'destructive' });
              router.replace('/payment');
              return;
            }

            const selections = data.selectedCareersList || JSON.parse(localStorage.getItem('margdarshak_selected_careers_list') || '[]');
            if (selections.length > 0) {
                 setSelectedCareers(selections);
                 setActiveCareerTab(selections[0]);
            } else {
                 toast({ title: 'No careers selected', description: 'Redirecting.', variant: 'destructive' });
                 router.replace('/career-suggestions');
                 return;
            }

        } else {
           toast({ title: 'User data not found', description: 'Please sign up again.', variant: 'destructive' });
           router.replace('/signup');
           return;
        }

      } else { // Guest user
        setCurrentUser(null);
        if (localStorage.getItem('margdarshak_payment_successful') !== 'true') {
          toast({ title: 'Payment Required', description: 'Please complete payment to access roadmaps.', variant: 'destructive' });
          router.replace('/payment');
          return;
        }
        const selections = JSON.parse(localStorage.getItem('margdarshak_selected_careers_list') || '[]');
        if (selections.length > 0) {
            setSelectedCareers(selections);
            setActiveCareerTab(selections[0]);
        } else {
            toast({ title: 'No careers selected', description: 'Redirecting.', variant: 'destructive' });
            router.replace('/career-suggestions');
            return;
        }
      }
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);


  useEffect(() => {
    if (activeCareerTab) {
      fetchAndSetRoadmap(activeCareerTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCareerTab, userData]);


  const fetchAndSetRoadmap = async (careerName: string) => {
    const language = userData?.language || 'English'; // Default to English for guests or if not set
    const reportKey = `${careerName.replace(/\s+/g, '_')}_${language}`;

    // 1. Check for saved report in Firestore (for logged-in users)
    if (currentUser && userData?.roadmaps?.[reportKey]) {
      const cachedReport = userData.roadmaps[reportKey];
      if (Date.now() - cachedReport.generatedAt < REPORT_CACHE_DURATION) {
        setCurrentRoadmapMarkdown(cachedReport.markdown);
        toast({ title: 'Report Loaded', description: `Showing saved report for ${careerName}.` });
        return;
      }
    }
    
    // 2. Check for saved report in Local Storage (for guests)
    const localReportKey = `margdarshak_roadmap_${reportKey}`;
    const localCachedData = localStorage.getItem(localReportKey);
    if (!currentUser && localCachedData) {
        const cachedReport: StoredRoadmapData = JSON.parse(localCachedData);
        if (Date.now() - cachedReport.generatedAt < REPORT_CACHE_DURATION) {
            setCurrentRoadmapMarkdown(cachedReport.markdown);
            toast({ title: 'Report Loaded from Cache', description: `Showing cached report for ${careerName}.` });
            return;
        }
    }


    setIsGeneratingReport(true);
    setCurrentRoadmapMarkdown(null);
    toast({ title: `Generating Report for ${careerName}`, description: `This may take a moment... Language: ${language}` });
    
    // 3. Assemble data and generate a new report
    let inputData: GenerateRoadmapInput;
    try {
      let careerDetails: CareerSuggestionFromStorage | undefined;
      let allSuggestionsSource;
      if (currentUser && userData?.allCareerSuggestions) {
          allSuggestionsSource = userData.allCareerSuggestions;
      } else {
          allSuggestionsSource = JSON.parse(localStorage.getItem('margdarshak_all_career_suggestions') || '[]');
      }
      careerDetails = allSuggestionsSource.find((s: CareerSuggestionFromStorage) => s.name === careerName);

      if (!careerDetails) throw new Error(`Details for career "${careerName}" not found.`);

      if (currentUser && userData) {
        const age = differenceInYears(new Date(), parseISO(userData.birthDetails.dateOfBirth));
        const lifePathNum = calculateLifePathNumber(userData.birthDetails.dateOfBirth);
        inputData = {
          userTraits: userData.userTraits,
          country: userData.country,
          userName: userData.name,
          dateOfBirth: userData.birthDetails.dateOfBirth,
          timeOfBirth: userData.birthDetails.timeOfBirth,
          placeOfBirth: userData.birthDetails.placeOfBirth,
          age,
          personalizedAnswers: userData.personalizedAnswers,
          lifePathNumber: lifePathNum,
          careerSuggestion: careerName,
          matchScore: careerDetails.matchScore,
          personalityProfile: careerDetails.personalityProfile,
          preferredLanguage: language,
        };
      } else { // Guest flow
          const guestBirthDetails = JSON.parse(localStorage.getItem('margdarshak_birth_details_guest') || '{}');
          const guestTraits = localStorage.getItem('margdarshak_user_traits') || '';
          const guestAnswers = JSON.parse(localStorage.getItem('margdarshak_personalized_answers') || '{}');
          const guestUserInfo = JSON.parse(localStorage.getItem('margdarshak_user_info_guest') || '{}');


          const age = differenceInYears(new Date(), parseISO(guestBirthDetails.dateOfBirth));
          const lifePathNum = calculateLifePathNumber(guestBirthDetails.dateOfBirth);

          inputData = {
              userTraits: guestTraits,
              country: guestUserInfo.country || 'your country',
              userName: guestUserInfo.name || 'Guest User',
              dateOfBirth: guestBirthDetails.dateOfBirth,
              timeOfBirth: guestBirthDetails.timeOfBirth,
              placeOfBirth: guestBirthDetails.placeOfBirth,
              age,
              personalizedAnswers: guestAnswers,
              lifePathNumber: lifePathNum,
              careerSuggestion: careerName,
              matchScore: careerDetails.matchScore,
              personalityProfile: careerDetails.personalityProfile,
              preferredLanguage: guestUserInfo.language || 'English',
          };
      }
    } catch (error: any) {
        console.error("Error assembling report data:", error);
        toast({ title: 'Error Preparing Report', description: error.message, variant: 'destructive'});
        setIsGeneratingReport(false);
        return;
    }


    try {
      const roadmapOutput = await generateRoadmap(inputData);
      const newMarkdown = roadmapOutput.roadmapMarkdown;
      setCurrentRoadmapMarkdown(newMarkdown);
      
      const newCachedReport: StoredRoadmapData = { markdown: newMarkdown, generatedAt: Date.now(), language: language };
      if (currentUser && userData) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const roadmaps = {...userData.roadmaps, [reportKey]: newCachedReport};
        await setDoc(userDocRef, { roadmaps }, { merge: true });
      } else {
        localStorage.setItem(localReportKey, JSON.stringify(newCachedReport));
      }

      toast({ title: 'Report Generated!', description: `Detailed roadmap for ${careerName} is ready.` });
    } catch (error) {
      console.error(`Error generating roadmap for ${careerName}:`, error);
      toast({ title: `Error Generating Report for ${careerName}`, description: `Could not generate roadmap. Please try again or contact support.`, variant: 'destructive', duration: 7000 });
      setCurrentRoadmapMarkdown(`## Report Generation Failed\n\nWe encountered an error while generating the report for ${careerName}. Please try again later.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (typeof window === 'undefined') return;
    
    if (!roadmapContentRef.current || !currentRoadmapMarkdown || !activeCareerTab) {
      toast({ title: 'Error', description: 'Roadmap content not available for download.', variant: 'destructive' });
      return;
    }
    setIsGeneratingPdf(true);
    toast({ title: 'Generating PDF', description: `Your roadmap PDF is being prepared...` });

    try {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = roadmapContentRef.current;
        const safeUserName = userData?.name.replace(/\s+/g, '_') || 'User';
        const safeCareerName = activeCareerTab.toLowerCase().replace(/\s+/g, '_');
        const filename = `AI_Councel_Report_${safeUserName}_${safeCareerName}.pdf`;

        const opt = {
          margin:       [0.5, 0.5, 0.5, 0.5],
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false, scrollY: -window.scrollY, allowTaint: true },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().from(element).set(opt).save();
        toast({ title: 'PDF Downloaded', description: `Report saved as ${filename}` });
    } catch(err) {
        console.error("Error generating PDF:", err);
        toast({ title: 'PDF Generation Failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">Your Career Roadmaps</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            Detailed reports for {userData?.name || 'Guest'}'s chosen career paths.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 py-4">
          <Tabs value={activeCareerTab || ''} onValueChange={setActiveCareerTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 h-auto sm:h-10">
              {selectedCareers.map(career => (
                <TabsTrigger key={career} value={career} className="py-2 sm:py-1.5 text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap h-full">
                  {career}
                </TabsTrigger>
              ))}
            </TabsList>

            {selectedCareers.map(career => (
              <TabsContent key={career} value={career}>
                {isGeneratingReport && activeCareerTab === career && (
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <LoadingSpinner size={48} />
                    <p className="mt-4 text-muted-foreground">Generating detailed report for {career}...</p>
                  </div>
                )}
                {!isGeneratingReport && activeCareerTab === career && currentRoadmapMarkdown && (
                  <div ref={roadmapContentRef} className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-foreground bg-white p-4 rounded-md">
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
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
         <CardContent className="mt-6 pb-6 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              onClick={handleDownloadPdf} 
              disabled={isGeneratingPdf || isGeneratingReport || !currentRoadmapMarkdown} 
              className="w-full sm:w-auto"
            >
              {isGeneratingPdf ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
              Download PDF ({activeCareerTab})
            </Button>
            <Button onClick={() => router.push('/signup')} variant="outline" className="w-full sm:w-auto">
              <Milestone className="mr-2 h-5 w-5" />
              Start a New Journey
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
