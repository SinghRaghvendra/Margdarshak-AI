
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: '',
      email: '',
      contact: '',
      country: '',
      language: 'English', // Default to English
    },
  });

  const clearLocalStorageForNewJourney = () => {
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
    });
  }

  function onSubmit(data: SignupFormValues) {
    try {
      localStorage.setItem('margdarshak_user_info', JSON.stringify(data));
      clearLocalStorageForNewJourney();
      toast({
        title: 'Signup Successful!',
        description: 'Redirecting to gather birth details...',
      });
      router.push('/birth-details');
    } catch (error) {
      toast({
        title: 'Signup Failed',
        description: 'Could not save your information. Please try again.',
        variant: 'destructive',
      });
      console.error('Signup error:', error);
    }
  }

  const handleSkipSignup = () => {
    try {
       localStorage.setItem('margdarshak_user_info', JSON.stringify({ 
         name: 'Guest', 
         email: '', 
         contact: '', 
         country: 'GuestCountry',
         language: 'English' // Default language for guest
        }));
       clearLocalStorageForNewJourney();
       toast({
        title: 'Skipping Signup',
        description: 'Proceeding as Guest to gather birth details.',
      });
      router.push('/birth-details');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not proceed. Please try again.',
        variant: 'destructive',
      });
      console.error('Skip signup error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <UserPlus className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold">
            Join AI Councel
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Create an account or start as a guest to begin your career discovery.
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
                      <Input placeholder="Your Name" {...field} />
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
                      <Input type="email" placeholder="your.email@example.com" {...field} />
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
                      <Input type="tel" placeholder="+1 234 567 8900" {...field} />
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
                      <Input placeholder="Your Country" {...field} />
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
              <Button type="submit" className="w-full text-lg py-6 mt-2">
                Sign Up & Continue
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleSkipSignup} className="text-primary hover:underline">
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
