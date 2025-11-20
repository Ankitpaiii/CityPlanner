"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { usePlanner } from "@/hooks/use-planner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, PackageSearch, CircleDollarSign, Construction, RefreshCw, Bot, Sparkles, Leaf } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Step } from "./_components/step";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnvironmentalReport } from "./_components/environmental-report";

export function PlannerClient() {
  const searchParams = useSearchParams();
  const description = decodeURIComponent(searchParams.get('description') || '');

  const { state, runInitialPlanner, runOptimization, runEvaluation, reset } = usePlanner(description);

  useEffect(() => {
    if (description) {
      runInitialPlanner();
    }
  }, [description, runInitialPlanner]);
  
  const handleOptimize = () => {
    if (state.originalCosting) {
        runOptimization();
    }
  }

  const handleEvaluate = () => {
    runEvaluation();
  }

  const {
    status,
    rawMaterials,
    originalCosting,
    initialBlueprint,
    svgBlueprint,
    optimizedCosting,
    optimizationExplanation,
    isOverBudget,
    environmentalReport,
    error,
  } = state;

  const isLoading = status === 'loading' || status === 'optimizing' || status === 'evaluating';
  const initialDone = status !== 'initial' && status !== 'loading';
  const isOptimized = status === 'optimized' || status === 'evaluated';

  return (
    <div className="container mx-auto max-w-5xl py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Your City Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Follow the steps below to generate, optimize, and evaluate your city plan.
        </p>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Initial Plan: <strong>{description}</strong>
        </p>
      </div>

      <div className="space-y-8">
        <Step 
          title="Step 1: Initial Plan Generation"
          icon={<Bot className="h-6 w-6 text-primary" />}
          status={status === 'loading' ? 'loading' : initialDone ? 'completed' : 'pending'}
        >
            <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-xl mb-2 flex items-center gap-2"><PackageSearch className="h-5 w-5" /> Raw Material Supplies</h3>
                  <Textarea readOnly value={rawMaterials || "Generating..."} className="min-h-64 font-code text-xs bg-secondary/30" />
                </div>
                <div>
                  <h3 className="font-headline text-xl mb-2 flex items-center gap-2"><CircleDollarSign className="h-5 w-5" /> Financial Requirements</h3>
                  <Textarea readOnly value={originalCosting || "Generating..."} className="min-h-64 font-code text-xs bg-secondary/30" />
                </div>
                <div>
                  <h3 className="font-headline text-xl mb-2 flex items-center gap-2"><Construction className="h-5 w-5" /> City Layout Plan</h3>
                    <Tabs defaultValue="ascii">
                        <TabsList className="mb-2">
                            <TabsTrigger value="ascii">ASCII</TabsTrigger>
                            <TabsTrigger value="svg">2D Map</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ascii">
                           <Textarea readOnly value={initialBlueprint || "Generating..."} className="min-h-96 font-code text-xs bg-secondary/30" />
                        </TabsContent>
                        <TabsContent value="svg">
                           <Card className="min-h-96 bg-secondary/30 flex items-center justify-center p-4">
                                {svgBlueprint ? (
                                    <div dangerouslySetInnerHTML={{ __html: svgBlueprint }} className="w-full h-full" />
                                ) : (
                                    <p className="text-muted-foreground">Generating SVG map...</p>
                                )}
                           </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Step>

        <Step 
          title="Step 2: Budget Optimization"
          icon={<Sparkles className="h-6 w-6 text-primary" />}
          status={status === 'optimizing' ? 'loading' : isOptimized ? 'completed' : 'pending'}
        >
          {initialDone && !isOptimized && (
             <div className="flex flex-col items-center gap-4 text-center">
                <p>Your initial plan is complete. If your budget is over the limit, you can optimize it now.</p>
                <Button onClick={handleOptimize} size="lg" className="font-bold group shadow-lg" disabled={!isOverBudget || isLoading}>
                    <Sparkles className="mr-2 h-5 w-5"/>
                    Make Plan Under ₹10,00,000
                </Button>
                {!isOverBudget && <p className="text-muted-foreground self-center">Your plan is already within budget!</p>}
             </div>
          )}
          {isOptimized && (
            <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                        <Sparkles className="h-6 w-6" />
                        Optimized Plan
                    </CardTitle>
                    <CardDescription className="flex items-start gap-3 pt-2">
                        <p className="flex-1">{optimizationExplanation}</p>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <h3 className="font-headline text-xl mb-2 flex items-center gap-2"><CircleDollarSign className="h-5 w-5" /> Optimized Financial Requirements</h3>
                    <Textarea readOnly value={optimizedCosting || "Generating..."} className="min-h-64 font-code text-xs" />
                </CardContent>
            </Card>
          )}
        </Step>
        
        <Step 
          title="Step 3: Environmental Impact"
          icon={<Leaf className="h-6 w-6 text-primary" />}
          status={status === 'evaluating' ? 'loading' : status === 'evaluated' ? 'completed' : 'pending'}
        >
            {isOptimized && status !== 'evaluated' && (
                <div className="flex flex-col items-center gap-4 text-center">
                    <p>Your plan has been optimized. Now, let's evaluate its environmental impact.</p>
                    <Button onClick={handleEvaluate} size="lg" className="font-bold group shadow-lg" disabled={isLoading}>
                        <Leaf className="mr-2 h-5 w-5"/>
                        Run Environmental Analysis
                    </Button>
                </div>
            )}
            {status === 'evaluated' && environmentalReport && (
                <EnvironmentalReport report={environmentalReport} />
            )}
        </Step>

       {status === 'error' && (
        <Alert variant="destructive" className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>An Error Occurred</AlertTitle>
          <AlertDescription>
            {error?.message || "Something went wrong during plan generation."}
          </AlertDescription>
        </Alert>
      )}

      {(status === 'evaluated' || status === 'error') && (
        <div className="mt-8 flex justify-end">
          <Button onClick={reset} disabled={isLoading} variant="outline" size="lg">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Start a New Plan
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
