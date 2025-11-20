"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePlanner } from "@/hooks/use-planner";
import { Button } from "@/components/ui/button";
import { Step } from "./_components/step";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, PackageSearch, CircleDollarSign, Leaf, Construction, RefreshCw, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PlannerClient() {
  const searchParams = useSearchParams();
  const description = decodeURIComponent(searchParams.get('description') || '');

  const { state, runPlanner, reset } = usePlanner(description);

  useEffect(() => {
    if (description) {
      runPlanner();
    }
  }, [description, runPlanner]);

  const {
    status,
    rawMaterials,
    originalCosting,
    initialBlueprint,
    isOverBudget,
    optimizedCosting,
    optimizationExplanation,
    envAnalysis,
    finalBlueprint,
    finalBlueprintComparison,
    error,
  } = state;

  const isRunning = status !== 'done' && status !== 'error';
  
  const getStepStatus = (
    stepOrder: number, 
    currentStatus: typeof status
    ): 'loading' | 'completed' | 'pending' | 'error' => {
      const statusOrder = ['initial', 'materials', 'costing', 'optimizing', 'environment', 'blueprint', 'done'];
      const currentStepIndex = statusOrder.indexOf(currentStatus);
      
      if (currentStatus === 'error') {
        const errorStepIndex = statusOrder.indexOf(state.error?.step || 'initial');
        if (stepOrder < errorStepIndex) return 'completed';
        if (stepOrder === errorStepIndex) return 'error';
        return 'pending';
      }

      if (stepOrder < currentStepIndex) return 'completed';
      if (stepOrder === currentStepIndex) return 'loading';
      return 'pending';
  }


  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Your City Plan</h1>
        <p className="text-muted-foreground mt-2">
          Our AI crew is building your city. Follow their progress below.
        </p>
      </div>

      <div className="space-y-6">
        <Step
          title="Raw Material Supply"
          icon={<PackageSearch />}
          status={getStepStatus(1, status)}
        >
          <Textarea readOnly value={rawMaterials || "Generating material list..."} className="min-h-64 font-code text-xs bg-background/50" />
        </Step>

        <Step
          title="Financial Analysis"
          icon={<CircleDollarSign />}
          status={getStepStatus(2, status)}
        >
          <Textarea readOnly value={originalCosting || "Performing cost analysis..."} className="min-h-64 font-code text-xs bg-background/50" />
          {isOverBudget && (
            <div className="mt-4">
              <h3 className="font-headline text-lg mb-2 text-primary">Budget Optimization</h3>
               <Textarea readOnly value={optimizedCosting || "Optimizing plan to fit budget..."} className="minh-h-64 font-code text-xs bg-background/50" />
               <Textarea readOnly value={optimizationExplanation || "Generating explanation..."} className="mt-2 min-h-24 font-code text-xs bg-background/50" />
            </div>
          )}
        </Step>

        <Step
          title="Environmental Review"
          icon={<Leaf />}
          status={getStepStatus(4, status)}
        >
          {envAnalysis ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-headline text-lg mb-2 text-primary">Original Plan Analysis</h3>
                <Textarea readOnly value={
`Environmental Risks: ${envAnalysis.originalPlanAnalysis.environmentalRisks}
Green Score: ${envAnalysis.originalPlanAnalysis.greenScore}/100
Greener Alternatives: ${envAnalysis.originalPlanAnalysis.greenerAlternatives}`
                  } className="min-h-48 font-code text-xs bg-background/50" />
              </div>
              {envAnalysis.optimizedPlanAnalysis && (
                <div>
                  <h3 className="font-headline text-lg mb-2 text-primary">Optimized Plan Analysis</h3>
                  <Textarea readOnly value={
`Environmental Risks: ${envAnalysis.optimizedPlanAnalysis.environmentalRisks}
Green Score: ${envAnalysis.optimizedPlanAnalysis.greenScore}/100
Greener Alternatives: ${envAnalysis.optimizedPlanAnalysis.greenerAlternatives}`
                  } className="min-h-48 font-code text-xs bg-background/50" />
                </div>
              )}
              <div>
                <h3 className="font-headline text-lg mb-2 text-primary">Final Recommendation</h3>
                 <div className="p-4 border rounded-md bg-background/50 flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-1 text-primary"/>
                  <p className="flex-1">{envAnalysis.finalRecommendation}</p>
                 </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Awaiting environmental report...</p>
          )}
        </Step>

        <Step
          title="Final Blueprint"
          icon={<Construction />}
          status={getStepStatus(5, status)}
        >
           <Textarea readOnly value={finalBlueprint || "Generating final blueprint..."} className="min-h-64 font-code text-xs bg-background/50" />
           {finalBlueprintComparison && (
             <Textarea readOnly value={finalBlueprintComparison} className="mt-2 min-h-24 font-code text-xs bg-background/50" />
           )}
        </Step>
      </div>

      {status === 'error' && (
        <Alert variant="destructive" className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>An Error Occurred</AlertTitle>
          <AlertDescription>
            {error?.message || "Something went wrong during plan generation."}
          </AlertDescription>
        </Alert>
      )}

      {(status === 'done' || status === 'error') && (
        <div className="mt-8 flex justify-end">
          <Button onClick={reset} disabled={isRunning} variant="outline" size="lg">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            Start a New Plan
          </Button>
        </div>
      )}
    </div>
  );
}
