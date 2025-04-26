// src/ai/flows/generate-practice-questions.ts
'use server';
/**
 * @fileOverview Generates practice questions for CA Inter Law based on a specified topic.
 *
 * - generatePracticeQuestions - A function that generates practice questions.
 * - GeneratePracticeQuestionsInput - The input type for the generatePracticeQuestions function.
 * - GeneratePracticeQuestionsOutput - The return type for the generatePracticeQuestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePracticeQuestionsInputSchema = z.object({
  topic: z
    .string()
    .describe('The specific topic in CA Inter Law for which to generate practice questions.'),
  numQuestions: z.number().default(5).describe('Number of practice questions to generate.'),
});
export type GeneratePracticeQuestionsInput = z.infer<typeof GeneratePracticeQuestionsInputSchema>;

const GeneratePracticeQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of practice questions related to the specified topic.'),
});
export type GeneratePracticeQuestionsOutput = z.infer<typeof GeneratePracticeQuestionsOutputSchema>;

export async function generatePracticeQuestions(
  input: GeneratePracticeQuestionsInput
): Promise<GeneratePracticeQuestionsOutput> {
  return generatePracticeQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePracticeQuestionsPrompt',
  input: {
    schema: z.object({
      topic: z
        .string()
        .describe('The specific topic in CA Inter Law for which to generate practice questions.'),
      numQuestions: z.number().describe('Number of practice questions to generate.'),
    }),
  },
  output: {
    schema: z.object({
      questions: z.array(z.string()).describe('An array of practice questions related to the specified topic.'),
    }),
  },
  prompt: `You are an expert CA Inter Law exam question generator.

  Generate {{numQuestions}} practice questions for the following topic:

  Topic: {{{topic}}}

  Format the questions as a numbered list.
  `,
});

const generatePracticeQuestionsFlow = ai.defineFlow<
  typeof GeneratePracticeQuestionsInputSchema,
  typeof GeneratePracticeQuestionsOutputSchema
>(
  {
    name: 'generatePracticeQuestionsFlow',
    inputSchema: GeneratePracticeQuestionsInputSchema,
    outputSchema: GeneratePracticeQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
