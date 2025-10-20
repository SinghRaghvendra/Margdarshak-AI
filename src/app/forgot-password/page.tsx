
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import LoadingSpinner from '@/components/LoadingSpinner';


const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email to send a reset link.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    try {
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain of this URL must be in the authorized domains list in the Firebase Console.
        url: `${window.location.origin}/login`,
        // This must be true.
        handleCodeInApp: true,
      };
      
      await sendPasswordResetEmail(auth, data.email, actionCodeSettings);

      toast({
        title: 'Check Your Email',
        description: `A password reset link has been sent to ${data.email}. Please check your spam folder as well.`,
      });
      
    } catch (error: any) {
      let errorMessage = 'Could not send password reset email. Please check the address and try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      }
      toast({
        title: 'Error Sending Email',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error("Password reset error:", error);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <MailQuestion className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold">
            Forgot Your Password?
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            No problem. Enter your email address below and we'll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6 mt-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <LoadingSpinner /> : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Remembered your password?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
