'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mentor, MOCK_MENTORS } from '@/lib/mentors-data';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  History, 
  ShieldCheck, 
  Globe, 
  MessageSquareQuote, 
  CalendarCheck, 
  Ticket, 
  Loader2, 
  ArrowLeft
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ExpertCTA from '@/components/mentors/ExpertCTA';

export default function MentorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      // Try Mock first for immediate display
      const mockMentor = MOCK_MENTORS.find(m => m.id === id);
      
      if (db) {
        try {
          const mentorDoc = await getDoc(doc(db, 'mentors', id as string));
          if (mentorDoc.exists()) {
            setMentor({ id: mentorDoc.id, ...mentorDoc.data() } as Mentor);
          } else if (mockMentor) {
            setMentor(mockMentor);
          }
        } catch (error) {
          console.error("Error fetching mentor:", error);
          if (mockMentor) setMentor(mockMentor);
        }
      } else if (mockMentor) {
        setMentor(mockMentor);
      }
      
      setIsLoading(false);
    };

    fetchMentor();
  }, [id, db]);

  const handlePurchasePackage = async () => {
    if (!user || !db || !mentor) {
      toast({ title: "Login Required", description: "Please log in to book a session.", variant: "destructive" });
      router.push(`/login?redirect=/mentors/${id}`);
      return;
    }

    setIsPurchasing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const bookingData = {
        userId: user.uid,
        userName: user.displayName || 'Student',
        mentorId: mentor.id,
        mentorName: mentor.name,
        sessionCredits: 3,
        paymentStatus: 'SUCCESS',
        amountPaid: 999,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mentor_bookings'), bookingData);
      
      toast({ 
        title: "Package Purchased!", 
        description: `You have 3 session credits with ${mentor.name}.` 
      });
      
      setIsBookingOpen(false);
      router.push('/my-reports'); 
    } catch (err: any) {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Mentor not found</h2>
        <Button onClick={() => router.push('/career-mentors')}>Back to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          className="mb-8 hover:bg-transparent p-0 flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground" 
          onClick={() => router.push('/career-mentors')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Button>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="overflow-hidden shadow-xl border-none ring-1 ring-black/5">
                <div className="aspect-square relative">
                  <img 
                    src={mentor.imageUrl} 
                    alt={mentor.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h1 className="text-2xl font-bold">{mentor.name}</h1>
                    <p className="text-primary font-semibold text-sm">{mentor.specialization}</p>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold">{mentor.rating}</p>
                      <div className="flex justify-center text-yellow-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < Math.floor(mentor.rating) ? 'fill-current' : ''}`} 
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rating</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold">{mentor.sessionsCompleted}</p>
                      <History className="h-4 w-4 mx-auto text-primary mb-1" />
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sessions</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold">{mentor.experienceYears}</p>
                      <ShieldCheck className="h-4 w-4 mx-auto text-primary mb-1" />
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Years Exp</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="px-3 py-1 font-semibold">{mentor.specialization}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {mentor.languages.map(lang => (
                        <Badge key={lang} variant="outline" className="px-3 py-1">
                          <Globe className="mr-1 h-3 w-3" /> {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full py-7 text-lg font-bold shadow-lg" onClick={() => setIsBookingOpen(true)}>
                    Book 3 Sessions for ₹999
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg border-none ring-1 ring-black/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">Professional Biography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {mentor.bio}
                  </p>
                  
                  <Separator />

                  <div>
                    <h4 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <MessageSquareQuote className="text-primary h-7 w-7" /> 
                      What Students Are Saying
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      {mentor.reviews.map((review, idx) => (
                        <div key={idx} className="bg-secondary/20 p-6 rounded-2xl border border-secondary transition-all hover:shadow-md">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-bold text-foreground">{review.userName}</p>
                              <div className="flex text-yellow-500 mt-1">
                                {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground bg-background/80 px-2 py-1 rounded uppercase tracking-wider">{review.date}</span>
                          </div>
                          <p className="italic text-muted-foreground leading-relaxed">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verified Badge Section */}
              <div className="bg-primary/10 border border-primary/20 p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-primary p-4 rounded-full text-primary-foreground shadow-lg">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-xl font-bold mb-2">Verified Expert Identity</h4>
                  <p className="text-muted-foreground">
                    This expert has passed AI COUNCEL’s verification process, which includes professional credential audits, background checks, and identity validation to ensure the highest quality of guidance.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <ExpertCTA />

      {/* Booking Package Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="text-primary h-6 w-6" />
              Complete Your Booking
            </DialogTitle>
            <DialogDescription>
              Unlock 1-on-1 guidance with {mentor.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg">Mentorship Starter Pack</span>
                <span className="text-primary font-black text-xl">₹999</span>
              </div>
              <ul className="text-sm space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3"><Ticket className="h-4 w-4 text-primary" /> 3 Direct Video Sessions</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> 25 Minutes focused per session</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Post-session roadmap & minutes</li>
              </ul>
            </div>
            <p className="text-xs text-center text-muted-foreground leading-relaxed px-4">
              Upon successful payment, you will receive session credits to schedule calls at your convenience.
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full py-7 text-lg font-bold shadow-xl" onClick={handlePurchasePackage} disabled={isPurchasing}>
              {isPurchasing ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              Pay ₹999 & Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
