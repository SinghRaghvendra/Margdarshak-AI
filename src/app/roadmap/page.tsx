
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinned, Milestone, Download, Loader2, User } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface UserInfo {
  name: string;
}

export default function RoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [roadmapMarkdown, setRoadmapMarkdown] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const roadmapContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedRoadmapMarkdown = localStorage.getItem('margdarshak_roadmap_markdown');
      const career = localStorage.getItem('margdarshak_selected_career');
      const storedUserInfo = localStorage.getItem('margdarshak_user_info');

      if (storedUserInfo) {
        const userInfoParsed: UserInfo = JSON.parse(storedUserInfo);
        setUserName(userInfoParsed.name || 'User');
      }

      if (storedRoadmapMarkdown && career) {
        setRoadmapMarkdown(storedRoadmapMarkdown);
        setSelectedCareer(career);
      } else {
        toast({ title: 'Roadmap not found', description: 'Redirecting to generate roadmap.', variant: 'destructive'});
        router.replace(career ? '/payment' : '/career-suggestions');
      }
    } catch (error) {
       toast({ title: 'Error loading roadmap', description: 'Please try generating it again.', variant: 'destructive'});
       router.replace('/payment');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  const handleDownloadPdf = () => {
    if (!roadmapContentRef.current) {
      toast({ title: 'Error', description: 'Cannot find roadmap content to download.', variant: 'destructive' });
      return;
    }
    setIsGeneratingPdf(true);
    toast({ title: 'Generating PDF', description: 'Your roadmap PDF is being prepared...' });

    const element = roadmapContentRef.current;
    const safeUserName = userName.replace(/\s+/g, '_') || 'User';
    const safeCareerName = selectedCareer?.toLowerCase().replace(/\s+/g, '_') || 'career';
    const filename = `MargdarshakAI_Report_${safeUserName}_${safeCareerName}.pdf`;

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5], // top, right, bottom, left
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save()
      .then(() => {
        toast({ title: 'PDF Downloaded', description: `Your roadmap has been saved as ${filename}` });
      })
      .catch((err) => {
        console.error("Error generating PDF:", err);
        toast({ title: 'PDF Generation Failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
      })
      .finally(() => {
        setIsGeneratingPdf(false);
      });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  if (!roadmapMarkdown || !selectedCareer) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Roadmap Not Available</h1>
        <p className="text-muted-foreground mb-6">We couldn't find your career roadmap.</p>
        <Button onClick={() => router.push('/payment')}>Generate Roadmap</Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-4xl font-bold">Your Comprehensive Career Report</CardTitle>
          <CardDescription className="text-xl text-muted-foreground">
            For <span className="font-semibold text-primary">{userName}</span> pursuing <span className="font-semibold text-primary">{selectedCareer}</span>
          </CardDescription>
        </CardHeader>
        <CardContent ref={roadmapContentRef} className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none px-6 py-4 text-foreground">
          {/* Styles for markdown are in globals.css or can be applied via components prop if needed */}
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
            {roadmapMarkdown}
          </ReactMarkdown>
        </CardContent>
         <CardContent className="mt-6 pb-6 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="w-full sm:w-auto">
              {isGeneratingPdf ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              Download PDF Report
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
