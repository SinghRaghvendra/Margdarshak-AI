
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Settings, MonitorUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SessionPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEndCall = () => {
    toast({ title: "Session Ended", description: "Meeting minutes will be generated and saved shortly." });
    router.push('/my-reports');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <LoadingSpinner size={48} className="text-primary" />
        <p className="mt-4 animate-pulse">Connecting to secure session {id}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-zinc-900 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold">Career Guidance Session</h1>
            <p className="text-xs text-zinc-400">ID: {id} • Secured by AI Councel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-500 h-2 w-2 rounded-full animate-pulse" />
          <span className="text-xs font-mono">REC • 00:12:45</span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-grow relative grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Remote Participant (Mentor) */}
        <div className="relative rounded-2xl bg-zinc-900 overflow-hidden border border-white/5 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <div className="z-20 absolute bottom-4 left-4 font-semibold text-sm">Mentor (Remote)</div>
          <div className="text-zinc-700 text-6xl font-bold">M</div>
          {/* Real video tag would go here */}
        </div>

        {/* Local Participant (Student) */}
        <div className="relative rounded-2xl bg-zinc-900 overflow-hidden border border-white/5 flex items-center justify-center">
          {!isVideoOn && (
            <div className="absolute inset-0 z-30 bg-zinc-900 flex items-center justify-center">
              <VideoOff className="h-16 w-16 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <div className="z-20 absolute bottom-4 left-4 font-semibold text-sm">You (Self)</div>
          <div className="text-zinc-700 text-6xl font-bold">Y</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-6 bg-zinc-900 border-t border-white/5 flex justify-center items-center gap-4">
        <Button 
          variant={isMicOn ? "secondary" : "destructive"} 
          size="icon" 
          className="rounded-full h-12 w-12"
          onClick={() => setIsMicOn(!isMicOn)}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant={isVideoOn ? "secondary" : "destructive"} 
          size="icon" 
          className="rounded-full h-12 w-12"
          onClick={() => setIsVideoOn(!isVideoOn)}
        >
          {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
          <MonitorUp className="h-5 w-5" />
        </Button>

        <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
          <MessageSquare className="h-5 w-5" />
        </Button>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <Button variant="destructive" size="lg" className="rounded-full px-8 font-bold" onClick={handleEndCall}>
          <PhoneOff className="mr-2 h-5 w-5" /> End Session
        </Button>

        <div className="absolute right-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
