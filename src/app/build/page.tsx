"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from 'next/link'
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Logo } from "@/components/logo"
import { ArrowRight, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const features = [
  { id: "stadium", label: "Stadium" },
  { id: "airport", label: "Airport" },
  { id: "university", label: "University" },
  { id: "advanced_transit", label: "Advanced Transit System" },
  { id: "green_roofs", label: "Green Roofs on Buildings" },
  { id: "smart_grid", label: "Smart Grid" },
] as const;

const formSchema = z.object({
  cityDescription: z.string().min(50, {
    message: "Please provide a more detailed description (at least 50 characters).",
  }),
  extraFeatures: z.array(z.string()).optional(),
})

export default function BuildPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cityDescription: "",
      extraFeatures: [],
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedFeatures = values.extraFeatures
      ?.map(featureId => features.find(f => f.id === featureId)?.label)
      .filter(Boolean) || [];

    let fullDescription = values.cityDescription;
    if (selectedFeatures.length > 0) {
      fullDescription += `\n\nAdditionally, the city should include the following special features: ${selectedFeatures.join(", ")}.`;
    }

    toast({
      title: "Generating your city plan...",
      description: "Our AI crew is getting to work. Please wait.",
    });

    const encodedDescription = encodeURIComponent(fullDescription);
    router.push(`/planner?description=${encodedDescription}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 md:px-6 flex items-center justify-between">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-2">
              <Bot className="h-8 w-8" />
              Describe Your Vision
            </CardTitle>
            <CardDescription>
              Provide our AI crew with the details of your dream city. The more specific you are, the better the result.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="cityDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">City Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., A coastal city with a bustling downtown, a quiet residential area with parks, and a dedicated industrial zone. Focus on renewable energy and public green spaces."
                          className="min-h-[150px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the layout, key districts, and overall feel of the city you want to build.
                      </FormDescription>ieg
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="extraFeatures"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-lg">Special Features</FormLabel>
                        <FormDescription>
                          Select any special features to include in your city.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {features.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="extraFeatures"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" size="lg" className="font-bold group">
                    Generate Plan
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
