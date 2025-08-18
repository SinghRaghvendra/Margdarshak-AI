
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';
import Link from 'next/link';

export default function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-accent text-accent-foreground p-3 text-center text-sm relative">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Info className="h-5 w-5 hidden sm:inline-block" />
        <p>
          AICouncel has created the Margdarshak app to help people find their right career with the help of AI. 
          <Link href="/signup" passHref>
            <Button variant="link" className="p-0 h-auto ml-1 text-accent-foreground font-bold hover:underline">
               For just ₹99, get your own report now!
            </Button>
          </Link>
        </p>
         <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent-foreground/20 transition-colors"
          aria-label="Dismiss promotional banner"
        >
            <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
