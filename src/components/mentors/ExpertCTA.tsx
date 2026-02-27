'use client';

import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ExpertCTA() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <GraduationCap className="h-16 w-16 mb-6 mx-auto md:mx-0 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you an expert mentor or career counselor?</h2>
            <p className="text-xl opacity-90 mb-8">
              Join our global panel of professionals. Help the next generation find their path while growing your own coaching practice.
            </p>
            <Link href="/become-mentor">
              <Button size="lg" variant="secondary" className="font-bold px-8 py-6 text-lg">
                Join Our Expert Panel &rarr;
              </Button>
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
              <h4 className="text-2xl font-bold mb-1">500+</h4>
              <p className="text-sm opacity-80 uppercase tracking-wider font-semibold">Active Students</p>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
              <h4 className="text-2xl font-bold mb-1">₹999</h4>
              <p className="text-sm opacity-80 uppercase tracking-wider font-semibold">Base Payout</p>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
              <h4 className="text-2xl font-bold mb-1">Flex</h4>
              <p className="text-sm opacity-80 uppercase tracking-wider font-semibold">Schedule Your Way</p>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
              <h4 className="text-2xl font-bold mb-1">AI Tools</h4>
              <p className="text-sm opacity-80 uppercase tracking-wider font-semibold">Auto-Transcripts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
