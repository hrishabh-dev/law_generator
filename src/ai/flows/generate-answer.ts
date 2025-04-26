// src/ai/flows/generate-answer.ts
'use server';
/**
 * @fileOverview An AI agent that answers CA Inter Law questions.
 *
 * - generateAnswer - A function that handles the question answering process.
 * - GenerateAnswerInput - The input type for the generateAnswer function.
 * - GenerateAnswerOutput - The return type for the generateAnswer function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The CA Inter Law question to be answered.'),
  context: z.string().optional().describe('Optional context or legal documents to help answer the question.'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

const GenerateAnswerOutputSchema = z.object({
  answer: z.string().describe('The AI generated answer to the question.'),
});
export type GenerateAnswerOutput = z.infer<typeof GenerateAnswerOutputSchema>;

export async function generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
  return generateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The CA Inter Law question to be answered.'),
      context: z.string().optional().describe('Optional context or legal documents to help answer the question.'),
    }),
  },
  output: {
    schema: z.object({
      answer: z.string().describe('The AI generated answer to the question.'),
    }),
  },
  prompt: `You are an expert in CA Inter Law. Please answer the following question clearly and concisely, presenting the information in a human-like way.

Give a detailed answer, broken down into easily understandable points. Each point should be on a new line, formatted with a numbered index (e.g., "1. [Point 1]").

Question: {{{question}}}

{{~#if context}}
Context: {{{context}}}
{{~/if}}

Answer:
`,
});

const generateAnswerFlow = ai.defineFlow<
  typeof GenerateAnswerInputSchema,
  typeof GenerateAnswerOutputSchema
>({
  name: 'generateAnswerFlow',
  inputSchema: GenerateAnswerInputSchema,
  outputSchema: GenerateAnswerOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
