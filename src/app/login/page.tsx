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
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (auth.currentUser) {
      router.replace('/');
    }
  }, [router]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Save fetched data to localStorage for other parts of the app to use
        localStorage.setItem('margdarshak_user_info', JSON.stringify({
          uid: user.uid,
          name: userData.name,
          email: userData.email,
          contact: userData.contact,
          country: userData.country,
          language: userData.language,
        }));
        
        // Also cache birth details if they exist in firestore
        if (userData.birthDetails) {
            localStorage.setItem('margdarshak_birth_details', JSON.stringify(userData.birthDetails));
        }

      } else {
         throw new Error("User data not found in database.");
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back! Redirecting...',
      });
      router.push('/welcome-guest');

    } catch (error: any) {
      let errorMessage = 'Invalid credentials. The email or password you entered is incorrect.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        // Firebase provides more specific errors, but we show a generic one.
      } else if (error.message === "User data not found in database.") {
        errorMessage = "Could not retrieve your profile. Please contact support.";
      } else {
        errorMessage = 'An unexpected error occurred during login. Please try again.'
      }

      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Login error:', error);
    }
  }

  if (auth.currentUser) {
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
  );
}
