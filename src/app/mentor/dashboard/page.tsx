
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserCheck, 
  Settings, 
  LayoutDashboard, 
  ExternalLink, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  BadgeCheck,
  Zap
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function MentorDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'approved' | 'pending' | 'none'>('none');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      router.push('/login?redirect=/mentor/dashboard');
      return;
    }

    const fetchStatus = async () => {
      try {
        const mentorDoc = await getDoc(doc(db, 'mentors', user.uid));
        const pendingDoc = await getDoc(doc(db, 'mentors_pending', user.uid));
        
        if (mentorDoc.exists()) {
          setProfile(mentorDoc.data());
          setStatus('approved');
        } else if (pendingDoc.exists()) {
          setProfile(pendingDoc.data());
          setStatus('pending');
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user, db, authLoading, router]);

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size={48} /></div>;

  return (
    <div className="bg-secondary/30 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                Expert Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Welcome back, {profile?.name || 'Expert'}. Here's what's happening with your profile.</p>
            </div>
            {status === 'approved' ? (
              <Badge className="bg-green-500 hover:bg-green-600 px-4 py-1.5 text-sm">
                <ShieldCheck className="mr-2 h-4 w-4"/> Verified Expert
              </Badge>
            ) : (
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-bold uppercase tracking-wider">
                Application Pending Review
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sessions</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">--</div>
                <p className="text-xs text-muted-foreground mt-1">Growth tracking starts after first booking.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rating</CardTitle>
                <BadgeCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">New</div>
                <p className="text-xs text-muted-foreground mt-1">Collect reviews from your students.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Services</CardTitle>
                <Zap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profile?.additionalServices?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Custom offerings listed on your profile.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-primary/10 overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Profile Management
                  </CardTitle>
                  <CardDescription>Keep your professional information updated to attract more students.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6 mb-8">
                    <img 
                      src={profile?.imageUrl || 'https://picsum.photos/seed/expert/400/400'} 
                      className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover" 
                      alt="Avatar"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">{profile?.name}</h3>
                      <p className="text-primary font-semibold">{profile?.specialization}</p>
                      <div className="flex gap-2 mt-2">
                        {status === 'approved' && (
                          <Link href={`/mentors/${user?.uid}`}>
                            <Button size="sm" variant="outline" className="h-8">
                              <ExternalLink className="mr-2 h-3 w-3" /> View Public Profile
                            </Button>
                          </Link>
                        )}
                        <Link href="/mentor/profile">
                          <Button size="sm" className="h-8">
                            <Settings className="mr-2 h-3 w-3" /> Edit Profile Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> 
                      Your Specialized Services
                    </h4>
                    {profile?.additionalServices && profile.additionalServices.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.additionalServices.map((service: any, idx: number) => (
                          <div key={idx} className="p-4 border rounded-xl bg-secondary/20">
                            <div className="flex justify-between items-start">
                              <span className="font-bold">{service.title}</span>
                              <span className="text-primary text-sm font-bold">₹{service.price}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-secondary/10 rounded-xl border border-dashed">
                        <p className="text-sm text-muted-foreground mb-4">You haven't added any specialized services yet.</p>
                        <Link href="/mentor/profile">
                          <Button variant="outline" size="sm">Add Your First Service</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="p-4 hover:bg-secondary/20 transition-colors">
                      <p className="text-sm font-medium">Profile last updated</p>
                      <p className="text-xs text-muted-foreground">{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Recently'}</p>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-muted-foreground italic">No new bookings yet.</p>
                      <p className="text-xs text-muted-foreground">Check back once your profile is approved and live.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-primary p-6 rounded-2xl text-primary-foreground shadow-lg">
                <MessageSquare className="h-8 w-8 mb-4 opacity-80" />
                <h4 className="text-lg font-bold mb-2">Need Help?</h4>
                <p className="text-sm opacity-90 mb-4">Contact our support team for help with your expert application or dashboard features.</p>
                <Button variant="secondary" className="w-full font-bold">Email Expert Support</Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
