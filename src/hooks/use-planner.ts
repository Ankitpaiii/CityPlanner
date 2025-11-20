"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getInitialPlan, getOptimizedPlan, getEnvironmentalReport, getFinalBlueprint } from "@/app/planner/actions";
import { parseInitialPlan, parseGrandTotal, parseFinalBlueprint } from "@/lib/parsers";
import type { AssessEnvironmentalImpactOutput } from "@/ai/flows/assess-environmental-impact";

type PlannerStatus =
  | 'initial'
  | 'materials'
  | 'costing'
  | 'optimizing'
  | 'environment'
  | 'blueprint'
  | 'done'
  | 'error';

interface PlannerState {
  status: PlannerStatus;
  cityDescription: string;
  rawMaterials?: string;
  originalCosting?: string;
  initialBlueprint?: string;
semicolon
  grandTotal: number;
  isOverBudget: boolean;
  optimizedCosting?: string;
  optimizationExplanation?: string;
  envAnalysis?: AssessEnvironmentalImpactOutput;
  finalBlueprint?: string;
  finalBlueprintComparison?: string;
  error?: {
    step: PlannerStatus;
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

  const runPlanner = useCallback(async () => {
    let currentStep: PlannerStatus = 'initial';
    try {
      // Step 1 & 2: Get Initial Plan (Materials + Costing)
      currentStep = 'materials';
      setState(s => ({ ...s, status: currentStep }));
      const initialPlanResponse = await getInitialPlan(cityDescription);
      const { rawMaterials, originalCosting, initialBlueprint } = parseInitialPlan(initialPlanResponse);
      const grandTotal = parseGrandTotal(originalCosting);
      
      currentStep = 'costing';
      setState(s => ({
        ...s,
        status: currentStep,
        rawMaterials,
        originalCosting,
        initialBlueprint,
        finalBlueprint: initialBlueprint, // Set initial as final for now
        grandTotal,
      }));

      let finalCosting = originalCosting;
      let finalExplanation = "The plan is within the budget.";

      // Step 3: Optimize if over budget
      if (grandTotal > 1000000) {
        currentStep = 'optimizing';
        setState(s => ({ ...s, status: currentStep, isOverBudget: true }));
        const optimizedPlan = await getOptimizedPlan(originalCosting);
        finalCosting = optimizedPlan.optimizedPlanCosting;
        finalExplanation = optimizedPlan.explanation;
        setState(s => ({
          ...s,
          optimizedCosting: optimizedPlan.optimizedPlanCosting,
          optimizationExplanation: optimizedPlan.explanation,
        }));
      }

      // Step 4: Environmental Analysis
      currentStep = 'environment';
      setState(s => ({ ...s, status: currentStep }));
      const envReport = await getEnvironmentalReport({
        cityPlanDescription,
        originalCosting,
        optimizedCosting: state.isOverBudget ? finalCosting : undefined,
      });
      setState(s => ({ ...s, envAnalysis: envReport }));

      // Step 5: Final Blueprint
      currentStep = 'blueprint';
      setState(s => ({ ...s, status: currentStep }));
      if (state.isOverBudget) {
        const finalBlueprintResponse = await getFinalBlueprint(cityDescription, finalExplanation);
        const { finalBlueprint, planComparison } = parseFinalBlueprint(finalBlueprintResponse);
        setState(s => ({
            ...s,
            finalBlueprint,
            finalBlueprintComparison: planComparison
        }));
      }

      currentStep = 'done';
      setState(s => ({ ...s, status: currentStep }));
      toast({
        title: "City Plan Complete!",
        description: "Your city has been designed by our AI crew.",
      });

    } catch (e) {
      const err = e as Error;
      console.error(`Error during step ${currentStep}:`, err);
      setState(s => ({
        ...s,
        status: 'error',
        error: { step: currentStep, message: err.message },
      }));
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: err.message || `Something went wrong during the '${currentStep}' step.`,
      });
    }
  }, [cityDescription, state.isOverBudget, toast]);
  
  const reset = () => {
    router.push('/build');
  };

  return { state, runPlanner, reset };
}
