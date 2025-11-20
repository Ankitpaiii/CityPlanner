import { Suspense } from "react";
import { OptimizerClient } from "./client";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function OptimizerPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 md:px-6 flex items-center justify-between border-b">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex-1">
        <Suspense fallback={<OptimizerSkeleton />}>
          <OptimizerClient />
        </Suspense>
      </main>
    </div>
  )
}

function OptimizerSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="animate-pulse">
        <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-5 bg-muted rounded w-1/2 mb-8"></div>
        <div className="space-y-8">
          <div className="h-96 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
