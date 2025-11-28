
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirebase } from '@/components/FirebaseProvider';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, db, authLoading } = useFirebase(); // Use authLoading from context
  const [pageLoading, setPageLoading] = useState(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  useEffect(() => {
    // If the initial auth check is not done, we don't do anything yet.
    if (authLoading) {
      setPageLoading(true);
      return;
    }

    // Once auth is checked, if a user exists, redirect them.
    if (auth.currentUser) {
      router.replace('/welcome-guest');
      // We don't need to set pageLoading to false here, as a redirect is happening.
    } else {
      // If no user, we can show the login page.
      setPageLoading(false);
    }
  }, [auth.currentUser, authLoading, router]);


  async function onSubmit(data: LoginFormValues) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // We no longer call ensureUserProfile here.
      // Instead, we will fetch/create the profile on a subsequent page
      // where the auth state is guaranteed to be stable.

      // For now, let's try to get what we can from the auth user object itself.
      const userProfileForLocal = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'Welcome Back',
      };
      localStorage.setItem('margdarshak_user_info', JSON.stringify(userProfileForLocal));

      // Clear any other stale journey data to start fresh from welcome page logic
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_') && key !== 'margdarshak_user_info') {
          localStorage.removeItem(key);
        }
      });
      
      toast({
          title: 'Login Successful',
          description: 'Welcome back! Redirecting...',
      });
      router.push('/welcome-guest');

    } catch (error: any) {
      console.error('Login error:', error.code);
      if (error.code === 'auth/user-not-found') {
        toast({
            title: 'Login Failed',
            description: 'Email not found. Would you like to sign up?',
            variant: 'destructive',
            action: <Button onClick={() => router.push('/signup')}>Sign Up</Button>,
        });
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
         toast({
            title: 'Login Failed',
            description: 'Incorrect password. Please re-enter your password.',
            variant: 'destructive',
        });
      } else {
        toast({
            title: 'Login Failed',
            description: 'An unexpected error occurred. Please check your credentials and try again.',
            variant: 'destructive',
        });
      }
    }
  }

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }


  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-6">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <LogIn className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle className="text-3xl font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Log in to continue your journey.
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Your Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="text-right text-sm">
                  <Link href="/forgot-password" passHref>
                    <span className="text-primary hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </Link>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
                     {form.formState.isSubmitting ? <LoadingSpinner /> : 'Login & Continue Journey'}
                  </Button>
                </div>
              </form>
            </Form>
             <div className="mt-6 text-center text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
