
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
import { useAuth, useFirestore, useUser } from '@/firebase';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user: authUser, loading: authLoading } = useUser();
  const [pageLoading, setPageLoading] = useState(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  useEffect(() => {
    if (authLoading) {
      setPageLoading(true);
      return;
    }

    if (authUser && db) {
      const checkRole = async () => {
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        const role = userDoc.exists() ? userDoc.data().role : 'student';
        
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect');
        
        if (redirectUrl) {
          router.replace(redirectUrl);
        } else {
          router.replace(role === 'mentor' ? '/mentor/profile' : '/welcome-guest');
        }
      };
      checkRole();
    } else {
      setPageLoading(false);
    }
  }, [authUser, authLoading, router, db]);


  async function onSubmit(data: LoginFormValues) {
    if (!auth || !db) return;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let userProfileForLocal = {
        uid: user.uid,
        email: user.email,
        name: 'Welcome Back', 
        role: 'student'
      };

      if (userDoc.exists()) {
        const userData = userDoc.data();
        userProfileForLocal = {
            ...userProfileForLocal,
            name: userData.name || 'Welcome Back',
            role: userData.role || 'student'
        } as any;
      }
      
      localStorage.setItem('margdarshak_user_info', JSON.stringify(userProfileForLocal));

      toast({
          title: 'Login Successful',
          description: `Welcome back, ${userProfileForLocal.name}!`,
      });

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(userProfileForLocal.role === 'mentor' ? '/mentor/profile' : '/welcome-guest');
      }

    } catch (error: any) {
      toast({
          title: 'Login Failed',
          description: 'Incorrect email or password. Please check your credentials.',
          variant: 'destructive',
      });
    }
  }

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <LogIn className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Log in to your account.</CardDescription>
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
                    <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
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
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? <LoadingSpinner /> : 'Login'}
              </Button>
            </form>
          </Form>
           <div className="mt-6 text-center text-sm space-y-2">
            <p>Don't have an account? <Link href="/signup" className="text-primary hover:underline font-medium">Sign up</Link></p>
            <p className="text-muted-foreground">Are you an expert? <Link href="/mentor/signup" className="text-primary hover:underline font-medium">Join our panel</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
