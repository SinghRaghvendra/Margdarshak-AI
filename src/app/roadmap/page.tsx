
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPinned, Milestone, Download, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { generateRoadmap, type GenerateRoadmapInput, type GenerateRoadmapOutput } from '@/ai/flows/detailed-roadmap';
import { differenceInYears, parseISO } from 'date-fns';
import { calculateLifePathNumber } from '@/lib/numerology';

interface UserInfo {
  name: string;
  email: string;
  contact: string;
  country: string;
  language: string; // Added language
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

type BaseRoadmapInputDataType = Omit<GenerateRoadmapInput, 'careerSuggestion' | 'matchScore' | 'personalityProfile' | 'preferredLanguage'>;


export default function RoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [activeCareerTab, setActiveCareerTab] = useState<string | null>(null);
  
  const [currentRoadmapMarkdown, setCurrentRoadmapMarkdown] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState<string>('User');
  const [preferredLanguage, setPreferredLanguage] = useState<string>('English'); // Default
  
  const [baseRoadmapInputData, setBaseRoadmapInputData] = useState<BaseRoadmapInputDataType | null>(null);
  const [allCareerSuggestions, setAllCareerSuggestions] = useState<CareerSuggestionFromStorage[]>([]);

  const roadmapContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let languageFromStorage = 'English'; // Default
    try {
      if (localStorage.getItem('margdarshak_payment_successful') !== 'true') {
        toast({ title: 'Payment Required', description: 'Please complete payment to access roadmaps.', variant: 'destructive' });
        router.replace('/payment');
        return;
      }

      const storedUserInfo = localStorage.getItem('margdarshak_user_info');
      const userInfoParsed: UserInfo | null = storedUserInfo ? JSON.parse(storedUserInfo) : null;
      setUserName(userInfoParsed?.name || 'User');
      if (userInfoParsed?.language) {
        setPreferredLanguage(userInfoParsed.language);
        languageFromStorage = userInfoParsed.language;
      }


      const storedSelections = localStorage.getItem('margdarshak_selected_careers_list');
      if (storedSelections) {
        const parsedSelections: string[] = JSON.parse(storedSelections);
        if (parsedSelections.length === 3) {
          setSelectedCareers(parsedSelections);
          setActiveCareerTab(parsedSelections[0]); 
        } else {
          toast({ title: 'Career selection error', description: 'Redirecting.', variant: 'destructive' });
          router.replace('/career-suggestions');
          return;
        }
      } else {
        toast({ title: 'No careers selected', description: 'Redirecting.', variant: 'destructive' });
        router.replace('/career-suggestions');
        return;
      }

      const storedAllSuggestions = localStorage.getItem('margdarshak_all_career_suggestions');
      if (storedAllSuggestions) {
        setAllCareerSuggestions(JSON.parse(storedAllSuggestions));
      } else {
        toast({ title: 'Career suggestion data missing', description: 'Could not load full suggestion details. Redirecting.', variant: 'destructive' });
        router.replace('/career-suggestions');
        return;
      }

      const traits = localStorage.getItem('margdarshak_user_traits');
      const storedBirthDetails = localStorage.getItem('margdarshak_birth_details');
      const storedPersonalizedAnswers = localStorage.getItem('margdarshak_personalized_answers');

      if (!userInfoParsed || !traits || !storedBirthDetails || !storedPersonalizedAnswers) {
        toast({ title: 'Missing data for report', description: 'Please ensure all previous steps are complete. Redirecting.', variant: 'destructive' });
        router.replace('/signup'); 
        return;
      }
      
      const birthDetailsParsed: BirthDetails = JSON.parse(storedBirthDetails);
      const personalizedAnswersParsed: PersonalizedAnswers = JSON.parse(storedPersonalizedAnswers);
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
        userTraits: traits,
        country: userInfoParsed.country,
        userName: userInfoParsed.name,
        dateOfBirth: birthDetailsParsed.dateOfBirth,
        timeOfBirth: birthDetailsParsed.timeOfBirth,
        placeOfBirth: birthDetailsParsed.placeOfBirth,
        age: age,
        personalizedAnswers: personalizedAnswersParsed,
        lifePathNumber: lifePathNum,
        // preferredLanguage is handled separately by the main preferredLanguage state
      });

    } catch (error) {
       toast({ title: 'Error loading roadmap page', description: 'Please try again.', variant: 'destructive'});
       router.replace('/payment');
    } finally {
      setPageLoading(false);
    }
  }, [router, toast]);


  useEffect(() => {
    if (activeCareerTab && baseRoadmapInputData && allCareerSuggestions.length > 0 && preferredLanguage) {
      fetchAndSetRoadmap(activeCareerTab, preferredLanguage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCareerTab, baseRoadmapInputData, allCareerSuggestions, preferredLanguage]);


  const fetchAndSetRoadmap = async (careerName: string, language: string) => {
    if (!baseRoadmapInputData) {
      toast({ title: 'Error', description: 'Cannot generate report, essential data missing.', variant: 'destructive' });
      return;
    }

    const careerDetails = allCareerSuggestions.find(s => s.name === careerName);
    if (!careerDetails) {
        toast({ title: 'Error', description: `Details for career "${careerName}" not found.`, variant: 'destructive' });
        setCurrentRoadmapMarkdown(`## Report Generation Failed\n\nCould not find details for the career: ${careerName}.`);
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
    toast({ title: `Generating ${language} Report for ${careerName}`, description: 'This may take a moment...' });

    const roadmapInput: GenerateRoadmapInput = {
      ...baseRoadmapInputData,
      careerSuggestion: careerName,
      matchScore: careerDetails.matchScore,
      personalityProfile: careerDetails.personalityProfile,
      preferredLanguage: language,
    };

    try {
      const roadmapOutput: GenerateRoadmapOutput = await generateRoadmap(roadmapInput);
      setCurrentRoadmapMarkdown(roadmapOutput.roadmapMarkdown);
      
      const newCachedReport: StoredRoadmapData = { markdown: roadmapOutput.roadmapMarkdown, generatedAt: Date.now(), language: language };
      localStorage.setItem(cachedReportKey, JSON.stringify(newCachedReport));

      toast({ title: 'Report Generated!', description: `Detailed ${language} roadmap for ${careerName} is ready.` });
    } catch (error) {
      console.error(`Error generating ${language} roadmap for ${careerName}:`, error);
      toast({ title: `Error Generating Report for ${careerName}`, description: `Could not generate ${language} roadmap. Please try again or contact support.`, variant: 'destructive', duration: 7000 });
      setCurrentRoadmapMarkdown(`## Report Generation Failed\n\nWe encountered an error while generating the ${language} report for ${careerName}. Please try again later.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!roadmapContentRef.current || !currentRoadmapMarkdown || !activeCareerTab) {
      toast({ title: 'Error', description: 'Roadmap content not available for download.', variant: 'destructive' });
      return;
    }
    setIsGeneratingPdf(true);
    toast({ title: 'Generating PDF', description: `Your ${preferredLanguage} roadmap PDF is being prepared...` });

    const element = roadmapContentRef.current;
    const safeUserName = userName.replace(/\s+/g, '_') || 'User';
    const safeCareerName = activeCareerTab.toLowerCase().replace(/\s+/g, '_');
    const filename = `MargdarshakAI_Report_${safeUserName}_${safeCareerName}_${preferredLanguage}.pdf`;

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
        toast({ title: 'PDF Downloaded', description: `Report for ${activeCareerTab} saved as ${filename}` });
      })
      .catch((err) => {
        console.error("Error generating PDF:", err);
        toast({ title: 'PDF Generation Failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
      })
      .finally(() => {
        setIsGeneratingPdf(false);
      });
  };

  if (pageLoading || !baseRoadmapInputData) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (selectedCareers.length === 0) {
    return ( 
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">No Careers to Display</h1>
        <p className="text-muted-foreground mb-6">It seems your selected careers are missing.</p>
        <Button onClick={() => router.push('/career-suggestions')}>Re-select Careers</Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">Your Career Roadmaps</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            Detailed reports for {userName}'s chosen career paths (Report Language: {preferredLanguage}).
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 py-4">
          <Tabs value={activeCareerTab || selectedCareers[0]} onValueChange={setActiveCareerTab} className="w-full">
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
                    <p className="mt-4 text-muted-foreground">Generating detailed {preferredLanguage} report for {career}...</p>
                  </div>
                )}
                {!isGeneratingReport && activeCareerTab === career && currentRoadmapMarkdown && (
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
                )}
                {!isGeneratingReport && activeCareerTab === career && !currentRoadmapMarkdown && (
                   <div className="text-center py-10">
                        <p className="text-muted-foreground">Report for {career} in {preferredLanguage} will be generated. If this persists, try re-selecting the tab.</p>
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
