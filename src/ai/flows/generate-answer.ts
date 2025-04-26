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
  introText: z.string().optional().describe('Introductory text to the answer.'),
  points: z.array(z.string()).optional().describe('Key points related to the question.'),
  descriptions: z.array(z.string()).optional().describe('Descriptions for each key point.'),
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
      introText: z.string().optional().describe('Introductory text to the answer.'),
      points: z.array(z.string()).optional().describe('Key points related to the question.'),
      descriptions: z.array(z.string()).optional().describe('Descriptions for each key point.'),
    }),
  },
  prompt: `You are an expert in CA Inter Law. Please provide a clear and concise answer to the following question. Structure your response into an engaging introduction, key points, and detailed descriptions for each point. Your response must contain the following:

1.  **Introductory Text**: Start with an engaging introduction to the answer, setting the context or background. This part should not be numbered and should be displayed above the table.

2.  **Key Points**: Identify and extract only the key points related to the question.

3.  **Descriptions**: Provide a detailed description for each key point.

Question: {{{question}}}

{{~#if context}}
Context: {{{context}}}
{{~/if}}

Answer:
{
  "introText": "<introductory_text>",
  "points": ["1", "2", "3", ...],
  "descriptions": ["description_for_point_1", "description_for_point_2", "description_for_point_3", ...]
}
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

