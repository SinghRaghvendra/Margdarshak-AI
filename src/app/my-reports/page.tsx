
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, HardDriveDownload, BookUser, Wand2, PlusCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, orderBy, Timestamp, getDoc, doc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { format } from 'date-fns';
import { useAuth, useFirestore } from '@/firebase';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ReportHistoryItem {
  id: string;
  careerName: string;
  language: string;
  generatedAt: Date;
  reportMarkdown: string; // Keep the markdown to pass it for viewing
}

export default function MyReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaidButNoReport, setHasPaidButNoReport] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        fetchUserData(user);
      } else {
        toast({ title: 'Authentication Error', description: 'You must be logged in to view your reports.', variant: 'destructive' });
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, db]);

  const fetchUserData = async (user: User) => {
    if (!db) return;
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const reportsQuery = query(
        collection(db, 'generatedReports'),
        where('userId', '==', user.uid),
        orderBy('generatedAt', 'desc')
      );
      const querySnapshot = await getDocs(reportsQuery);
      const fetchedReports: ReportHistoryItem[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const generatedAtTimestamp = data.generatedAt as Timestamp;
        return {
          id: doc.id,
          careerName: data.careerName,
          language: data.language,
          generatedAt: generatedAtTimestamp ? generatedAtTimestamp.toDate() : new Date(),
          reportMarkdown: data.reportMarkdown,
        };
      });
      setReports(fetchedReports);

      // Check for the specific scenario: paid but no reports generated
      if (userDoc.exists() && userDoc.data().paymentSuccessful && fetchedReports.length === 0) {
        setHasPaidButNoReport(true);
      } else {
        setHasPaidButNoReport(false);
      }

    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({ title: 'Error Fetching Data', description: 'Could not load your report history. Please try again later.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = (report: ReportHistoryItem) => {
    // This function sets all necessary local storage items to bypass the journey checks
    // and take the user directly to the roadmap page.

    // 1. Mock flags for previous steps to prevent redirects
    localStorage.setItem('margdarshak_birth_details_completed', 'true');
    localStorage.setItem('margdarshak_test_completed', 'true');
    localStorage.setItem('margdarshak_personalized_answers_completed', 'true');
    localStorage.setItem('margdarshak_payment_successful', 'true');
    
    const mockSuggestion = {
        name: report.careerName,
        matchScore: 'N/A',
        personalityProfile: 'From Saved Report',
        rationale: 'This report was loaded from your saved history.'
    };
    localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify([mockSuggestion]));
    localStorage.setItem('margdarshak_selected_career', report.careerName);

    // 2. Set the specific report markdown in its own cache item so roadmap page can pick it up
    const cachedReportKey = `margdarshak_roadmap_${report.careerName.replace(/\s+/g, '_')}_view_mode`;
    const cachedReportData = {
        markdown: report.reportMarkdown,
        generatedAt: Date.now(),
        language: report.language
    };
    localStorage.setItem(cachedReportKey, JSON.stringify(cachedReportData));
    
    // 3. Navigate
    toast({ title: `Loading Report: ${report.careerName}`, description: 'Redirecting you to the report view.' });
    router.push('/roadmap');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-muted-foreground">Loading your reports...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (hasPaidButNoReport) {
      return (
        <Alert>
          <AlertTitle className="text-xl font-bold">Payment Complete!</AlertTitle>
          <AlertDescription className="mt-2">
            Your payment was successful. You can now proceed to your career suggestions to generate your first detailed report.
          </AlertDescription>
          <div className="mt-4">
            <Button onClick={() => router.push('/career-suggestions')}>
              Generate Your Paid Report <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Alert>
      );
    }

    if (reports.length > 0) {
      return (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Career</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="hidden sm:table-cell">Generated On</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.careerName}</TableCell>
                  <TableCell>{report.language}</TableCell>
                  <TableCell className="hidden sm:table-cell">{format(report.generatedAt, 'PPP p')}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleViewReport(report)} size="sm">
                      <HardDriveDownload className="mr-2 h-4 w-4" /> View Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Card className="mt-8 bg-accent/30 border-dashed">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="p-3 bg-primary/20 rounded-full">
                <Wand2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle>Explore More Options</CardTitle>
                <CardDescription>Curious about another career? Get on-demand insights for a small fee.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/career-insights">
                <Button className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Get New Career Insights
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      );
    }
    
    // Default: Not paid, no reports
    return (
        <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No Reports Found</h3>
            <p className="text-muted-foreground mt-2">
            You haven't generated any career reports yet.
            </p>
            <Button onClick={() => router.push('/welcome-guest')} className="mt-6">
              Start AI Councel Career Guide
            </Button>
        </div>
    );
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader>
            <div className="flex items-center gap-4">
                <BookUser className="h-12 w-12 text-primary" />
                <div>
                    <CardTitle className="text-3xl font-bold">My Reports</CardTitle>
                    <CardDescription className="text-lg">
                        View, download, or resume generation of your career reports.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
