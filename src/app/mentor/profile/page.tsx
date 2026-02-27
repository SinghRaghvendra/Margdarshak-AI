'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserCheck, Globe, Star, Linkedin, Camera, ArrowRight, ShieldCheck, Plus, Trash2, Tag, Image as ImageIcon } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
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
  additionalServices: z.array(z.object({
    title: z.string().min(3, "Service title required"),
    description: z.string().min(10, "Brief description required"),
    price: z.string().transform(v => parseFloat(v)).pipe(z.number().min(1, "Price must be positive")),
  })).default([]),
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
      additionalServices: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionalServices"
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !db) {
      router.push('/login?redirect=/mentor/profile');
      return;
    }

    const fetchProfile = async () => {
      try {
        const mentorDoc = await getDoc(doc(db, 'mentors', user.uid));
        const pendingDoc = await getDoc(doc(db, 'mentors_pending', user.uid));
        
        const existingData = mentorDoc.exists() ? mentorDoc.data() : (pendingDoc.exists() ? pendingDoc.data() : null);
        
        if (existingData) {
          form.reset({
            ...existingData,
            experienceYears: (existingData.experienceYears || 5).toString() as any,
            languages: Array.isArray(existingData.languages) ? existingData.languages.join(', ') : (existingData.languages || 'English'),
            additionalServices: (existingData.additionalServices || []).map((s: any) => ({
              ...s,
              price: s.price.toString() as any
            }))
          } as any);
          setStatus(mentorDoc.exists() ? 'approved' : 'pending');
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
        approved: status === 'approved',
        additionalServices: data.additionalServices
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/mentor/dashboard')} className="rounded-full">
                <ArrowRight className="rotate-180 h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Public Profile Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your identity and marketplace appearance.</p>
              </div>
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
                <Card className="shadow-lg overflow-hidden border-primary/10">
                  <CardHeader className="text-center border-b bg-secondary/10">
                    <div className="relative w-32 h-32 mx-auto group mb-2">
                      <img 
                        src={form.watch('imageUrl') || 'https://picsum.photos/seed/expert/400/400'} 
                        className="rounded-full object-cover w-full h-full border-4 border-white shadow-xl"
                        alt="Profile"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white h-8 w-8" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{form.watch('name') || 'Expert Name'}</CardTitle>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Profile Photo Preview</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Profile Image URL</FormLabel>
                          <FormControl><Input placeholder="Paste image link here..." {...field} /></FormControl>
                          <FormDescription className="text-[10px]">Use a professional portrait URL (PNG/JPG).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Expert Rating</span>
                        <div className="flex items-center gap-1 font-bold text-yellow-600">
                          <Star className="h-3 w-3 fill-current" /> 4.9
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Verification</span>
                        <Badge variant="outline" className="text-[10px] h-5">{status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg border-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCheck className="text-primary h-5 w-5"/> Biography & Skills</CardTitle>
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
                              className="min-h-[150px] resize-none leading-relaxed" 
                              placeholder="Describe your journey, expertise, and how you help students succeed..."
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>Min 100 chars. This is your primary sales pitch to students.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-primary/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2"><Tag className="text-primary h-5 w-5" /> Specialized Services</CardTitle>
                      <CardDescription>Add custom offerings like Mock Interviews or SOP Reviews.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', description: '', price: '499' as any })}>
                      <Plus className="h-4 w-4 mr-1" /> Add New
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.length === 0 && (
                      <div className="text-center py-10 bg-secondary/20 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">You haven't listed any specialized services yet.</p>
                      </div>
                    )}
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-5 border rounded-xl bg-card relative group transition-all hover:ring-1 hover:ring-primary/20">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`additionalServices.${index}.title`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Service Title</FormLabel>
                                <FormControl><Input placeholder="e.g., Mock Technical Interview" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`additionalServices.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (₹)</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`additionalServices.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-3">
                                <FormLabel>Short Description</FormLabel>
                                <FormControl><Textarea placeholder="What will the student get from this?" className="min-h-[60px]" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="bg-secondary/10 flex justify-between p-6">
                    <p className="text-xs text-muted-foreground max-w-xs">Note: Changes to verified profiles may take up to 24 hours to reflect globally.</p>
                    <Button type="submit" size="lg" className="px-10 font-bold shadow-lg" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? <LoadingSpinner className="mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                      Publish Profile
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
