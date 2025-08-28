
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
import { MailQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email to send a reset link.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(data: ForgotPasswordFormValues) {
    // In a real app, this would trigger a backend service to send a password reset email.
    // Here, we just simulate the success message.
    console.log('Password reset requested for:', data.email);
    toast({
      title: 'Check Your Email',
      description: `If an account exists for ${data.email}, a password reset link has been sent.`,
    });
    // Optionally redirect the user back to the login page after a delay or immediately
    router.push('/login');
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <MailQuestion className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold">
            Forgot Your Password?
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            No problem. Enter your email address below and we'll send you a link to reset it.
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
              <Button type="submit" className="w-full text-lg py-6 mt-2">
                Send Reset Link
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Remembered your password?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
