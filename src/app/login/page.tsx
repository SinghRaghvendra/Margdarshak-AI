'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if user is already logged in
    if (localStorage.getItem('margdarshak_user_info')) {
      toast({ title: 'You are already logged in.' });
      router.replace('/');
    }
  }, [router, toast]);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const clearLocalStorageForNewJourney = () => {
    // Intentionally keep user info and test progress
    const userInfo = localStorage.getItem('margdarshak_user_info');
    const userEmail = userInfo ? JSON.parse(userInfo).email : null;
    const progressKey = userEmail ? `margdarshak_test_progress_${userEmail}` : null;
    const progressData = progressKey ? localStorage.getItem(progressKey) : null;

    localStorage.removeItem('margdarshak_birth_details');
    localStorage.removeItem('margdarshak_user_traits');
    localStorage.removeItem('margdarshak_personalized_answers');
    localStorage.removeItem('margdarshak_selected_careers_list');
    localStorage.removeItem('margdarshak_all_career_suggestions');
    localStorage.removeItem('margdarshak_payment_successful');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('margdarshak_roadmap_')) {
        localStorage.removeItem(key);
      }
      // Also clear old progress if key format changes or is generic
      if (key.startsWith('margdarshak_test_progress_') && key !== progressKey) {
        localStorage.removeItem(key);
      }
    });
     // Restore progress for the current user
    if (progressKey && progressData) {
      localStorage.setItem(progressKey, progressData);
    }
  }

  function onSubmit(data: LoginFormValues) {
    const storedUserInfo = localStorage.getItem('margdarshak_user_info');
    
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      if (userInfo.email === data.email && userInfo.password === data.password) {
        
        clearLocalStorageForNewJourney(); 
        
        toast({
          title: 'Login Successful',
          description: 'Redirecting to your journey...',
        });

        // Check for progress and redirect accordingly
        const progressKey = `margdarshak_test_progress_${data.email}`;
        const progress = localStorage.getItem(progressKey);
        
        if (progress) {
          router.push('/psychometric-test');
        } else if (localStorage.getItem('margdarshak_birth_details')) {
          router.push('/psychometric-test');
        } else {
          router.push('/birth-details');
        }

      } else {
        toast({
          title: 'Invalid Credentials',
          description: 'The email or password you entered is incorrect.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'User not found',
        description: 'No user data found. Please sign up first.',
        variant: 'destructive',
      });
      router.push('/signup');
    }
  }

  if (typeof window !== 'undefined' && localStorage.getItem('margdarshak_user_info')) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <LogIn className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Log in to your account to continue your career journey.
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
              <Button type="submit" className="w-full text-lg py-6 mt-2">
                Login
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
