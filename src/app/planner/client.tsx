"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlanner } from "@/hooks/use-planner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, PackageSearch, CircleDollarSign, Construction, RefreshCw, Bot, Sparkles, Leaf } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnvironmentalReport } from "./_components/environmental-report";

export function PlannerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const description = decodeURIComponent(searchParams.get('description') || '');

  const { state, runInitialAnalysis, reset } = usePlanner(description);

  useEffect(() => {
    if (description) {
      runInitialAnalysis();
    }
  }, [description, runInitialAnalysis]);

  const handleGoToOptimizer = () => {
    if (!state.originalCosting) return;
    const params = new URLSearchParams();
    params.set('description', encodeURIComponent(description));
    params.set('costing', encodeURIComponent(state.originalCosting));
    router.push(`/optimizer?${params.toString()}`);
  }

  const {
    status,
    rawMaterials,
    originalCosting,
    initialBlueprint,
    svgBlueprint,
    isOverBudget,
    environmentalReport,
    error,
  } = state;

  const isLoading = status === 'loading';
  const isDone = status === 'done';

  return (
    <div className="container mx-auto max-w-5xl py-8 md:py-12 px-4">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Your City Plan Analysis</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Here is the complete initial analysis of your proposed city plan.
        </p>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            <strong>Vision:</strong> {description}
        </p>
      </div>

      <div className="space-y-8">
        {isLoading && (
            <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <Bot className="h-12 w-12 mb-4 animate-spin" />
                <CardTitle className="font-headline text-2xl">Generating Your Plan</CardTitle>
                <CardDescription>Our AI crew is assembling the blueprint, calculating costs, and analyzing the environmental impact. Please wait a moment.</CardDescription>
            </Card>
        )}

        {isDone && (
            <>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><PackageSearch /> Raw Material Supplies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea readOnly value={rawMaterials} className="min-h-64 font-code text-xs bg-secondary/30" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><CircleDollarSign /> Financial Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea readOnly value={originalCosting} className="min-h-64 font-code text-xs bg-secondary/30" />
                    </CardContent>
                </Card>

                {environmentalReport && (
                    <Card>
                         <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Leaf /> Environmental Impact Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EnvironmentalReport report={environmentalReport} />
                        </CardContent>
                    </Card>
                )}

                <Card>
                     <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Construction /> City Layout Plan</CardTitle>
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

                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl">Ready to Optimize?</CardTitle>
                        <CardDescription>
                           {isOverBudget 
                                ? "Your current plan is over the budget limit. Let's optimize it." 
                                : "Your plan is within the budget, but we can still explore cost-saving options."
                           }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={handleGoToOptimizer} size="lg" className="font-bold group shadow-lg">
                            <Sparkles className="mr-2 h-5 w-5"/>
                            Optimize Budget
                        </Button>
                    </CardContent>
                </Card>
            </>
        )}

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
