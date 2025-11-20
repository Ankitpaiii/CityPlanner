"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getOptimizedPlan, getEnvironmentalReport } from "@/app/planner/actions";
import { parseInitialPlan } from "@/lib/parsers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, PackageSearch, CircleDollarSign, Construction, RefreshCw, Bot, Sparkles, Leaf } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnvironmentalReport } from "@/app/planner/_components/environmental-report";
import type { AssessEnvironmentalImpactOutput } from "@/ai/flows/assess-environmental-impact";


type OptimizerStatus = 'initial' | 'loading' | 'done' | 'error';

interface OptimizerState {
  status: OptimizerStatus;
  optimizedCosting?: string;
  optimizationExplanation?: string;
  environmentalReport?: AssessEnvironmentalImpactOutput;
  error?: string;
}

export function OptimizerClient() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const description = decodeURIComponent(searchParams.get('description') || '');
  const originalCosting = decodeURIComponent(searchParams.get('costing') || '');

  const [state, setState] = useState<OptimizerState>({ status: 'initial' });

  useEffect(() => {
    if (!originalCosting) return;

    const runOptimization = async () => {
      setState({ status: 'loading' });
      toast({
          title: "Optimizing Plan...",
          description: "Our AI crew is reworking the budget and analyzing the new impact.",
      });

      try {
        const optimizedPlan = await getOptimizedPlan(originalCosting);
        
        const report = await getEnvironmentalReport({
            cityPlanDescription: description,
            originalCosting: originalCosting,
            optimizedCosting: optimizedPlan.optimizedPlanCosting
        });

        setState({
          status: 'done',
          optimizedCosting: optimizedPlan.optimizedPlanCosting,
          optimizationExplanation: optimizedPlan.explanation,
          environmentalReport: report,
        });

        toast({
            title: "Plan Optimized!",
            description: "The city plan has been updated to fit the budget.",
        });

      } catch (e) {
        const err = e as Error;
        console.error("Error during optimization:", err);
        setState({
            status: 'error',
            error: err.message || "An unknown error occurred."
        });
        toast({
            variant: "destructive",
            title: "Optimization Failed",
            description: err.message,
        });
      }
    };
    
    runOptimization();
  }, [originalCosting, description, toast]);

  // The layout doesn't change, so we parse it from the original costing text
  const { initialBlueprint, svgBlueprint } = useMemo(() => {
    return parseInitialPlan(originalCosting);
  }, [originalCosting]);

  const { status, optimizedCosting, optimizationExplanation, environmentalReport, error } = state;

  const isLoading = status === 'loading';
  const isDone = status === 'done';

  return (
    <div className="container mx-auto max-w-5xl py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Optimized City Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          The AI has reworked your plan to meet budget constraints. Here is the revised analysis.
        </p>
      </div>
       <div className="space-y-8">
         {isLoading && (
            <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <Bot className="h-12 w-12 mb-4 animate-spin" />
                <CardTitle className="font-headline text-2xl">Optimizing Your Plan</CardTitle>
                <CardDescription>Recalculating costs and re-evaluating the environmental impact. This will just take a moment.</CardDescription>
            </Card>
        )}

        {isDone && (
          <>
            <Card className="bg-secondary/50">
              <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-3">
                      <Sparkles className="h-6 w-6" />
                      Optimization Summary
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-lg">{optimizationExplanation}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><CircleDollarSign /> Optimized Financial Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea readOnly value={optimizedCosting} className="min-h-64 font-code text-xs bg-secondary/30" />
              </CardContent>
            </Card>

            {environmentalReport && (
                <Card>
                     <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Leaf /> Revised Environmental Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EnvironmentalReport report={environmentalReport} />
                    </CardContent>
                </Card>
            )}

            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><Construction /> City Layout Plan</CardTitle>
                    <CardDescription>The layout remains the same, but the materials and costs have been optimized.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="ascii">
                        <TabsList className="mb-2">
                            <TabsTrigger value="ascii">ASCII</TabsTrigger>
                            <TabsTrigger value="svg">2D Map</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ascii">
                           <Textarea readOnly value={initialBlueprint} className="min-h-96 font-code text-xs bg-secondary/30" />
                        </TabsContent>
                        <TabsContent value="svg">
                           <Card className="min-h-96 bg-secondary/30 flex items-center justify-center p-4">
                                {svgBlueprint ? (
                                    <div dangerouslySetInnerHTML={{ __html: svgBlueprint }} className="w-full h-full" />
                                ) : (
                                    <p className="text-muted-foreground">Could not generate SVG map.</p>
                                )}
                           </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
          </>
        )}

        {status === 'error' && (
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>An Error Occurred During Optimization</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8 flex justify-between">
            <Button onClick={() => router.back()} variant="outline" size="lg">
                Back to Initial Plan
            </Button>
            <Button onClick={() => router.push('/build')} variant="default" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Start a New Plan
            </Button>
        </div>
      </div>
    </div>
  )
}
