
import { config } from 'dotenv';
config();

// Keeping these imports in case they are needed for side-effects,
// but they no longer need to be explicitly registered if they use the new ai object.
import '@/ai/flows/detailed-roadmap.ts';
import '@/ai/flows/career-suggestion.ts';
import '@/ai/flows/career-insights-flow.ts';
