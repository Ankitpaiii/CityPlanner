import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Construction, Leaf, CircleDollarSign, PackageSearch, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/logo';

const bots = [
  {
    name: 'Raw Material Supplier',
    description: 'Analyzes the city plan to generate a comprehensive list of all necessary raw materials, quantities, and categories.',
    icon: <PackageSearch className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Finance Manager',
    description: 'Converts the material list into a detailed cost estimate and optimizes the budget if it exceeds the set limits.',
    icon: <CircleDollarSign className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Environment Check',
    description: 'Evaluates the environmental impact, calculates a Green Score, and suggests eco-friendly alternatives for the plan.',
    icon: <Leaf className="w-8 h-8 text-primary" />,
  },
  {
    name: 'Builder Bot',
    description: 'Generates the final city layout blueprint, including visual diagrams and a summary of the construction plan.',
    icon: <Construction className="w-8 h-8 text-primary" />,
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'city-skyline');

  return (
    <main className="flex-1">
      <header className="p-4 md:px-6 flex items-center justify-between">
        <Logo />
      </header>

      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover z-0"
              priority
              data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="container px-4 md:px-6 z-20 space-y-4 relative">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter">
            Build the City of Tomorrow, Today.
          </h1>
          <p className="max-w-[700px] mx-auto text-lg md:text-xl text-primary-foreground/80">
            Our AI-powered multi-agent crew collaborates to design sustainable, budget-friendly, and eco-conscious city layouts.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="font-bold group">
              <Link href="/build">
                Start Building
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">
                Our AI Crew
              </div>
              <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">
                Meet the Agents Behind the Plan
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Four specialized AI bots work in synergy, each handling a critical aspect of city planning to ensure a holistic and optimized design.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            {bots.map((bot) => (
              <Card key={bot.name} className="h-full transition-all duration-300 hover:bg-card/80 hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center gap-4">
                  {bot.icon}
                  <CardTitle className="font-headline text-2xl">{bot.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{bot.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="py-6 px-4 md:px-6 text-center text-muted-foreground">
        <p>© {new Date().getFullYear()} City Planner Crew. All rights reserved.</p>
      </footer>
    </main>
  );
}
