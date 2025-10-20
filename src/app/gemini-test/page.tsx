
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { testGemini, type TestGeminiOutput } from '@/ai/flows/gemini-test-flow';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AlertCircle, CheckCircle, Wand2 } from 'lucide-react';

export default function GeminiTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<TestGeminiOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTestClick = async () => {
    setIsLoading(true);
    setApiResponse(null);
    setError(null);
    toast({ title: 'Contacting Gemini API...', description: 'Please wait for a response.' });

    try {
      const response = await testGemini();
      setApiResponse(response);
      toast({ title: 'Success!', description: 'Received a response from the Gemini API.' });
    } catch (e: any) {
      console.error('Gemini API test failed:', e);
      setError(e.message || 'An unknown error occurred.');
      toast({ title: 'API Test Failed', description: e.message || 'Could not get a response.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <Wand2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Gemini API Test</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Click the button below to send a test request to the Gemini API and verify its connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <Button onClick={handleTestClick} disabled={isLoading} className="w-full max-w-sm mx-auto text-lg py-6">
            {isLoading ? <LoadingSpinner /> : 'Run Gemini API Test'}
          </Button>

          {apiResponse && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md text-green-800 dark:text-green-300 flex items-center justify-center gap-3">
              <CheckCircle className="h-6 w-6" />
              <div>
                <p className="font-bold">Success:</p>
                <p>"{apiResponse.message}"</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md text-red-800 dark:text-red-300 flex items-center justify-center gap-3">
               <AlertCircle className="h-6 w-6" />
              <div>
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
