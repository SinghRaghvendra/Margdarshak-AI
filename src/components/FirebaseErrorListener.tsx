
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

export default function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught a Firestore Permission Error:", error);

      // In a development environment, you might want to throw the error
      // to see it in the Next.js error overlay.
      if (process.env.NODE_ENV === 'development') {
        // This makes the Next.js overlay appear with rich error info
        throw error;
      } else {
        // In production, just show a generic toast
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to perform this action.',
          variant: 'destructive',
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
