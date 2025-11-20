"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader, AlertCircle, Circle, type LucideProps } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";

type StepStatus = 'pending' | 'loading' | 'completed' | 'error';

interface StepProps {
  title: string;
  icon: React.ReactElement<LucideProps>;
  status: StepStatus;
  children: React.ReactNode;
}

const statusIcons: Record<StepStatus, React.ReactElement<LucideProps>> = {
  pending: <Circle className="h-6 w-6 text-muted-foreground" />,
  loading: <Loader className="h-6 w-6 text-primary animate-spin" />,
  completed: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  error: <AlertCircle className="h-6 w-6 text-destructive" />,
};

export function Step({ title, icon, status, children }: StepProps) {
  const isContentVisible = status === 'completed' || status === 'loading' || status === 'error';

  return (
    <motion.div layout="position">
      <Card className={cn(
        "transition-all duration-300",
        status === 'pending' && 'bg-card/50',
        status === 'loading' && 'border-primary/50'
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                {icon}
              </div>
              <CardTitle className="font-headline text-2xl">{title}</CardTitle>
            </div>
            <div className="w-6 h-6">{statusIcons[status]}</div>
          </div>
        </CardHeader>
        <AnimatePresence>
          {isContentVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardContent>
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
