
'use client';

import { useUser } from '@/firebase';
import LoadingSpinner from './LoadingSpinner';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


export default function AuthBeacon() {
  const { user, loading: authLoading } = useUser();

  const beaconClasses = "h-3 w-3 rounded-full relative flex items-center justify-center";
  const pulseClasses = "absolute h-full w-full rounded-full animate-ping";

  if (authLoading) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <LoadingSpinner size={12} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Checking Authentication</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <div className={cn(beaconClasses, user ? 'bg-green-500' : 'bg-red-500')}>
                    <div className={cn(pulseClasses, user ? 'bg-green-400' : 'bg-red-400')} />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{user ? `Signed In as ${user.email}` : 'Not Signed In'}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
