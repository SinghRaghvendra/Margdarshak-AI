
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, HardDriveDownload, BookUser } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { format } from 'date-fns';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        fetchReports(user.uid);
      } else {
        toast({ title: 'Authentication Error', description: 'You must be logged in to view your reports.', variant: 'destructive' });
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  const fetchReports = async (userId: string) => {
    setIsLoading(true);
    try {
      const reportsQuery = query(
        collection(db, 'generatedReports'),
        where('userId', '==', userId),
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
      toast({ title: 'Error Fetching Reports', description: 'Could not load your report history. Please try again later.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = (report: ReportHistoryItem) => {
    // We need to set the required items in localstorage for the roadmap page to work correctly.
    // This is a bit of a workaround, but it lets us reuse the existing roadmap page.
    
    // 1. The selected careers list (can be mocked with just the one)
    localStorage.setItem('margdarshak_selected_careers_list', JSON.stringify([report.careerName]));

    // 2. All career suggestions (find or mock the one for this report)
    // For simplicity, we'll create a mock suggestion object.
    const mockSuggestion = {
        name: report.careerName,
        matchScore: 'N/A',
        personalityProfile: 'From Saved Report',
        rationale: 'This report was loaded from your saved history.'
    };
    localStorage.setItem('margdarshak_all_career_suggestions', JSON.stringify([mockSuggestion]));

    // 3. Set the payment status
    localStorage.setItem('margdarshak_payment_successful', 'true');

    // 4. Set the specific report markdown in its own cache item so roadmap page can pick it up
    const cachedReportKey = `margdarshak_roadmap_${report.careerName.replace(/\s+/g, '_')}_${report.language}`;
    const cachedReportData = {
        markdown: report.reportMarkdown,
        generatedAt: Date.now(),
        language: report.language
    };
    localStorage.setItem(cachedReportKey, JSON.stringify(cachedReportData));
    
    // 5. Navigate
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
          {reports.length > 0 ? (
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
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
