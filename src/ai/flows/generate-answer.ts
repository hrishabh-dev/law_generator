'use server';
/**
 * @fileOverview An AI agent that answers CA Inter Law questions.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The CA Inter Law question to be answered.'),
  context: z.string().optional().describe('Optional context or legal documents to help answer the question.'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

const GenerateAnswerOutputSchema = z.object({
  answer: z.string().describe('The AI generated answer to the question, formatted in numbered points, each on a new line.'),
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
      answer: z.string().describe('The AI generated answer to the question, formatted in numbered points, each on a new line.'),
    }),
  },
  prompt: `You are an expert in CA Inter Law. Please provide a comprehensive answer to the following question. Format the answer as a numbered list.  Each point should be very concise.

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
  const points = output!.answer.split('\n').filter(point => point.trim() !== '');
  const formattedAnswer = points.map((point, index) => `${index + 1}. ${point.trim()}`).join('\n');
  return {answer: formattedAnswer};
});
