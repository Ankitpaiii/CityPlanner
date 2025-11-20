import { Suspense } from "react";
import { PlannerClient } from "./client";
import { Logo } from "@/components/logo";

export default function PlannerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 md:px-6 flex items-center justify-between border-b">
        <Logo />
      </header>
      <main className="flex-1">
        <Suspense fallback={<PlannerSkeleton />}>
          <PlannerClient />
        </Suspense>
      </main>
    </div>
  )
}

function PlannerSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
        <div className="space-y-8">
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
