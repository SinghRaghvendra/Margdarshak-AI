'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, GraduationCap, Briefcase, Languages, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ExpertCTA from '@/components/mentors/ExpertCTA';

const mentorSchema = z.object({
  fullName: z.string().min(3, "Name required"),
  specialization: z.string().min(3, "Specialization required"),
  experienceYears: z.string().transform(v => parseInt(v)).pipe(z.number().min(1)),
  languages: z.string().min(2, "List at least one language"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  linkedin: z.string().url("Valid LinkedIn URL required"),
});

type MentorFormValues = z.infer<typeof mentorSchema>;

export default function BecomeMentorPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MentorFormValues>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      fullName: '',
      specialization: '',
      experienceYears: '1' as any,
      languages: '',
      bio: '',
      linkedin: '',
    }
  });

  async function onSubmit(data: MentorFormValues) {
    if (!user || !db) {
      toast({ title: "Login Required", description: "Please log in to apply as a mentor.", variant: "destructive" });
      router.push('/login?redirect=/become-mentor');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'mentors_pending'), {
        ...data,
        userId: user.uid,
        email: user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast({ 
        title: "Application Submitted!", 
        description: "We'll review your profile and get back to you within 48 hours." 
      });
      router.push('/');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-secondary/30 min-h-screen">
      <ExpertCTA />
      
      <div className="py-12 container mx-auto px-4">
        <Card className="max-w-2xl mx-auto shadow-2xl border-primary/10">
          <CardHeader className="text-center">
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
              <UserCheck className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Apply to the Expert Panel</CardTitle>
            <CardDescription className="text-lg">
              Share your wisdom, guide the next generation, and earn while you do it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Dr. Jane Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl><Input placeholder="e.g. Fintech, AI, Law" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages Spoken</FormLabel>
                        <FormControl><Input placeholder="English, Hindi, etc." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile URL</FormLabel>
                      <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell students about your journey and how you can help them..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Minimum 50 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full py-7 text-lg font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                  Submit Application
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="bg-secondary/20 flex flex-col items-center p-6 text-center">
            <p className="text-sm text-muted-foreground max-w-md">
              By applying, you agree to our Mentor Terms of Service and Code of Conduct. We value integrity and professional ethics above all.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
