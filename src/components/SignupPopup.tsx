'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Gift } from 'lucide-react';

interface SignupPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignupPopup({ isOpen, onOpenChange }: SignupPopupProps) {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/signup');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-primary shadow-2xl ring-2 ring-primary/50">
        <DialogHeader className="text-center items-center">
            <div className="p-4 bg-primary/20 rounded-full mb-4">
                <Gift className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-extrabold text-foreground">
                <span className='text-primary'>Hurray!</span> Your Career Journey Starts Now!
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground pt-2">
                Sign up now and get an exclusive <strong className="text-primary font-bold">25% discount</strong> on your first personalized career report.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col items-center">
            <Button onClick={handleSignup} size="lg" className="w-full text-lg mt-2 py-6">
                Sign Up & Claim Offer
            </Button>
            <p className="text-xs text-muted-foreground mt-2">*This is a limited-time offer for new users.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
