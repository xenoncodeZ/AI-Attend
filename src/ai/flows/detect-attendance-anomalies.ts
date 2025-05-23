// src/ai/flows/detect-attendance-anomalies.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for detecting anomalies in attendance data using generative AI.
 *
 * detectAttendanceAnomalies - Analyzes attendance data and identifies anomalous patterns.
 * DetectAttendanceAnomaliesInput - The input type for the detectAttendanceAnomalies function.
 * DetectAttendanceAnomaliesOutput - The return type for the detectAttendanceAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAttendanceAnomaliesInputSchema = z.object({
  attendanceData: z
    .string()
    .describe(
      'A CSV formatted string containing attendance records with name and timestamp columns.'
    ),
});
export type DetectAttendanceAnomaliesInput = z.infer<
  typeof DetectAttendanceAnomaliesInputSchema
>;

const DetectAttendanceAnomaliesOutputSchema = z.object({
  summary: z.string().describe('A summary of the detected attendance anomalies.'),
  anomalies: z
    .array(z.string())
    .describe('A list of specific attendance anomalies detected.'),
});
export type DetectAttendanceAnomaliesOutput = z.infer<
  typeof DetectAttendanceAnomaliesOutputSchema
>;

export async function detectAttendanceAnomalies(
  input: DetectAttendanceAnomaliesInput
): Promise<DetectAttendanceAnomaliesOutput> {
  return detectAttendanceAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAttendanceAnomaliesPrompt',
  input: {schema: DetectAttendanceAnomaliesInputSchema},
  output: {schema: DetectAttendanceAnomaliesOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing attendance data and identifying anomalies.

  Analyze the following attendance data, provided as a CSV string, and identify any anomalous patterns such as sudden absences, late arrivals, or other unusual behavior.
  Return a summary of the detected anomalies and a list of specific anomalies.

  Attendance Data:
  {{attendanceData}}

  Summary:
  {{summary}}

  Anomalies:
  {{anomalies}}`,
});

const detectAttendanceAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectAttendanceAnomaliesFlow',
    inputSchema: DetectAttendanceAnomaliesInputSchema,
    outputSchema: DetectAttendanceAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
