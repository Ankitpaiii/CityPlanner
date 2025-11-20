"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getInitialPlan, getOptimizedPlan, getEnvironmentalReport } from "@/app/planner/actions";
import { parseInitialPlan, parseGrandTotal } from "@/lib/parsers";
import type { AssessEnvironmentalImpactOutput } from "@/ai/flows/assess-environmental-impact";

type PlannerStatus =
  | 'initial'
  | 'loading'
  | 'done'
  | 'optimizing'
  | 'evaluated'
  | 'error';

interface PlannerState {
  status: PlannerStatus;
  cityDescription: string;
  rawMaterials?: string;
  originalCosting?: string;
  initialBlueprint?: string;
  svgBlueprint?: string;
  grandTotal: number;
  isOverBudget: boolean;
  environmentalReport?: AssessEnvironmentalImpactOutput;
  error?: {
    step: 'initial' | 'evaluation';
    message: string;
  };
}

const initialState: Omit<PlannerState, 'cityDescription'> = {
  status: 'initial',
  grandTotal: 0,
  isOverBudget: false,
};

export function usePlanner(cityDescription: string) {
  const [state, setState] = useState<PlannerState>({ ...initialState, cityDescription });
  const router = useRouter();
  const { toast } = useToast();

  const runInitialAnalysis = useCallback(async () => {
    setState(s => ({ ...initialState, cityDescription: s.cityDescription, status: 'loading' }));
    toast({
        title: "Generating Initial Plan...",
        description: "Our AI crew is building your city blueprint and analyzing its impact.",
    });

    try {
      const initialPlanResponse = await getInitialPlan(cityDescription);
      const { rawMaterials, originalCosting, initialBlueprint, svgBlueprint } = parseInitialPlan(initialPlanResponse);
      const grandTotal = parseGrandTotal(originalCosting);
      
      toast({
        title: "Evaluating Environmental Impact...",
        description: "The analysis is running alongside plan generation.",
      });
      
      const report = await getEnvironmentalReport({
        cityPlanDescription: cityDescription,
        originalCosting: originalCosting,
      });
      
      setState(s => ({
        ...s,
        status: 'done',
        rawMaterials,
        originalCosting,
        initialBlueprint,
        svgBlueprint,
        grandTotal,
        isOverBudget: grandTotal > 1000000,
        environmentalReport: report,
      }));

      toast({
        title: "Initial Analysis Complete!",
        description: "Review the materials, costs, environmental report, and layout.",
      });

    } catch (e) {
      const err = e as Error;
      console.error(`Error during initial analysis:`, err);
      setState(s => ({
        ...s,
        status: 'error',
        error: { step: 'initial', message: err.message },
      }));
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: err.message || `Something went wrong during initial planning.`,
      });
    }
  }, [cityDescription, toast]);
  

  const reset = () => {
    router.push('/build');
  };

  return { state, runInitialAnalysis, reset };
}
