'use server'
import { generateInitialBlueprint } from '@/ai/flows/generate-initial-blueprint'
import { optimizeCityPlanCost } from '@/ai/flows/optimize-city-plan-cost'
import { assessEnvironmentalImpact, type AssessEnvironmentalImpactInput } from '@/ai/flows/assess-environmental-impact'

export async function getInitialPlan(cityDescription: string) {
  const prompt = `
    You are an AI city planning assistant. Your task is to generate a multi-part city plan based on a user's description.

    **City Description**:
    ${cityDescription}

    ---

    **Instructions**:
    You must generate a response with four distinct sections, formatted exactly as shown below using Markdown headings.

    **1. Raw Materials Section:**
    - Start with the heading: \`## Raw Materials\`
    - Analyze the city description to identify key infrastructure (e.g., buildings, roads, parks).
    - Create a bulleted list of all necessary raw materials.
    - For each material, provide an estimated quantity (e.g., tons, cubic meters).
    - Example: \`- Steel: 10,000 tons\`

    **2. Cost Estimate Section:**
    - Start with the heading: \`## Cost Estimate\`
    - Create a Markdown table with the columns: | Material | Quantity | Unit Cost (INR) | Total Cost (INR) |
    - Use the materials from the previous section.
    - Assign a realistic, market-based unit cost in Indian Rupees (₹) for each material.
    - Calculate the total cost for each material.
    - After the table, provide a summary with:
        - **Subtotal**: Sum of all total costs.
        - **Contingency (10%)**: 10% of the Subtotal.
        - **Grand Total**: Subtotal + Contingency.

    **3. ASCII Blueprint Section:**
    - Start with the heading: \`## ASCII Blueprint\`
    - Create a simple, top-down ASCII art diagram representing the city layout described by the user. Use symbols to represent different zones (e.g., [R] for Residential, [C] for Commercial, [I] for Industrial, |-| for roads, ~~~ for water).

    **4. SVG Blueprint Section:**
    - Start with the heading: \`## SVG Blueprint\`
    - Generate a clean, colorful, and exportable SVG-based 2D city map.
    - The SVG should be a single block of code starting with \`<svg ...>\` and ending with \`</svg>\`.
    - Use different colored \`<rect>\` or \`<path>\` elements to represent different zones (e.g., green for parks, gray for residential, blue for commercial).
    - Add \`<text>\` labels for key zones.
    - Make sure the SVG is well-formed and visually represents the user's city description.

    **IMPORTANT**: Ensure your output strictly follows this four-section Markdown structure. Do not add any extra text or conversation before or after the structured output.
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

export async function getEnvironmentalReport(input: AssessEnvironmentalImpactInput) {
    try {
        const result = await assessEnvironmentalImpact(input);
        return result;
    } catch (error) {
        console.error("Error in getEnvironmentalReport:", error);
        throw new Error("Failed to generate the environmental report.");
    }
}
