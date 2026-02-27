
'use client';

import { useState } from 'react';
import { MOCK_MENTORS, Mentor } from '@/lib/mentors-data';
import MentorCard from '@/components/mentors/MentorCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Users, CalendarCheck, ShieldCheck, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CareerMentorsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const specializations = Array.from(new Set(MOCK_MENTORS.map(m => m.specialization)));

  const filteredMentors = MOCK_MENTORS.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         mentor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = specFilter === 'all' || mentor.specialization === specFilter;
    return matchesSearch && matchesSpec;
  });

  const handleBookClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsBookingOpen(true);
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
      // In a real app, go to scheduling calendar
      router.push('/my-reports'); 
    } catch (err: any) {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="py-12 bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <Users className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Find Your Career Mentor</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Get personalized guidance from industry experts. Book 3 sessions of 25 minutes each for just ₹999.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by name, skills, or bio..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={specFilter} onValueChange={setSpecFilter}>
            <SelectTrigger className="w-full md:w-[240px]">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMentors.map(mentor => (
            <MentorCard key={mentor.id} mentor={mentor} onBook={handleBookClick} />
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No mentors found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
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
            <Button className="w-full py-6 text-lg" onClick={handlePurchasePackage} disabled={isPurchasing}>
              {isPurchasing ? "Processing..." : "Pay ₹999 & Book Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
