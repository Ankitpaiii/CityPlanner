'use server';

/**
 * @fileOverview Evaluates the environmental impact of a city plan, suggests greener alternatives, and provides a Green Score.
 *
 * - assessEnvironmentalImpact - A function that handles the environmental impact assessment process.
 * - AssessEnvironmentalImpactInput - The input type for the assessEnvironmentalImpact function.
 * - AssessEnvironmentalImpactOutput - The return type for the assessEnvironmentalImpact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessEnvironmentalImpactInputSchema = z.object({
  cityPlanDescription: z
    .string()
    .describe('A description of the city plan, including infrastructure and features.'),
  originalCosting: z.string().optional().describe('The original cost estimate of the city plan.'),
  optimizedCosting: z
    .string()
    .optional()
    .describe('The optimized cost estimate of the city plan, if available.'),
});
export type AssessEnvironmentalImpactInput = z.infer<typeof AssessEnvironmentalImpactInputSchema>;

const AssessEnvironmentalImpactOutputSchema = z.object({
  originalPlanAnalysis: z.object({
    environmentalRisks: z.string().describe('Identified environmental risks of the original plan.'),
    greenScore: z.number().describe('A Green Score (0-100) for the original plan.'),
    greenerAlternatives: z.string().describe('Eco-friendly alternatives for the original plan.'),
  }),
  optimizedPlanAnalysis: z
    .object({
      environmentalRisks: z.string().describe('Identified environmental risks of the optimized plan.'),
      greenScore: z.number().describe('A Green Score (0-100) for the optimized plan.'),
      greenerAlternatives: z.string().describe('Eco-friendly alternatives for the optimized plan.'),
    })
    .optional(),
  finalRecommendation: z
    .string()
    .describe('Final recommendation: Original, Optimized, or Hybrid plan.'),
});
export type AssessEnvironmentalImpactOutput = z.infer<
  typeof AssessEnvironmentalImpactOutputSchema
>;

export async function assessEnvironmentalImpact(
  input: AssessEnvironmentalImpactInput
): Promise<AssessEnvironmentalImpactOutput> {
  return assessEnvironmentalImpactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessEnvironmentalImpactPrompt',
  input: {schema: AssessEnvironmentalImpactInputSchema},
  output: {schema: AssessEnvironmentalImpactOutputSchema},
  prompt: `You are an expert environmental analyst.

You will evaluate the environmental impact of a city plan based on its description, original costing, and optimized costing (if available).

For each plan (original and optimized), identify environmental risks, provide a Green Score (0-100), and suggest eco-friendly alternatives.

Finally, recommend which plan is better overall: Original, Optimized, or a Hybrid approach.

City Plan Description: {{{cityPlanDescription}}}
Original Costing: {{{originalCosting}}}
Optimized Costing: {{{optimizedCosting}}}

Output Format:
For each plan:
Environmental Risks: [List environmental risks]
Green Score: [0-100]
Greener Alternatives: [List eco-friendly alternatives]

Final Recommendation: [Original / Optimized / Hybrid]`,
});

const assessEnvironmentalImpactFlow = ai.defineFlow(
  {
    name: 'assessEnvironmentalImpactFlow',
    inputSchema: AssessEnvironmentalImpactInputSchema,
    outputSchema: AssessEnvironmentalImpactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
