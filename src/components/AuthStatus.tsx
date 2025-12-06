'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn } from 'lucide-react';

export default function AuthStatus() {
  const { user, loading } = useUser();

  if (loading) {
    return <Skeleton className="h-8 w-24" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LogIn className="h-4 w-4" />
        <span>Not Logged In</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <span>{user.displayName || user.email}</span>
    </div>
  );
}
