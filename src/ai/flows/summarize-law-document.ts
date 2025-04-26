// 'use server';
/**
 * @fileOverview Summarizes a CA Inter Law document into key points.
 *
 * - summarizeLawDocument - A function that handles the summarization process.
 * - SummarizeLawDocumentInput - The input type for the summarizeLawDocument function.
 * - SummarizeLawDocumentOutput - The return type for the summarizeLawDocument function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeLawDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A CA Inter Law study document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeLawDocumentInput = z.infer<typeof SummarizeLawDocumentInputSchema>;

const SummarizeLawDocumentOutputSchema = z.object({
  summary: z.string().describe('A summary of the key points in the document.'),
});
export type SummarizeLawDocumentOutput = z.infer<typeof SummarizeLawDocumentOutputSchema>;

export async function summarizeLawDocument(input: SummarizeLawDocumentInput): Promise<SummarizeLawDocumentOutput> {
  return summarizeLawDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLawDocumentPrompt',
  input: {
    schema: z.object({
      documentDataUri: z
        .string()
        .describe(
          "A CA Inter Law study document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the key points in the document.'),
    }),
  },
  prompt: `You are an expert in CA Inter Law. Summarize the key points of the following document.  Return a high quality response that can be used for studying.

Document: {{media url=documentDataUri}}`,
});

const summarizeLawDocumentFlow = ai.defineFlow<
  typeof SummarizeLawDocumentInputSchema,
  typeof SummarizeLawDocumentOutputSchema
>(
  {
    name: 'summarizeLawDocumentFlow',
    inputSchema: SummarizeLawDocumentInputSchema,
    outputSchema: SummarizeLawDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
