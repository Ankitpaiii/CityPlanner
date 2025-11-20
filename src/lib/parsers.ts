export function parseInitialPlan(markdown: string): {
  rawMaterials: string;
  originalCosting: string;
  initialBlueprint: string;
  svgBlueprint: string;
} {
  const materialsMatch = markdown.match(/## Raw Materials([\s\S]*?)## Cost Estimate/);
  const costingMatch = markdown.match(/## Cost Estimate([\s\S]*?)## ASCII Blueprint/);
  const blueprintMatch = markdown.match(/## ASCII Blueprint([\s\S]*?)## SVG Blueprint/);
  const svgBlueprintMatch = markdown.match(/## SVG Blueprint([\s\S]*)/);

  return {
    rawMaterials: materialsMatch ? materialsMatch[1].trim() : "Could not parse raw materials.",
    originalCosting: costingMatch ? costingMatch[1].trim() : "Could not parse cost estimate.",
    initialBlueprint: blueprintMatch ? blueprintMatch[1].trim() : "Could not parse ASCII blueprint.",
    svgBlueprint: svgBlueprintMatch ? svgBlueprintMatch[1].trim() : "Could not parse SVG blueprint.",
  };
}

export function parseGrandTotal(costingText: string): number {
  if (!costingText) return 0;
  
  const grandTotalLine = costingText.split('\n').find(line => line.toLowerCase().includes('grand total'));
  
  if (!grandTotalLine) {
    return 0;
  }

  const numberMatch = grandTotalLine.match(/[\d,]+(\.\d+)?/);
  if (!numberMatch) {
    return 0;
  }

  return parseFloat(numberMatch[0].replace(/,/g, ''));
}
