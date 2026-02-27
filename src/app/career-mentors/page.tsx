'use client';

import { useState, useEffect } from 'react';
import { Mentor, MOCK_MENTORS } from '@/lib/mentors-data';
import MentorCard from '@/components/mentors/MentorCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Users, CalendarCheck, ShieldCheck, Ticket, Loader2, Star, History, Globe, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ExpertCTA from '@/components/mentors/ExpertCTA';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function CareerMentorsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      // Fallback to mock data if db is not ready yet
      setMentors(MOCK_MENTORS);
      setIsLoading(false);
      return;
    }

    const mentorsRef = collection(db, 'mentors');
    const q = query(mentorsRef, where('approved', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mentorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mentor[];
      
      // Merge with MOCK if Firestore is empty for demonstration
      if (mentorsList.length === 0) {
        setMentors(MOCK_MENTORS);
      } else {
        setMentors(mentorsList);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setMentors(MOCK_MENTORS);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const specializations = Array.from(new Set(mentors.map(m => m.specialization)));

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         mentor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = specFilter === 'all' || mentor.specialization === specFilter;
    return matchesSearch && matchesSpec;
  });

  const handleBookClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsBookingOpen(true);
  };

  const handleViewProfile = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsProfileOpen(true);
  };

  const handlePurchasePackage = async () => {
    if (!user || !db || !selectedMentor) {
      toast({ title: "Login Required", description: "Please log in to book a session.", variant: "destructive" });
      router.push('/login?redirect=/career-mentors');
      return;
    }

    setIsPurchasing(true);
    try {
      // MOCK PAYMENT FLOW
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const bookingData = {
        userId: user.uid,
        userName: user.displayName || 'Student',
        mentorId: selectedMentor.id,
        mentorName: selectedMentor.name,
        sessionCredits: 3,
        paymentStatus: 'SUCCESS',
        amountPaid: 999,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'mentor_bookings'), bookingData);
      
      toast({ 
        title: "Package Purchased!", 
        description: `You have 3 session credits with ${selectedMentor.name}. Redirecting to schedule...` 
      });
      
      setIsBookingOpen(false);
      setIsProfileOpen(false);
      router.push('/my-reports'); 
    } catch (err: any) {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="py-12 container mx-auto px-4">
        <header className="text-center mb-12">
          <Users className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Verified Career Mentors & Counselors</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Get personalized guidance from industry experts. Book 3 sessions of 25 minutes each for just <strong className="text-foreground">₹999</strong>.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by name, skills, or bio..." 
              className="pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={specFilter} onValueChange={setSpecFilter}>
            <SelectTrigger className="w-full md:w-[240px] h-12">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Specialization" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={48} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {filteredMentors.map(mentor => (
                <MentorCard key={mentor.id} mentor={mentor} onBook={handleBookClick} onViewProfile={handleViewProfile} />
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-20 bg-card rounded-2xl shadow-sm border border-dashed">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold">No active experts found</h3>
                <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
              </div>
            )}
          </>
        )}
      </div>

      <ExpertCTA />

      {/* Mentor Profile Detail Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <ScrollArea className="flex-grow">
            <div className="relative h-48 sm:h-64 bg-secondary">
              {selectedMentor && (
                <img 
                  src={selectedMentor.imageUrl} 
                  alt={selectedMentor.name} 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-bold">{selectedMentor?.name}</h2>
                <p className="text-primary font-semibold">{selectedMentor?.specialization}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedMentor?.rating}</p>
                    <div className="flex text-yellow-500 mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < Math.floor(selectedMentor?.rating || 0) ? 'fill-current' : ''}`} />)}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedMentor?.sessionsCompleted}</p>
                    <History className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedMentor?.experienceYears}</p>
                    <ShieldCheck className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Years Exp</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor?.languages.map(lang => (
                    <Badge key={lang} variant="secondary"><Globe className="mr-1 h-3 w-3" /> {lang}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-bold mb-2">Professional Bio</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedMentor?.bio}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MessageSquareQuote className="text-primary h-5 w-5" /> 
                  Student Reviews
                </h4>
                <div className="space-y-4">
                  {selectedMentor?.reviews.map((review, idx) => (
                    <div key={idx} className="bg-secondary/30 p-4 rounded-xl border border-secondary">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-sm">{review.userName}</p>
                        <span className="text-[10px] text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex text-yellow-500 mb-2">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                      </div>
                      <p className="text-sm italic text-muted-foreground">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-6 bg-background border-t">
            <Button className="w-full py-6 text-lg font-bold shadow-lg" onClick={() => {
              setIsProfileOpen(false);
              setIsBookingOpen(true);
            }}>
              Book 3 Sessions for ₹999
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Package Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="text-primary h-6 w-6" />
              Book {selectedMentor?.name}
            </DialogTitle>
            <DialogDescription>
              Unlock a personalized guidance package.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">Mentorship Starter Pack</span>
                <span className="text-primary font-bold">₹999</span>
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" /> 3 One-on-One Sessions</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> 25 Minutes per session</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Actionable Roadmap & Minutes</li>
              </ul>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Sessions can be scheduled at your convenience after payment.
            </p>
          </div>
          <DialogFooter>
            <Button className="w-full py-6 text-lg font-bold" onClick={handlePurchasePackage} disabled={isPurchasing}>
              {isPurchasing ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              Pay ₹999 & Book Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
