
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, HardDriveDownload, BookUser, Wand2, PlusCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, orderBy, Timestamp, getDoc, doc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { format } from 'date-fns';
import { useAuth, useFirestore } from '@/firebase';
import Link from 'next/link';

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
  const [hasPaid, setHasPaid] = useState(false);

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
  }, [router, toast, auth, db]);

  const fetchUserData = async (user: User) => {
    if (!db) return;
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().paymentSuccessful) {
        setHasPaid(true);
      }
      
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

    // 1. Set flags for previous steps to prevent redirects
    localStorage.setItem('margdarshak_birth_details_completed', 'true');
    localStorage.setItem('margdarshak_test_completed', 'true');
    // We assume if a report exists, these were filled. A simple 'true' string is enough.
    localStorage.setItem('margdarshak_personalized_answers', '{"q1":"...","q2":"...","q3":"...","q4":"...","q5":"..."}');
    localStorage.setItem('margdarshak_user_traits', '{"s1":{"s1q1":1,"s1q2":1},"s2":{"s2q1":"a","s2q2":"a","s2q3":"a"},"s3":{"s3q1":1,"s3q2":1},"s4":{"s4q1":"a"},"s5":{"s5q1":1,"s5q2":"a"}}');
    
    // 2. The selected careers list (can be mocked with just the one)
    localStorage.setItem('margdarshak_selected_careers_list', JSON.stringify([report.careerName]));
    localStorage.setItem('margdarshak_selected_career', report.careerName);


    // 3. All career suggestions (find or mock the one for this report)
    const mockSuggestion = {
        name: report.careerName,
        matchScore: 'N/A',
        personalityProfile: 'From Saved Report',
        rationale: 'This report was loaded from your saved history.'
    };
    localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify([mockSuggestion]));

    // 4. Set the payment status to true for viewing
    localStorage.setItem('margdarshak_payment_successful', 'true');

    // 5. Set the specific report markdown in its own cache item so roadmap page can pick it up
    const cachedReportKey = `margdarshak_roadmap_${report.careerName.replace(/\s+/g, '_')}_${report.language}`;
    const cachedReportData = {
        markdown: report.reportMarkdown,
        generatedAt: Date.now(),
        language: report.language
    };
    localStorage.setItem(cachedReportKey, JSON.stringify(cachedReportData));
    
    // 6. Navigate
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
                <CardDescription>Curious about another career? Get on-demand insights.</CardDescription>
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

    if (hasPaid) {
        return (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">You have no saved reports yet</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Your payment was successful! You can now proceed to your career suggestions to generate your first detailed report.
              </p>
              <Button onClick={() => router.push('/career-suggestions')} className="mt-6">
                Generate Your Report <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
                        View and download your previously generated career reports.
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

    
