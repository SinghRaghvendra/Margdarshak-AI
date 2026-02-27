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
  Zap,
  Users,
  Calendar,
  History,
  FileText
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MentorDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'approved' | 'pending' | 'none'>('none');
  
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);

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

    // Real-time listener for sessions and bookings
    const unsubBookings = onSnapshot(
      query(collection(db, 'mentor_bookings'), where('mentorId', '==', user.uid), orderBy('createdAt', 'desc'), limit(20)),
      (snapshot) => {
        setActiveBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubSessions = onSnapshot(
      query(collection(db, 'mentor_sessions'), where('mentorId', '==', user.uid), orderBy('scheduledAt', 'desc'), limit(20)),
      (snapshot) => {
        setSessionLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    fetchStatus();
    return () => {
      unsubBookings();
      unsubSessions();
    };
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
              <p className="text-muted-foreground mt-1">Welcome back, {profile?.name || 'Expert'}.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Sessions" value={sessionLogs.length} icon={<TrendingUp className="text-primary" />} trend="All time" />
            <StatCard title="Active Students" value={activeBookings.length} icon={<Users className="text-blue-500" />} trend="Currently enrolled" />
            <StatCard title="Rating" value={profile?.rating || "New"} icon={<BadgeCheck className="text-yellow-500" />} trend="Student reviews" />
            <StatCard title="Services" value={profile?.additionalServices?.length || 0} icon={<Zap className="text-purple-500" />} trend="Active offerings" />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-background border shadow-sm p-1">
              <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
              <TabsTrigger value="students" className="gap-2"><Users className="h-4 w-4" /> My Students</TabsTrigger>
              <TabsTrigger value="sessions" className="gap-2"><History className="h-4 w-4" /> Session History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-lg border-primary/10 overflow-hidden">
                    <CardHeader className="bg-primary/5">
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary" />
                        Profile Summary
                      </CardTitle>
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
                            <Link href="/mentor/profile">
                              <Button size="sm" variant="outline" className="h-8">
                                <Settings className="mr-2 h-3 w-3" /> Edit Profile & Photo
                              </Button>
                            </Link>
                            {status === 'approved' && (
                              <Link href={`/mentors/${user?.uid}`}>
                                <Button size="sm" className="h-8">
                                  <ExternalLink className="mr-2 h-3 w-3" /> Live Profile
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" /> 
                          Specialized Services
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {profile?.additionalServices?.slice(0, 2).map((service: any, idx: number) => (
                            <div key={idx} className="p-4 border rounded-xl bg-secondary/20">
                              <span className="font-bold text-sm">{service.title}</span>
                              <p className="text-primary text-xs font-bold mt-1">₹{service.price}</p>
                            </div>
                          ))}
                          <Link href="/mentor/profile" className="flex items-center justify-center p-4 border rounded-xl border-dashed hover:bg-secondary/10 transition-colors">
                            <span className="text-xs text-muted-foreground font-medium">+ Manage Services</span>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        Quick Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {activeBookings.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No active bookings yet.</p>
                      ) : (
                        activeBookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border">
                            <div className="bg-primary/20 p-2 rounded-full text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{booking.userName}</p>
                              <p className="text-[10px] text-muted-foreground">Credits: {booking.sessionCredits}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="students">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>My Student Log</CardTitle>
                  <CardDescription>People who have booked sessions or purchased packages with you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Service/Package</TableHead>
                        <TableHead>Credits Left</TableHead>
                        <TableHead>Joined On</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-bold">{booking.userName}</TableCell>
                          <TableCell>{booking.serviceTitle || 'Mentorship Pack'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{booking.sessionCredits}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/profile?uid=${booking.userId}`)}>View Profile</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {activeBookings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No students found yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>Completed Sessions</CardTitle>
                  <CardDescription>Archive of your previous guidance calls.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Summary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionLogs.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="text-xs">
                            {session.scheduledAt?.toDate ? session.scheduledAt.toDate().toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell className="font-bold">{session.studentName || 'Student'}</TableCell>
                          <TableCell>
                            <Badge className={session.status === 'completed' ? 'bg-green-500' : ''}>{session.status}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                            {session.summary || 'No summary generated.'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {sessionLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No sessions in the log yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: any, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="shadow-md transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black">{value}</div>
        <p className="text-[10px] font-medium text-muted-foreground mt-1 flex items-center gap-1 uppercase">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
