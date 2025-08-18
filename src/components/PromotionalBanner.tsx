
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Info, X, Timer } from 'lucide-react';
import Link from 'next/link';

export default function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    let offerEndTime = localStorage.getItem('margdarshak_offer_end_time');
    if (!offerEndTime) {
      const now = new Date();
      const endTime = now.getTime() + 24 * 60 * 60 * 1000; // 24 hours from now
      offerEndTime = endTime.toString();
      localStorage.setItem('margdarshak_offer_end_time', offerEndTime);
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = Number(offerEndTime) - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground p-3 text-center text-sm relative">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Info className="h-5 w-5 hidden sm:inline-block" />
        <p className="font-medium">
          AI Councel presents Margdarshak – Your AI-powered career guide. Don’t leave your career to chance!
        </p>
        <div className="flex items-center gap-3 bg-background/20 text-primary-foreground px-3 py-1 rounded-full">
           <p className="font-bold">
             Claim your report now: <span className="line-through text-red-300">₹499</span> <span className="text-lg">₹99 only!</span>
           </p>
           {timeLeft && (
            <div className="flex items-center gap-1 font-semibold">
                <Timer className="h-4 w-4" />
                <span>Offer ends in: {timeLeft}</span>
            </div>
           )}
        </div>
         <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          aria-label="Dismiss promotional banner"
        >
            <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
