'use server';

/**
 * @fileOverview This file defines a Genkit flow to optimize the city plan cost.
 *
 * The flow takes the original cost estimate and a budget limit as input.
 * If the original cost exceeds the budget, the flow identifies expensive optional/luxury materials,
 * replaces them with affordable alternatives or reduces their quantity, and recalculates the optimized cost.
 *
 * - optimizeCityPlanCost - A function that handles the city plan cost optimization process.
 * - OptimizeCityPlanCostInput - The input type for the optimizeCityPlanCost function.
 * - OptimizeCityPlanCostOutput - The return type for the optimizeCityPlanCost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeCityPlanCostInputSchema = z.object({
  originalPlanCosting: z.string().describe('The original city plan costing details.'),
  budgetLimit: z.number().describe('The budget limit for the city plan (in INR).'),
});
export type OptimizeCityPlanCostInput = z.infer<typeof OptimizeCityPlanCostInputSchema>;

const OptimizeCityPlanCostOutputSchema = z.object({
  optimizedPlanCosting: z.string().describe('The optimized city plan costing details within the budget.'),
  explanation: z.string().describe('Explanation of the changes made to the original plan to fit within the budget.'),
});
export type OptimizeCityPlanCostOutput = z.infer<typeof OptimizeCityPlanCostOutputSchema>;

export async function optimizeCityPlanCost(input: OptimizeCityPlanCostInput): Promise<OptimizeCityPlanCostOutput> {
  return optimizeCityPlanCostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCityPlanCostPrompt',
  input: {schema: OptimizeCityPlanCostInputSchema},
  output: {schema: OptimizeCityPlanCostOutputSchema},
  prompt: `You are an expert city planner tasked with optimizing a city plan to fit within a budget.

Your task is to analyze the provided "Original Plan Costing" and bring the "Grand Total" under the "Budget Limit".

**Original Plan Costing**:
{{{originalPlanCosting}}}

**Budget Limit**: ₹{{{budgetLimit}}}

**Instructions**:
1.  **Analyze**: Carefully review the material list and identify items that are expensive, optional, or luxury.
2.  **Optimize**: To reduce the total cost, either suggest more affordable alternative materials or reduce the quantities of expensive items. Be specific (e.g., "Replaced Marble Flooring with Polished Concrete," "Reduced number of decorative statues by 50%").
3.  **Recalculate**: Create a new, complete costing table named "Optimized Cost Estimate". This table MUST include columns for Material, Quantity, Unit Cost, and Total Cost for every single item, even those that were not changed.
4.  **Summarize**: After the table, calculate a new Subtotal, a 10% contingency fee, and a new Grand Total.
5.  **Explain**: Write a clear, concise explanation of the changes you made to achieve the budget target.

**Output Format**:
Your entire output must conform to the JSON schema.
-   The 'optimizedPlanCosting' field must contain the full, recalculated cost table and the new summary (Subtotal, Contingency, Grand Total).
-   The 'explanation' field must describe the specific optimizations you performed.
`,
});

const optimizeCityPlanCostFlow = ai.defineFlow(
  {
    name: 'optimizeCityPlanCostFlow',
    inputSchema: OptimizeCityPlanCostInputSchema,
    outputSchema: OptimizeCityPlanCostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
