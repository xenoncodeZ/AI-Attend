'use server';
/**
 * @fileOverview A flow that uses generative AI to summarize attendance anomalies.
 *
 * - summarizeAttendanceAnomalies - A function that summarizes attendance anomalies.
 * - SummarizeAttendanceAnomaliesInput - The input type for the summarizeAttendanceAnomalies function.
 * - SummarizeAttendanceAnomaliesOutput - The return type for the summarizeAttendanceAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAttendanceAnomaliesInputSchema = z.object({
  anomalies: z
    .string()
    .describe('A description of attendance anomalies, such as sudden absences or late arrivals.'),
});
export type SummarizeAttendanceAnomaliesInput = z.infer<
  typeof SummarizeAttendanceAnomaliesInputSchema
>;

const SummarizeAttendanceAnomaliesOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the identified attendance anomalies.'),
});
export type SummarizeAttendanceAnomaliesOutput = z.infer<
  typeof SummarizeAttendanceAnomaliesOutputSchema
>;

export async function summarizeAttendanceAnomalies(
  input: SummarizeAttendanceAnomaliesInput
): Promise<SummarizeAttendanceAnomaliesOutput> {
  return summarizeAttendanceAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAttendanceAnomaliesPrompt',
  input: {schema: SummarizeAttendanceAnomaliesInputSchema},
  output: {schema: SummarizeAttendanceAnomaliesOutputSchema},
  prompt: `You are an AI assistant that summarizes attendance anomalies for school administrators.

  Given the following description of attendance anomalies, generate a concise summary that highlights the key issues and potential concerns. 

  Anomalies: {{{anomalies}}}
  `,
});

const summarizeAttendanceAnomaliesFlow = ai.defineFlow(
  {
    name: 'summarizeAttendanceAnomaliesFlow',
    inputSchema: SummarizeAttendanceAnomaliesInputSchema,
    outputSchema: SummarizeAttendanceAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
