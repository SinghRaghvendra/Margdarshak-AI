
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mentor, MOCK_MENTORS } from '@/lib/mentors-data';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  ArrowLeft,
  Tag,
  Zap,
  Check
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
  
  const [mentor, setMentor] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedService, setSelectedService] = useState<{title: string, price: number} | null>(null);

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) return;
      setIsLoading(true);
      
      const mockMentor = MOCK_MENTORS.find(m => m.id === id);
      
      if (db) {
        try {
          const mentorDoc = await getDoc(doc(db, 'mentors', id as string));
          if (mentorDoc.exists()) {
            setMentor({ id: mentorDoc.id, ...mentorDoc.data() });
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

  const handleBookSession = () => {
    setSelectedService(null);
    setIsBookingOpen(true);
  };

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handlePurchase = async () => {
    if (!user || !db || !mentor) {
      toast({ title: "Login Required", description: "Please log in to proceed with booking.", variant: "destructive" });
      router.push(`/login?redirect=/mentors/${id}`);
      return;
    }

    setIsPurchasing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const bookingData = {
        userId: user.uid,
        userName: user.displayName || 'Student',
        mentorId: mentor.id || id,
        mentorName: mentor.name,
        serviceTitle: selectedService ? selectedService.title : "3-Session Mentorship Pack",
        amountPaid: selectedService ? selectedService.price : 999,
        sessionCredits: selectedService ? 1 : 3,
        paymentStatus: 'SUCCESS',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mentor_bookings'), bookingData);
      
      toast({ 
        title: "Booking Successful!", 
        description: selectedService 
          ? `You have booked '${selectedService.title}' with ${mentor.name}.` 
          : `You have 3 session credits with ${mentor.name}.` 
      });
      
      setIsBookingOpen(false);
      router.push('/my-reports'); 
    } catch (err: any) {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size={48} /></div>;

  if (!mentor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Expert not found</h2>
        <Button onClick={() => router.push('/career-mentors')}>Back to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          className="mb-8 p-0 flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground" 
          onClick={() => router.push('/career-mentors')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Button>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="overflow-hidden shadow-xl border-none ring-1 ring-black/5">
                <div className="aspect-square relative">
                  <img 
                    src={mentor.imageUrl || 'https://picsum.photos/seed/expert/400/400'} 
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
                      <p className="text-xl font-bold">{mentor.rating || 4.9}</p>
                      <div className="flex justify-center text-yellow-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < Math.floor(mentor.rating || 4.9) ? 'fill-current' : ''}`} 
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rating</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-center flex-1">
                      <p className="text-xl font-bold">{mentor.sessionsCompleted || 50}+</p>
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
                      {(Array.isArray(mentor.languages) ? mentor.languages : ['English']).map((lang: string) => (
                        <Badge key={lang} variant="outline" className="px-3 py-1">
                          <Globe className="mr-1 h-3 w-3" /> {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full py-7 text-lg font-bold shadow-lg" onClick={handleBookSession}>
                    Book 3 Sessions for ₹999
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg border-none ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Professional Biography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {mentor.bio}
                  </p>
                  
                  {/* Additional Services */}
                  {mentor.additionalServices && mentor.additionalServices.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Zap className="text-primary h-7 w-7" /> 
                        Specialized Services
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mentor.additionalServices.map((service: any, idx: number) => (
                          <div key={idx} className="p-5 border rounded-2xl bg-primary/5 border-primary/10 flex flex-col justify-between group hover:border-primary/30 transition-colors">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-lg">{service.title}</h5>
                                <span className="text-primary font-bold">₹{service.price}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all" onClick={() => handleBookService(service)}>
                              Book Service
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {mentor.reviews && mentor.reviews.length > 0 && (
                    <div>
                      <h4 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquareQuote className="text-primary h-7 w-7" /> 
                        Student Success Stories
                      </h4>
                      <div className="grid grid-cols-1 gap-6">
                        {mentor.reviews.map((review: any, idx: number) => (
                          <div key={idx} className="bg-secondary/20 p-6 rounded-2xl border border-secondary transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="font-bold">{review.userName}</p>
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
                  )}
                </CardContent>
              </Card>

              <div className="bg-primary/10 border border-primary/20 p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-primary p-4 rounded-full text-primary-foreground shadow-lg">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-xl font-bold mb-2">Verified Expert Identity</h4>
                  <p className="text-muted-foreground">
                    This expert has passed our identity validation and credential audit to ensure you receive the highest quality professional guidance.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <ExpertCTA />

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="text-primary h-6 w-6" />
              {selectedService ? 'Confirm Service Booking' : 'Complete Your Package'}
            </DialogTitle>
            <DialogDescription>
              {selectedService 
                ? `Booking '${selectedService.title}' with ${mentor.name}`
                : `Unlock 3 one-on-one sessions with ${mentor.name}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg">{selectedService ? selectedService.title : "Mentorship Starter Pack"}</span>
                <span className="text-primary font-black text-xl">₹{selectedService ? selectedService.price : 999}</span>
              </div>
              <ul className="text-sm space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> {selectedService ? 'One specialized deep-dive session' : '3 Direct Video Sessions'}</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> {selectedService ? 'Personalized output & roadmap' : '25 Minutes focused per session'}</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary" /> Post-session minutes & summary</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full py-7 text-lg font-bold shadow-xl" onClick={handlePurchase} disabled={isPurchasing}>
              {isPurchasing ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              Pay ₹{selectedService ? selectedService.price : 999} & Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
