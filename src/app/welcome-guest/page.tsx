'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, ArrowRight, RotateCw, Play } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

export default function WelcomeGuestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [userName, setUserName] = useState('Guest');
  const [hasProgress, setHasProgress] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const userInfoString = localStorage.getItem('margdarshak_user_info');
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      setUserName(userInfo.name || 'Guest');
      setUserEmail(userInfo.email);
      const progressKey = `margdarshak_test_progress_${userInfo.email}`;
      if (localStorage.getItem(progressKey)) {
        setHasProgress(true);
      }
    } else {
      toast({ title: 'Not logged in', description: 'Redirecting to login.', variant: 'destructive'});
      router.replace('/login');
      return;
    }
    setPageLoading(false);
  }, [router, toast]);
  
  const handleContinue = () => {
    // Just go to the test page, it will automatically load the progress.
    router.push('/psychometric-test');
  };

  const handleStartFresh = () => {
    if (userEmail) {
      const progressKey = `margdarshak_test_progress_${userEmail}`;
      localStorage.removeItem(progressKey);
      
      // Also clear other journey-related data
      localStorage.removeItem('margdarshak_birth_details');
      localStorage.removeItem('margdarshak_user_traits');
      localStorage.removeItem('margdarshak_personalized_answers');
      localStorage.removeItem('margdarshak_selected_careers_list'); 
      localStorage.removeItem('margdarshak_all_career_suggestions');
      localStorage.removeItem('margdarshak_payment_successful');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_roadmap_')) {
          localStorage.removeItem(key);
        }
      });
      
      toast({ title: 'Starting Fresh!', description: 'Your previous assessment progress has been cleared.'});
    }
    router.push('/birth-details');
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg mx-auto shadow-xl text-center">
        <CardHeader>
          <Gift className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Welcome, {userName}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            We're excited to help you on your personalized career discovery journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasProgress ? (
            <>
              <p className="text-muted-foreground">It looks like you have progress saved. What would you like to do?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleContinue} className="w-full text-lg py-6">
                  <Play className="mr-2 h-5 w-5" /> Continue Where You Left Off
                </Button>
                <Button onClick={handleStartFresh} variant="outline" className="w-full text-lg py-6">
                  <RotateCw className="mr-2 h-5 w-5" /> Start Fresh Assessment
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={() => router.push('/birth-details')} className="w-full max-w-sm mx-auto text-lg py-6">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
