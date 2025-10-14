
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize googleAI without any parameters.
// This allows it to automatically use Application Default Credentials
// when deployed on Google Cloud, which is the correct and secure way.
export const ai = genkit({
  plugins: [googleAI()],
});
