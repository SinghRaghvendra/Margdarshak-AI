'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateContent } from '@/ai/genkit';
import { Loader2, Terminal, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TestPageApi() {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const response = await generateContent("Explain how AI works in a few words");
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Gemini API Test Page</CardTitle>
          <CardDescription>
            Click the button below to send a test prompt to the Gemini API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTest} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Running Test...</span>
              </>
            ) : (
              <>
                <Terminal className="mr-2 h-4 w-4" />
                <span>Run API Test</span>
              </>
            )}
          </Button>
          
          {result && (
            <Alert variant="default">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success, Raghvendra!</AlertTitle>
              <AlertDescription>
                <p className="font-semibold mb-2">The API returned a response:</p>
                <pre className="whitespace-pre-wrap text-sm text-foreground/90 p-2 bg-background/50 rounded-md">
                  {result}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error, Raghvendra!</AlertTitle>
              <AlertDescription>
                <p className="font-semibold mb-2">The API call failed with the following error:</p>
                <p>{error}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
