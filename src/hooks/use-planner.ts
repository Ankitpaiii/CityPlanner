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
  | 'optimized'
  | 'evaluating'
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
  optimizedCosting?: string;
  optimizationExplanation?: string;
  environmentalReport?: AssessEnvironmentalImpactOutput;
  error?: {
    step: 'initial' | 'optimization' | 'evaluation';
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

  const runInitialPlanner = useCallback(async () => {
    setState(s => ({ ...initialState, cityDescription: s.cityDescription, status: 'loading' }));
    toast({
        title: "Generating Initial Plan...",
        description: "Our AI crew is building your city blueprint.",
    });

    try {
      const initialPlanResponse = await getInitialPlan(cityDescription);
      const { rawMaterials, originalCosting, initialBlueprint, svgBlueprint } = parseInitialPlan(initialPlanResponse);
      const grandTotal = parseGrandTotal(originalCosting);
      
      setState(s => ({
        ...s,
        status: 'done',
        rawMaterials,
        originalCosting,
        initialBlueprint,
        svgBlueprint,
        grandTotal,
        isOverBudget: grandTotal > 1000000,
      }));

      toast({
        title: "Initial Plan Generated!",
        description: "Review the materials, costs, and layout.",
      });

    } catch (e) {
      const err = e as Error;
      console.error(`Error during initial plan generation:`, err);
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
  
  const runOptimization = useCallback(async () => {
    if (!state.originalCosting) return;

    setState(s => ({ ...s, status: 'optimizing' }));
    toast({
        title: "Optimizing Plan...",
        description: "Our AI Finance Manager is working on the budget.",
    });

    try {
        const optimizedPlan = await getOptimizedPlan(state.originalCosting);
        setState(s => ({
            ...s,
            status: 'optimized',
            optimizedCosting: optimizedPlan.optimizedPlanCosting,
            optimizationExplanation: optimizedPlan.explanation,
        }));
        toast({
            title: "Plan Optimized!",
            description: "The city plan has been updated to fit the budget.",
        });
    } catch(e) {
        const err = e as Error;
        console.error(`Error during optimization:`, err);
        setState(s => ({
          ...s,
          status: 'error',
          error: { step: 'optimization', message: err.message },
        }));
        toast({
          variant: "destructive",
          title: "Optimization Failed",
          description: err.message || `Something went wrong during budget optimization.`,
        });
    }
  }, [state.originalCosting, toast]);

  const runEvaluation = useCallback(async () => {
    setState(s => ({ ...s, status: 'evaluating' }));
    toast({
        title: "Evaluating Environmental Impact...",
        description: "Our AI is analyzing the sustainability of your plan.",
    });

    try {
        const report = await getEnvironmentalReport({
          cityPlanDescription: state.cityDescription,
          originalCosting: state.originalCosting,
          optimizedCosting: state.optimizedCosting
        });
        setState(s => ({
            ...s,
            status: 'evaluated',
            environmentalReport: report,
        }));
        toast({
            title: "Environmental Report Generated!",
            description: "The analysis is complete.",
        });
    } catch(e) {
        const err = e as Error;
        console.error(`Error during evaluation:`, err);
        setState(s => ({
          ...s,
          status: 'error',
          error: { step: 'evaluation', message: err.message },
        }));
        toast({
          variant: "destructive",
          title: "Evaluation Failed",
          description: err.message || `Something went wrong during environmental analysis.`,
        });
    }
  }, [state.cityDescription, state.originalCosting, state.optimizedCosting, toast]);

  const reset = () => {
    router.push('/build');
  };

  return { state, runInitialPlanner, runOptimization, runEvaluation, reset };
}
