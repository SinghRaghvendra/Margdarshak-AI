
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Mail, Phone, Globe, Languages, Cake, MapPin, Edit, FileText, CheckCircle, ListChecks, DollarSign } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useFirebase } from '@/components/FirebaseProvider';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  name: string;
  email: string;
  contact: string;
  country: string;
  language: string;
  birthDetails?: {
    dateOfBirth: string;
    placeOfBirth: string;
    timeOfBirth: string;
  };
  testCompleted?: boolean;
  personalizedAnswers?: Record<string, string>;
  selectedCareersList?: string[];
  paymentSuccessful?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, db } = useFirebase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchProfile(user);
      } else {
        toast({ title: 'Authentication Error', description: 'You must be logged in to view your profile.', variant: 'destructive' });
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast, auth, db]);

  const fetchProfile = async (user: User) => {
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        toast({ title: 'Profile Not Found', description: 'Could not find your profile data.', variant: 'destructive' });
        router.push('/welcome-guest'); // Guide them to start journey
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: 'Error Fetching Profile', description: 'Could not load your profile. Please try again later.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const DetailItem = ({ icon, label, value, children }: { icon: React.ReactNode, label: string, value?: string | React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex items-start gap-4 py-3 border-b last:border-none">
      <div className="text-primary">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {value && <p className="text-md font-semibold text-foreground">{value}</p>}
        {children}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Profile Not Found</h3>
        <p className="text-muted-foreground mt-2">
          We couldn't load your profile. It might not have been created yet.
        </p>
        <Button onClick={() => router.push('/welcome-guest')} className="mt-6">
          Start Your Journey
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserIcon className="h-12 w-12 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">{profile.name}</CardTitle>
              <CardDescription className="text-lg">Your personal and journey details.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold text-primary mb-2">Personal Information</h3>
          <DetailItem icon={<Mail className="h-5 w-5" />} label="Email Address" value={profile.email} />
          <DetailItem icon={<Phone className="h-5 w-5" />} label="Contact Number" value={profile.contact} />
          <DetailItem icon={<Globe className="h-5 w-5" />} label="Country" value={profile.country} />
          <DetailItem icon={<Languages className="h-5 w-5" />} label="Preferred Report Language" value={profile.language} />
          
          <h3 className="text-xl font-semibold text-primary mt-8 mb-2">Birth Details</h3>
          {profile.birthDetails ? (
            <>
              <DetailItem icon={<Cake className="h-5 w-5" />} label="Date of Birth" value={profile.birthDetails.dateOfBirth} />
              <DetailItem icon={<MapPin className="h-5 w-5" />} label="Place & Time of Birth" value={`${profile.birthDetails.placeOfBirth} at ${profile.birthDetails.timeOfBirth}`} />
            </>
          ) : (
             <p className="text-sm text-muted-foreground py-3">Birth details not yet provided.</p>
          )}

          <h3 className="text-xl font-semibold text-primary mt-8 mb-2">Journey Progress</h3>
          <DetailItem icon={<FileText className="h-5 w-5" />} label="Psychometric Test Status">
              {profile.testCompleted ? <Badge variant="default" className="bg-green-600">Completed</Badge> : <Badge variant="secondary">Not Completed</Badge>}
          </DetailItem>
          <DetailItem icon={<CheckCircle className="h-5 w-5" />} label="Personalized Questions">
              {profile.personalizedAnswers ? <Badge variant="default" className="bg-green-600">Answered</Badge> : <Badge variant="secondary">Not Answered</Badge>}
          </DetailItem>
          <DetailItem icon={<ListChecks className="h-5 w-5" />} label="Selected Careers for Report">
              {profile.selectedCareersList && profile.selectedCareersList.length > 0 ? (
                  <ul className="list-disc pl-5 mt-1">
                      {profile.selectedCareersList.map(career => <li key={career}>{career}</li>)}
                  </ul>
              ) : <p className="text-sm text-muted-foreground">No careers selected yet.</p>}
          </DetailItem>
           <DetailItem icon={<DollarSign className="h-5 w-5" />} label="Report Payment Status">
              {profile.paymentSuccessful ? <Badge variant="default" className="bg-green-600">Paid</Badge> : <Badge variant="destructive">Payment Pending</Badge>}
          </DetailItem>
          
          <div className="mt-8 flex justify-end">
              <Button onClick={() => router.push('/welcome-guest')} variant="outline">
                  <Edit className="mr-2 h-4 w-4" /> Go to Welcome Page
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
