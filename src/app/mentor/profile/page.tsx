
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserCheck, Globe, Star, Linkedin, Camera, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  name: z.string().min(3, "Full name required"),
  specialization: z.string().min(3, "Specialization required"),
  experienceYears: z.string().transform(v => parseInt(v)).pipe(z.number().min(1)),
  languages: z.string().min(2, "List at least one language"),
  bio: z.string().min(100, "Bio must be at least 100 characters for visibility"),
  linkedin: z.string().url("Valid LinkedIn URL required"),
  imageUrl: z.string().url("Valid profile image URL required").optional().default('https://picsum.photos/seed/expert/400/400'),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function MentorProfilePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'none'>('none');

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      specialization: '',
      experienceYears: '5' as any,
      languages: 'English',
      bio: '',
      linkedin: '',
      imageUrl: '',
    }
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      router.push('/login?redirect=/mentor/profile');
      return;
    }

    const fetchProfile = async () => {
      try {
        // Check approved list
        const mentorDoc = await getDoc(doc(db, 'mentors', user.uid));
        if (mentorDoc.exists()) {
          const data = mentorDoc.data();
          form.reset({
            ...data,
            experienceYears: data.experienceYears.toString() as any,
            languages: data.languages.join(', ')
          } as ProfileValues);
          setStatus('approved');
        } else {
          // Check pending list
          const pendingDoc = await getDoc(doc(db, 'mentors_pending', user.uid));
          if (pendingDoc.exists()) {
            const data = pendingDoc.data();
            form.reset({
              ...data,
              experienceYears: (data.experienceYears || '5').toString() as any,
              languages: (data.languages || ['English']).join(', ')
            } as any);
            setStatus('pending');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, db, authLoading, form, router]);

  async function onSubmit(data: ProfileValues) {
    if (!user || !db) return;

    try {
      const mentorData = {
        ...data,
        userId: user.uid,
        languages: data.languages.split(',').map(l => l.trim()),
        updatedAt: new Date().toISOString(),
        approved: status === 'approved'
      };

      const targetCollection = status === 'approved' ? 'mentors' : 'mentors_pending';
      await setDoc(doc(db, targetCollection, user.uid), mentorData, { merge: true });

      toast({ 
        title: "Profile Updated!", 
        description: status === 'approved' 
          ? "Your changes are now live on the marketplace." 
          : "Your application has been updated and is under review."
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size={48} /></div>;

  return (
    <div className="bg-secondary/30 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm border">
            <div>
              <h1 className="text-3xl font-bold">Professional Expert Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your public presence and marketplace listing.</p>
            </div>
            <div className="flex items-center gap-2">
              {status === 'approved' ? (
                <Badge className="bg-green-500 hover:bg-green-600 px-4 py-1 text-sm"><ShieldCheck className="mr-2 h-4 w-4"/> Verified Expert</Badge>
              ) : (
                <Badge variant="secondary" className="px-4 py-1 text-sm font-bold uppercase tracking-wider">Application Pending</Badge>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-lg">
                  <CardHeader className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer">
                      <img 
                        src={form.watch('imageUrl') || 'https://picsum.photos/seed/expert/400/400'} 
                        className="rounded-full object-cover w-full h-full border-4 border-primary/20"
                        alt="Profile"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white h-8 w-8" />
                      </div>
                    </div>
                    <CardTitle>{form.watch('name') || 'Your Name'}</CardTitle>
                    <CardDescription>{form.watch('specialization') || 'Specialization'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL</FormLabel>
                          <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>Rating: 4.9 (New)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>Visible globally</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCheck className="text-primary"/> Professional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Display Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization Area</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
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
                            <FormLabel>Languages (Comma separated)</FormLabel>
                            <FormControl><Input placeholder="English, Hindi, Telugu" {...field} /></FormControl>
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
                          <FormLabel className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn Profile</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="min-h-[180px] resize-none" 
                              placeholder="Describe your journey, expertise, and how you help students succeed..."
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>This bio appears on your public card. Be impactful.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="bg-secondary/10 flex justify-end p-6">
                    <Button type="submit" size="lg" className="px-8 font-bold" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? <LoadingSpinner className="mr-2" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                      Update Profile
                    </Button>
                  </CardFooter>
                </Card>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
