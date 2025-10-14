
import { config } from 'dotenv';
config();

// This file is used for local development with Genkit.
// It imports the flows that you want to be able to run and test locally.
import '@/ai/flows/career-suggestion.ts';
import '@/ai/flows/detailed-roadmap.ts';
import '@/ai/flows/career-insights-flow.ts';
