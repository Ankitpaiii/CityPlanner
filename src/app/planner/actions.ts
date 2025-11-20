'use server'
import { generateInitialBlueprint } from '@/ai/flows/generate-initial-blueprint'
import { optimizeCityPlanCost } from '@/ai/flows/optimize-city-plan-cost'
import { assessEnvironmentalImpact, type AssessEnvironmentalImpactInput } from '@/ai/flows/assess-environmental-impact'

export async function getInitialPlan(cityDescription: string) {
  const prompt = `
    As a Raw Material Supplier Bot and a Finance Manager Bot, analyze the following city plan description. Your task is to perform two main functions:

    1.  **Raw Material Supply**:
        *   Identify all infrastructure components (e.g., buildings, roads, parks).
        *   List every necessary raw material.
        *   Provide estimated quantities.
        *   Categorize each material as 'Essential' or 'Optional/Luxury'.
        *   State the purpose of each material.

    2.  **Initial Financial Analysis**:
        *   Assign realistic per-unit costs in Indian Rupees (₹) to each material.
        *   Create a costing table with columns: Material, Quantity, Unit Cost, and Total Cost.
        *   Calculate the Subtotal of all materials.
        *   Add a 10% contingency fee.
        *   Calculate the Grand Total.
        *   Indicate the budget status: "Within Budget" or "Exceeds ₹10,00,000 Budget".

    Additionally, generate an initial ASCII art blueprint of the city layout.

    **Output Format**:
    Your entire output must be a single Markdown string. Use the following structure with headings:

    ## Raw Materials

    [Your structured list of materials here]

    ## Cost Estimate

    [Your cost table and summary here]

    ## Initial Blueprint

    [Your ASCII art blueprint here]

    **City Description to Analyze**:
    ${cityDescription}
  `;
  try {
    const result = await generateInitialBlueprint({ cityDescription: prompt });
    return result.blueprint;
  } catch (error) {
    console.error("Error in getInitialPlan:", error);
    throw new Error("Failed to generate the initial plan from AI.");
  }
}

export async function getOptimizedPlan(originalPlanCosting: string) {
  try {
    const result = await optimizeCityPlanCost({
      originalPlanCosting,
      budgetLimit: 1000000
    });
    return result;
  } catch (error) {
    console.error("Error in getOptimizedPlan:", error);
    throw new Error("Failed to generate the optimized cost plan.");
  }
}

export async function getEnvironmentalReport(data: AssessEnvironmentalImpactInput) {
  try {
    const result = await assessEnvironmentalImpact(data);
    return result;
  } catch (error) {
    console.error("Error in getEnvironmentalReport:", error);
    throw new Error("Failed to generate the environmental report.");
  }
}

export async function getFinalBlueprint(originalDescription: string, optimizationExplanation: string) {
  const prompt = `
    As a Builder Bot, your task is to create the final city layout blueprint and provide a comparison summary.

    The original city plan was described as:
    ---
    ${originalDescription}
    ---

    However, it was over budget and has been optimized. The following changes were made:
    ---
    ${optimizationExplanation}
    ---

    Based on these changes, perform the following tasks:

    1.  **Generate Final Blueprint**: Create a new, final ASCII art blueprint that reflects the optimizations.
    2.  **Provide Comparison**: Write a short summary comparing the original plan to the optimized plan, explaining the differences (e.g., fewer commercial blocks, smaller stadium, use of different materials).

    **Output Format**:
    Your entire output must be a single Markdown string. Use the following structure with headings:

    ## Final Blueprint

    [Your new ASCII art blueprint here]

    ## Plan Comparison

    [Your comparison summary here]
    `;
  try {
    const result = await generateInitialBlueprint({ cityDescription: prompt });
    return result.blueprint;
  } catch (error)    {
    console.error("Error in getFinalBlueprint:", error);
    throw new Error("Failed to generate the final blueprint.");
  }
}
