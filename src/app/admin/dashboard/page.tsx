'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Activity, 
  Search, 
  Lock, 
  Unlock,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  limit
} from 'firebase/firestore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<'superadmin' | 'support' | 'moderator'>('support');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [pendingMentors, setPendingMentors] = useState<any[]>([]);
  const [activeMentors, setActiveMentors] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isActioning, setIsActioning] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Initial Admin Check
  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }

    const checkAdmin = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setIsAdmin(true);
          setAdminRole(userDoc.data().adminRole || 'superadmin');
        } else {
          toast({ title: "Access Denied", description: "Administrator privileges required.", variant: "destructive" });
          router.push('/');
        }
      } catch (err) {
        console.error("Admin check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [user, db, authLoading, router, toast]);

  // 2. Real-time Subscriptions
  useEffect(() => {
    if (!isAdmin || !db) return;

    // Users Subscription
    const unsubUsers = onSnapshot(query(collection(db, 'users'), limit(50)), (snapshot) => {
      setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Pending Mentors Subscription
    const unsubPending = onSnapshot(collection(db, 'mentors_pending'), (snapshot) => {
      setPendingMentors(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Active Mentors Subscription
    const unsubActiveMentors = onSnapshot(collection(db, 'mentors'), (snapshot) => {
      setActiveMentors(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Payments Subscription
    const unsubPayments = onSnapshot(query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(100)), (snapshot) => {
      setPayments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Reports Subscription
    const unsubReports = onSnapshot(query(collection(db, 'generatedReports'), orderBy('generatedAt', 'desc'), limit(100)), (snapshot) => {
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubUsers();
      unsubPending();
      unsubActiveMentors();
      unsubPayments();
      unsubReports();
    };
  }, [isAdmin, db]);

  // 3. Actions
  const handleApproveMentor = async (mentor: any) => {
    if (!db) return;
    setIsActioning(mentor.id);
    try {
      const mentorData = { ...mentor, approved: true, updatedAt: new Date().toISOString() };
      const { id, ...dataToSave } = mentorData;
      await setDoc(doc(db, 'mentors', mentor.id), dataToSave);
      await updateDoc(doc(db, 'users', mentor.id), { role: 'mentor', isMentor: true });
      await deleteDoc(doc(db, 'mentors_pending', mentor.id));
      toast({ title: "Mentor Approved" });
    } catch (err: any) {
      toast({ title: "Action Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsActioning(null);
    }
  };

  const handleToggleBlock = async (targetUserId: string, currentStatus: boolean) => {
    if (!db) return;
    setIsActioning(targetUserId);
    try {
      await updateDoc(doc(db, 'users', targetUserId), { isBlocked: !currentStatus });
      toast({ title: currentStatus ? "User Unblocked" : "User Blocked" });
    } catch (err: any) {
      toast({ title: "Action Failed", variant: "destructive" });
    } finally {
      setIsActioning(null);
    }
  };

  const handleMakeAdmin = async (targetEmail: string) => {
    if (!db || adminRole !== 'superadmin') return;
    const q = query(collection(db, 'users'), where('email', '==', targetEmail));
    const snap = await getDocs(q);
    if (snap.empty) {
      toast({ title: "User not found", variant: "destructive" });
      return;
    }
    const userDoc = snap.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), { isAdmin: true, adminRole: 'support' });
    toast({ title: `${targetEmail} is now an Admin.` });
  };

  // 4. Analytics Computation
  const stats = useMemo(() => {
    const totalSales = payments.filter(p => p.status === 'SUCCESS').reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
    const superAdmins = allUsers.filter(u => u.isAdmin).length;
    return {
      totalSales,
      totalUsers: allUsers.length,
      pendingCount: pendingMentors.length,
      adminCount: superAdmins
    };
  }, [allUsers, payments, pendingMentors]);

  const salesChartData = useMemo(() => {
    const days: any = {};
    payments.filter(p => p.status === 'SUCCESS').slice(0, 30).forEach(p => {
      const date = p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : new Date(p.createdAt).toLocaleDateString();
      days[date] = (days[date] || 0) + p.amountPaid;
    });
    return Object.keys(days).map(date => ({ date, amount: days[date] })).reverse();
  }, [payments]);

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size={48} /></div>;
  if (!isAdmin) return null;

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-secondary/20 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3 tracking-tight">
              <ShieldCheck className="h-10 w-10 text-primary" />
              Admin Command Center
            </h1>
            <p className="text-muted-foreground font-medium">Monitoring AI Councel Ecosystem • Signed in as {adminRole}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}><Activity className="mr-2 h-4 w-4" /> Live Refresh</Button>
            <Button size="sm"><Download className="mr-2 h-4 w-4" /> Export Ledger</Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Daily Sales (30d)" value={`₹${stats.totalSales.toLocaleString()}`} icon={<DollarSign className="text-green-500" />} trend="+12% from last week" />
          <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-blue-500" />} trend="Active students" />
          <StatCard title="Expert Applications" value={stats.pendingCount} icon={<UserCheck className="text-primary" />} trend="Awaiting review" highlight={stats.pendingCount > 0} />
          <StatCard title="Support Staff" value={stats.adminCount} icon={<ShieldCheck className="text-red-500" />} trend={`Role: ${adminRole}`} />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-background border shadow-sm p-1">
            <TabsTrigger value="overview" className="gap-2"><TrendingUp className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Users & Support</TabsTrigger>
            <TabsTrigger value="mentors" className="gap-2"><UserCheck className="h-4 w-4" /> Experts Panel</TabsTrigger>
            <TabsTrigger value="payments" className="gap-2"><CreditCard className="h-4 w-4" /> Payments</TabsTrigger>
            {adminRole === 'superadmin' && <TabsTrigger value="staff" className="gap-2"><ShieldCheck className="h-4 w-4" /> Staff Roles</TabsTrigger>}
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 shadow-xl border-primary/5">
                <CardHeader>
                  <CardTitle>Sales Velocity</CardTitle>
                  <CardDescription>Daily revenue trends for the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ChartContainer config={{ amount: { label: "Revenue", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesChartData}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              <Card className="shadow-xl border-primary/5">
                <CardHeader>
                  <CardTitle>System Activity</CardTitle>
                  <CardDescription>Recent actions across the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {payments.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border">
                      <div className="bg-green-100 p-2 rounded-full text-green-600"><DollarSign className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-bold">{p.userName}</p>
                        <p className="text-[10px] text-muted-foreground">Purchased {p.planId} • ₹{p.amountPaid}</p>
                      </div>
                    </div>
                  ))}
                  {pendingMentors.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="bg-primary/20 p-2 rounded-full text-primary"><UserCheck className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-bold">New Application</p>
                        <p className="text-[10px] text-muted-foreground">{m.fullName} • {m.specialization}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <Card className="shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Directory</CardTitle>
                  <CardDescription>Manage student accounts and view activity history.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search name or email..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className={u.isBlocked ? 'bg-red-50/50' : ''}>
                        <TableCell className="font-bold">{u.name || 'Anonymous'}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{u.role || 'student'}</Badge></TableCell>
                        <TableCell>
                          {u.isBlocked ? 
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit"><XCircle className="h-3 w-3" /> Blocked</Badge> : 
                            <Badge className="bg-green-500 flex items-center gap-1 w-fit"><CheckCircle2 className="h-3 w-3" /> Active</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/profile?uid=${u.id}`)}><FileText className="mr-2 h-4 w-4" /> View Journey</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {u.isBlocked ? (
                                <DropdownMenuItem className="text-green-600" onClick={() => handleToggleBlock(u.id, true)}><Unlock className="mr-2 h-4 w-4" /> Unblock User</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-destructive" onClick={() => handleToggleBlock(u.id, false)}><Lock className="mr-2 h-4 w-4" /> Block User</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MENTORS TAB */}
          <TabsContent value="mentors">
            <div className="space-y-8">
              {/* Pending Approvals */}
              <Card className="border-primary/20 shadow-lg bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Pending Verification
                  </CardTitle>
                  <CardDescription>Review credentials before listing on marketplace.</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingMentors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground font-medium">No new applications to review.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {pendingMentors.map((m) => (
                        <div key={m.id} className="p-4 bg-background border rounded-xl flex justify-between items-center shadow-sm">
                          <div>
                            <h4 className="font-bold text-lg">{m.fullName || m.name}</h4>
                            <p className="text-sm text-primary font-semibold">{m.specialization} • {m.experienceYears} yrs exp</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{m.bio}"</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => deleteDoc(doc(db, 'mentors_pending', m.id))} className="text-destructive">Reject</Button>
                            <Button size="sm" onClick={() => handleApproveMentor(m)} disabled={isActioning === m.id}>
                              {isActioning === m.id ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                              Approve Profile
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Experts */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Active Mentors Panel</CardTitle>
                  <CardDescription>Live experts visible to students.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Expert</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMentors.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-bold">{m.name}</TableCell>
                          <TableCell className="text-muted-foreground">{m.specialization}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span className="font-medium">{m.rating || 4.9}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge className="bg-green-500">Live</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleToggleBlock(m.id, false)}>Suspend</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PAYMENTS TAB */}
          <TabsContent value="payments">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Transaction Ledger</CardTitle>
                <CardDescription>All report and mentorship purchases.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : new Date(p.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold">{p.userName}</TableCell>
                        <TableCell className="capitalize">{p.planId || 'Mentorship'}</TableCell>
                        <TableCell className="font-mono">₹{p.amountPaid}</TableCell>
                        <TableCell>
                          {p.status === 'SUCCESS' ? 
                            <Badge className="bg-green-600">Success</Badge> : 
                            <Badge variant="destructive">Failed</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STAFF TAB (Superadmin Only) */}
          {adminRole === 'superadmin' && (
            <TabsContent value="staff">
              <Card className="shadow-xl border-red-100">
                <CardHeader>
                  <CardTitle className="text-red-600">Administrative Access</CardTitle>
                  <CardDescription>Grant support and moderation roles to staff members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl border">
                    <Input id="admin-email" placeholder="staff@aicouncel.com" className="bg-background" />
                    <Button onClick={() => handleMakeAdmin((document.getElementById('admin-email') as HTMLInputElement).value)}>
                      Grant Support Role
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Current Staff</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allUsers.filter(u => u.isAdmin).map(staff => (
                        <div key={staff.id} className="p-4 border rounded-xl flex justify-between items-center bg-background shadow-sm">
                          <div>
                            <p className="font-bold">{staff.name || 'Admin User'}</p>
                            <p className="text-xs text-muted-foreground">{staff.email}</p>
                            <Badge variant="secondary" className="mt-1 capitalize">{staff.adminRole || 'support'}</Badge>
                          </div>
                          {staff.id !== user?.uid && (
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => updateDoc(doc(db, 'users', staff.id), { isAdmin: false })}>
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, highlight }: { title: string, value: any, icon: React.ReactNode, trend: string, highlight?: boolean }) {
  return (
    <Card className={`shadow-md transition-all hover:shadow-lg ${highlight ? 'ring-2 ring-primary border-primary/20 bg-primary/5' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black">{value}</div>
        <p className="text-[10px] font-medium text-muted-foreground mt-1 flex items-center gap-1 uppercase">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
