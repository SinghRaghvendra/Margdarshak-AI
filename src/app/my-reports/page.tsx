'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, HardDriveDownload, BookUser, Wand2, PlusCircle, ArrowRight, AlertTriangle, BadgeDollarSign, Ticket, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { format } from 'date-fns';
import { useAuth, useFirestore } from '@/firebase';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ReportHistoryItem {
  id: string;
  careerName: string;
  language: string;
  plan: string;
  generatedAt: Date;
  reportMarkdown: string; 
}

interface PaymentHistoryItem {
    id: string;
    planId: string;
    amountPaid: number;
    couponUsed: string | null;
    createdAt: Date;
    status: 'SUCCESS' | 'FAILED';
    reportId: string | null;
    utr: string | null;
}

export default function MyReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (user: User) => {
    if (!db) return;
    setIsLoading(true);
    try {
      // Fetch Generated Reports
      const reportsQuery = query(
        collection(db, 'generatedReports'),
        where('userId', '==', user.uid),
        orderBy('generatedAt', 'desc')
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const fetchedReports: ReportHistoryItem[] = reportsSnapshot.docs.map(doc => {
        const data = doc.data();
        const generatedAtTimestamp = data.generatedAt as Timestamp;
        return {
          id: doc.id,
          careerName: data.careerName,
          language: data.language,
          plan: data.plan || 'N/A',
          generatedAt: generatedAtTimestamp ? generatedAtTimestamp.toDate() : new Date(),
          reportMarkdown: data.reportMarkdown,
        };
      });
      setReports(fetchedReports);

      // Fetch Payment History
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const fetchedPayments: PaymentHistoryItem[] = paymentsSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp;
        return {
          id: doc.id,
          planId: data.planId,
          amountPaid: data.amountPaid,
          couponUsed: data.couponUsed || null,
          createdAt: createdAtTimestamp ? createdAtTimestamp.toDate() : new Date(),
          status: data.status,
          reportId: data.reportId || null,
          utr: data.razorpayPaymentId || null,
        }
      });
      setPayments(fetchedPayments);

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({ title: 'Error Fetching Data', description: 'Could not load your history. Please try again later.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
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


  const handleViewReport = (report: ReportHistoryItem) => {
    const viewModeData = {
        markdown: report.reportMarkdown,
        careerName: report.careerName,
        plan: report.plan,
        language: report.language,
        userName: currentUser?.displayName || 'User',
    };
    localStorage.setItem('margdarshak_view_report_data', JSON.stringify(viewModeData));
    toast({ title: `Loading Report: ${report.careerName}`, description: 'Redirecting you to the report view.' });
    router.push('/roadmap');
  };

  const unspentEntitlements = payments.filter(p => p.status === 'SUCCESS' && !p.reportId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-muted-foreground">Loading your history...</p>
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
                    <CardTitle className="text-3xl font-bold">My Reports & Entitlements</CardTitle>
                    <CardDescription className="text-lg">
                        View generated reports and available report credits.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {unspentEntitlements.length > 0 && (
            <Alert className="mb-6 border-primary bg-primary/10">
              <Ticket className="h-4 w-4" />
              <AlertTitle className="font-bold">You have unused report credits!</AlertTitle>
              <AlertDescription>
                You have paid for {unspentEntitlements.length} report(s) that you haven't generated yet.
                <Button size="sm" className="ml-4" onClick={() => router.push('/career-suggestions')}>
                  Generate Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-primary"/>Generated Reports</h3>
          {reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Career</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Generated On</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.careerName}</TableCell>
                    <TableCell className="capitalize">{report.plan}</TableCell>
                    <TableCell className="hidden sm:table-cell">{format(report.generatedAt, 'PPP p')}</TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => handleViewReport(report)} size="sm">
                        <HardDriveDownload className="mr-2 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 border-dashed border-2 rounded-md">
                <p className="text-muted-foreground">You haven't generated any reports yet.</p>
            </div>
          )}

          <h3 className="text-xl font-bold mt-10 mb-4 flex items-center gap-2"><BadgeDollarSign className="text-primary"/>Payment History</h3>
           {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="hidden sm:table-cell">{format(payment.createdAt, 'PPP p')}</TableCell>
                    <TableCell className="sm:hidden">{format(payment.createdAt, 'PP')}</TableCell>
                    <TableCell>
                        <div className="font-medium capitalize">{payment.planId}</div>
                        {payment.couponUsed && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Coupon: <Badge variant="secondary">{payment.couponUsed}</Badge>
                            </div>
                        )}
                    </TableCell>
                    <TableCell>₹{payment.amountPaid.toFixed(2)}</TableCell>
                    <TableCell>
                      {payment.status === 'SUCCESS' ? 
                        <Badge variant="default" className="bg-green-600">Success</Badge> : 
                        <Badge variant="destructive">Failed</Badge>
                      }
                    </TableCell>
                    <TableCell className="font-mono text-xs hidden md:table-cell">{payment.utr || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-8 border-dashed border-2 rounded-md">
                <p className="text-muted-foreground">No payment history found.</p>
                <Button onClick={() => router.push('/welcome-guest')} className="mt-4" variant="outline">
                  Start Your Journey
                </Button>
            </div>
          )}
           <div className="mt-8 flex justify-end">
             <Button onClick={() => fetchUserData(currentUser!)} variant="ghost" disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}/>
                Refresh History
             </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
