'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  UserCheck, 
  XCircle, 
  ExternalLink, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [pendingMentors, setPendingPendingMentors] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState<string | null>(null);

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
        } else {
          toast({ title: "Access Denied", description: "You do not have administrator privileges.", variant: "destructive" });
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

  useEffect(() => {
    if (!isAdmin || !db) return;

    const unsubscribe = onSnapshot(collection(db, 'mentors_pending'), (snapshot) => {
      const pending = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingPendingMentors(pending);
    });

    return () => unsubscribe();
  }, [isAdmin, db]);

  const handleApprove = async (mentor: any) => {
    if (!db) return;
    setIsActioning(mentor.id);
    try {
      // 1. Create/Update document in the live 'mentors' collection
      const mentorData = {
        ...mentor,
        approved: true,
        updatedAt: new Date().toISOString(),
      };
      // Remove the ID field from the data object before saving
      const { id, ...dataToSave } = mentorData;
      
      await setDoc(doc(db, 'mentors', mentor.id), dataToSave);

      // 2. Update the user's role to mentor
      await updateDoc(doc(db, 'users', mentor.id), {
        role: 'mentor',
        isMentor: true
      });

      // 3. Remove from pending
      await deleteDoc(doc(db, 'mentors_pending', mentor.id));

      toast({ title: "Mentor Approved", description: `${mentor.name} is now live on the marketplace.` });
    } catch (err: any) {
      toast({ title: "Approval Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsActioning(null);
    }
  };

  const handleReject = async (mentor: any) => {
    if (!db) return;
    if (!confirm(`Are you sure you want to reject and delete the application for ${mentor.name}?`)) return;
    
    setIsActioning(mentor.id);
    try {
      await deleteDoc(doc(db, 'mentors_pending', mentor.id));
      toast({ title: "Application Rejected", description: "The pending application has been removed." });
    } catch (err: any) {
      toast({ title: "Rejection Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsActioning(null);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size={48} /></div>;
  if (!isAdmin) return null;

  return (
    <div className="bg-secondary/30 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
                Admin: Review Panel
              </h1>
              <p className="text-muted-foreground mt-1">Review and approve new mentor applications.</p>
            </div>
            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-bold">
              {pendingMentors.length} Pending Applications
            </Badge>
          </div>

          {pendingMentors.length === 0 ? (
            <Card className="text-center py-20 bg-card/50 border-dashed">
              <CardContent>
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-semibold text-muted-foreground">All clear!</h3>
                <p className="text-muted-foreground">There are no pending applications to review at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingMentors.map((mentor) => (
                <Card key={mentor.id} className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-primary/5">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 bg-secondary/20 flex items-center justify-center p-6">
                      <img 
                        src={mentor.imageUrl || 'https://picsum.photos/seed/expert/400/400'} 
                        className="h-24 w-24 rounded-full border-4 border-white shadow-sm object-cover"
                        alt={mentor.name}
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{mentor.name}</h3>
                          <p className="text-primary font-semibold">{mentor.specialization} • {mentor.experienceYears} Years Exp</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                            onClick={() => handleReject(mentor)}
                            disabled={isActioning === mentor.id}
                          >
                            {isActioning === mentor.id ? <Loader2 className="animate-spin h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(mentor)}
                            disabled={isActioning === mentor.id}
                          >
                            {isActioning === mentor.id ? <Loader2 className="animate-spin h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            Approve Profile
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-4">
                        <div className="space-y-2">
                          <p className="font-bold uppercase text-[10px] text-muted-foreground tracking-widest">Biography</p>
                          <p className="text-muted-foreground leading-relaxed italic line-clamp-3">"{mentor.bio}"</p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="font-bold uppercase text-[10px] text-muted-foreground tracking-widest mb-1">Contact & Links</p>
                            <div className="flex gap-4 items-center">
                              <span className="text-muted-foreground">{mentor.email}</span>
                              <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 flex items-center hover:underline">
                                <ExternalLink className="mr-1 h-3 w-3" /> LinkedIn
                              </a>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold uppercase text-[10px] text-muted-foreground tracking-widest mb-1">Languages</p>
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(mentor.languages) ? mentor.languages : [mentor.languages]).map((l: any) => (
                                <Badge key={l} variant="secondary" className="text-[10px]">{l}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {mentor.additionalServices && mentor.additionalServices.length > 0 && (
                        <div className="pt-4 border-t border-dashed">
                          <p className="font-bold uppercase text-[10px] text-muted-foreground tracking-widest mb-2">Specialized Services</p>
                          <div className="flex flex-wrap gap-3">
                            {mentor.additionalServices.map((s: any, i: number) => (
                              <div key={i} className="text-xs bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                <span className="font-bold">{s.title}</span> (₹{s.price})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Manual Approval Required</p>
              <p>Approving a profile will automatically move the expert to the public marketplace and grant them access to the Mentor Dashboard. Ensure you have verified their LinkedIn credentials and professional claims before proceeding.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
