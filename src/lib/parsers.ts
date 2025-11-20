export function parseInitialPlan(markdown: string): {
  rawMaterials: string;
  originalCosting: string;
  initialBlueprint: string;
} {
  const materialsMatch = markdown.match(/## Raw Materials([\s\S]*?)## Cost Estimate/);
  const costingMatch = markdown.match(/## Cost Estimate([\s\S]*?)## Initial Blueprint/);
  const blueprintMatch = markdown.match(/## Initial Blueprint([\s\S]*)/);

  return {
    rawMaterials: materialsMatch ? materialsMatch[1].trim() : "Could not parse raw materials.",
    originalCosting: costingMatch ? costingMatch[1].trim() : "Could not parse cost estimate.",
    initialBlueprint: blueprintMatch ? blueprintMatch[1].trim() : "Could not parse initial blueprint.",
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


export function parseFinalBlueprint(markdown: string): {
  finalBlueprint: string;
  planComparison: string;
} {
  const blueprintMatch = markdown.match(/## Final Blueprint([\s\S]*?)## Plan Comparison/);
  const comparisonMatch = markdown.match(/## Plan Comparison([\s\S]*)/);

  return {
    finalBlueprint: blueprintMatch ? blueprintMatch[1].trim() : "Could not parse final blueprint.",
    planComparison: comparisonMatch ? comparisonMatch[1].trim() : "Could not parse plan comparison.",
  };
}
