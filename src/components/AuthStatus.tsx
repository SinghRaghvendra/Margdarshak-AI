'use client';

import { useUser } from '@/firebase';
import { Badge } from './ui/badge';
import { UserCircle, ShieldAlert } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function AuthStatus() {
  const { user, loading: authLoading } = useUser();

  if (authLoading) {
    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LoadingSpinner size={14} />
            <span>Checking auth...</span>
        </div>
    );
  }

  return (
    <div className="text-xs text-muted-foreground">
      {user ? (
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-green-500" />
          <span>Status: Signed In</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <span>Status: Not Signed In</span>
        </div>
      )}
    </div>
  );
}
