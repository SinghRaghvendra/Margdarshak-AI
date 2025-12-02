
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Sparkles, Loader2, Wand2, CreditCard } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { generateCareerInsights, type CareerInsightsInput, type CareerInsightsOutput } from '@/ai/flows/career-insights-flow';
import ReactMarkdown from 'react-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const INSIGHT_AMOUNT_INR = 29;

interface BirthDetails {
  dateOfBirth: string;
  placeOfBirth: string;
  timeOfBirth: string;
}

const formSchema = z.object({
  career: z.string().min(3, { message: 'Please enter a career name (at least 3 characters).' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CareerInsightsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [insights, setInsights] = useState<CareerInsightsOutput | null>(null);
  const [userInfo, setUserInfo] = useState({ name: 'Guest', email: '', contact: '' });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { career: '' },
  });

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const storedBirthDetails = localStorage.getItem('margdarshak_birth_details');
        const storedUserInfo = localStorage.getItem('margdarshak_user_info');
        
        if (storedBirthDetails && storedUserInfo) {
          setBirthDetails(JSON.parse(storedBirthDetails));
          setUserInfo(JSON.parse(storedUserInfo));
        } else {
          toast({ title: 'Profile data incomplete', description: 'Please complete your profile first.', variant: 'destructive' });
          router.replace('/birth-details');
          return;
        }
      } else {
        toast({ title: 'Not Authenticated', description: 'Redirecting to login.', variant: 'destructive' });
        router.replace('/login');
        return;
      }
      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast, auth]);

  const generateAndShowInsights = async (careerName: string) => {
    if (!birthDetails) {
        toast({ title: 'Error', description: 'Birth details are missing.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    setInsights(null);
    toast({ title: 'Generating New Insights...', description: `Analyzing '${careerName}' based on your profile.`});
    try {
        const input: CareerInsightsInput = {
            selectedCareer: careerName,
            dateOfBirth: birthDetails.dateOfBirth,
            placeOfBirth: birthDetails.placeOfBirth,
            timeOfBirth: birthDetails.timeOfBirth,
        };
        const result = await generateCareerInsights(input);
        setInsights(result);
        toast({ title: 'Insights Ready!', description: `Astrological and Numerological reviews for '${careerName}' are below.`});
    } catch (error: any) {
        console.error('Error generating career insights:', error);
        toast({ title: 'Error Generating Insights', description: error.message || 'Could not generate insights. Please try again.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  }

  const handlePaymentAndGeneration = async (data: FormValues) => {
    setIsLoading(true);
    toast({ title: 'Initializing Payment', description: `for ${data.career} insights.` });

    try {
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: INSIGHT_AMOUNT_INR }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AI Councel',
        description: `On-Demand Insight for ${data.career}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          toast({ title: 'Verifying Payment...', description: 'Please wait.' });
          const verificationResponse = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verificationData = await verificationResponse.json();
          if (verificationData.success) {
            toast({ title: 'Payment Successful!', description: 'Generating your insights now.' });
            await generateAndShowInsights(data.career);
          } else {
            throw new Error(verificationData.error || 'Payment verification failed.');
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.contact,
        },
        theme: { color: '#FDD835' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', function (response: any) {
        toast({
          title: 'Payment Failed',
          description: `${response.error.description} (Reason: ${response.error.reason})`,
          variant: 'destructive',
          duration: 8000,
        });
        setIsLoading(false);
      });
    } catch (error: any) {
      toast({ title: 'Payment Error', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
      setIsLoading(false);
    }
    // We don't set isLoading to false here because the Razorpay handler will take over.
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
  }

  return (
    <div className="py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Wand2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Career Insights On-Demand</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Curious about a different career? Get instant Astrological & Numerological insights based on your birth profile for a small fee.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePaymentAndGeneration)} className="space-y-6">
              <FormField
                control={form.control}
                name="career"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Enter a Career Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Data Scientist, Graphic Designer, Chef" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Initializing...</>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" /> Pay ₹{INSIGHT_AMOUNT_INR} & Generate Insights
                  </>
                )}
              </Button>
            </form>
          </Form>

          {insights && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-center mb-4">Insights for: {form.getValues('career')}</h3>
              <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-xl font-semibold">Astrological Review</AccordionTrigger>
                  <AccordionContent className="prose max-w-none pt-2">
                    <ReactMarkdown>{insights.astrologicalReview}</ReactMarkdown>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-xl font-semibold">Numerological Review</AccordionTrigger>
                  <AccordionContent className="prose max-w-none pt-2">
                    <ReactMarkdown>{insights.numerologicalReview}</ReactMarkdown>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
