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
  answer: z.string().describe('The AI generated answer to the question, formatted with HTML bold tags for headings and line breaks between points.'),
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
      answer: z.string().describe('The AI generated answer to the question, formatted with HTML bold tags for headings and line breaks between points.'),
    }),
  },
  prompt: `You are an expert in CA Inter Law. Please provide a comprehensive answer to the following question in a clear and structured manner. Format the answer as a series of points, each on a new line.  Use HTML &lt;b&gt;bold&lt;/b&gt; tags for headings and subheadings within each point. Each point should be on a new line.

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
