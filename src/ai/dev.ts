
import { config } from 'dotenv';
config();

import '@/ai/flows/detailed-roadmap.ts';
import '@/ai/flows/career-suggestion.ts';
import '@/ai/flows/resume-tailor-flow.ts';
// Removed career-insights-flow.ts as it's integrated into detailed-roadmap
