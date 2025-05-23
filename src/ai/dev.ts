import { config } from 'dotenv';
config();

import '@/ai/flows/detect-attendance-anomalies.ts';
import '@/ai/flows/summarize-attendance-anomalies.ts';