
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateContent } from '@/ai/genai';
import { Loader2, Terminal, AlertTriangle, Wand2, Cpu, FileCog, SlidersHorizontal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const models = [
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-1.0-pro",
  "gemini-1.0-pro-vision",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-ga",
];

export default function TestPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState<string>('Explain how AI works in a few words');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // New state for model selection
  const [selectedModel, setSelectedModel] = useState<string>(models[0]);
  const [region, setRegion] = useState<string>('us-central1');
  const [maxTokens, setMaxTokens] = useState<number>(512);

  const handleTest = async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    if (!selectedModel || !region || !maxTokens) {
        toast({ title: 'Configuration Missing', description: 'Please ensure model, region, and max tokens are set.', variant: 'destructive'});
        return;
    }
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const responseText = await generateContent(prompt, {
          model: selectedModel,
          region: region,
          maxOutputTokens: maxTokens
      });
      setResult(responseText);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary"/>
            Interactive Gemini API Test Page
          </CardTitle>
          <CardDescription>
            Enter a prompt and select model configurations to send to the Gemini API via the server-side helper.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-secondary/30">
            <div className="space-y-2">
                <Label htmlFor="model-select" className="flex items-center gap-1"><Cpu className="h-4 w-4"/>Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model-select">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        {models.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="region-input" className="flex items-center gap-1"><FileCog className="h-4 w-4"/>Region</Label>
                <Input id="region-input" value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g., us-central1" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="tokens-input" className="flex items-center gap-1"><SlidersHorizontal className="h-4 w-4"/>Max Output Tokens</Label>
                <Input id="tokens-input" type="number" value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} placeholder="e.g., 512" />
            </div>
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="prompt-input">Your Prompt</Label>
            <Textarea
              id="prompt-input"
              placeholder="e.g., Write a short poem about space."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <Button onClick={handleTest} disabled={isLoading} className="w-full text-lg py-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Running Test...</span>
              </>
            ) : (
              <>
                <Terminal className="mr-2 h-5 w-5" />
                <span>Run API Test</span>
              </>
            )}
          </Button>
          
          {result && (
            <Alert variant="default">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                <p className="font-semibold mb-2">The API returned a response:</p>
                <pre className="whitespace-pre-wrap text-sm text-foreground/90 p-3 bg-background/50 rounded-md border">
                  {result}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>
                <p className="font-semibold mb-2">The API call failed with the following error:</p>
                <p className="font-mono text-xs">{error}</p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
