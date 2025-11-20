'use server';

/**
 * @fileOverview Generates an initial city blueprint based on user-provided features.
 *
 * - generateInitialBlueprint - A function that generates the city blueprint.
 * - CityBlueprintInput - The input type for the generateInitialBlueprint function.
 * - CityBlueprintOutput - The return type for the generateInitialBlueprint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CityBlueprintInputSchema = z.object({
  cityDescription: z
    .string()
    .describe('A detailed description of the desired city layout and features.'),
});
export type CityBlueprintInput = z.infer<typeof CityBlueprintInputSchema>;

const CityBlueprintOutputSchema = z.object({
  blueprint: z.string().describe('The generated city layout blueprint.'),
});
export type CityBlueprintOutput = z.infer<typeof CityBlueprintOutputSchema>;

export async function generateInitialBlueprint(input: CityBlueprintInput): Promise<CityBlueprintOutput> {
  return generateInitialBlueprintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialBlueprintPrompt',
  input: {schema: CityBlueprintInputSchema},
  output: {schema: CityBlueprintOutputSchema},
  prompt: `You are an expert city planner. Based on the user's description, generate an initial city layout blueprint.

City Description: {{{cityDescription}}}

Blueprint:`, 
});

const generateInitialBlueprintFlow = ai.defineFlow(
  {
    name: 'generateInitialBlueprintFlow',
    inputSchema: CityBlueprintInputSchema,
    outputSchema: CityBlueprintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
