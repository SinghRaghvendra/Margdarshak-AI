
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Globe, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


const languages = [
  { value: 'English', label: 'English' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Oriya', label: 'Oriya' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Arabic', label: 'Arabic' },
];

const signupFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  contact: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Please enter a valid contact number (e.g., +1234567890).' }),
  country: z.string().min(2, { message: 'Country must be at least 2 characters.' }),
  language: z.string({ required_error: 'Please select a language.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.'}),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (auth.currentUser) {
      toast({ title: 'You are already logged in.' });
      router.replace('/welcome-guest');
    }
  }, [router, toast]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: '',
      email: '',
      contact: '',
      country: '',
      language: 'English',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: SignupFormValues) {
    try {
      const { email, password, name, contact, country, language } = data;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const idToken = await user.getIdToken();

      // Create session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        body: idToken,
      });

      // Now save the extra user info to Firestore
      const userData = {
        uid: user.uid,
        name,
        email,
        contact,
        country,
        language,
        createdAt: new Date(),
      };
      await setDoc(doc(db, "users", user.uid), userData);

      // Clear all previous journey data from localStorage to ensure a clean start
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_')) {
          localStorage.removeItem(key);
        }
      });
      // Now, save only the essential user info
      localStorage.setItem('margdarshak_user_info', JSON.stringify(userData));
      

      toast({
        title: 'Signup Successful!',
        description: 'Redirecting to your journey...',
      });
      router.push('/birth-details');
      
    } catch (error: any) {
      let errorMessage = 'Could not complete signup. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please log in or use a different email.';
      }
      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Signup error:', error);
    }
  }

  if (auth.currentUser) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <UserPlus className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Start your career discovery journey with AI Councel.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} suppressHydrationWarning={true} />
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
                    <FormLabel className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 234 567 8900" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Country" {...field} suppressHydrationWarning={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Globe className="mr-2 h-4 w-4 text-muted-foreground" />Preferred Language for Report</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6 mt-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <LoadingSpinner /> : 'Sign Up & Continue'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
