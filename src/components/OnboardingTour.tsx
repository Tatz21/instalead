import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: Step[] = [
  {
    title: "Welcome to InstaLead AI! 🚀",
    description: "Let's take a quick tour to help you find and convert your ideal Instagram leads using AI.",
    position: 'center'
  },
  {
    title: "Find Leads",
    description: "Use the Finder to search for Instagram profiles by keywords, category, or location. Our AI helps you filter the best ones.",
    target: '[data-tour="finder"]',
    position: 'bottom'
  },
  {
    title: "AI Lead Scoring",
    description: "Every lead you save is automatically analyzed and scored based on your business profile. Focus on the high-score leads first!",
    target: '[data-tour="leads"]',
    position: 'bottom'
  },
  {
    title: "AI Outreach Writer",
    description: "Generate personalized DMs and follow-ups in seconds. Set your business details once, and let AI do the writing.",
    target: '[data-tour="writer"]',
    position: 'bottom'
  },
  {
    title: "Automation & Tasks",
    description: "Set up rules to automatically create tasks when lead statuses change. Stay organized and never miss a follow-up.",
    target: '[data-tour="settings"]',
    position: 'bottom'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            "fixed z-[210] pointer-events-auto w-full max-w-sm p-6 bg-card border border-border rounded-[2rem] shadow-2xl",
            step.position === 'center' ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" :
            "bottom-24 left-1/2 -translate-x-1/2"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Step {currentStep + 1} of {steps.length}</span>
            </div>
            <button onClick={onComplete} className="p-1 hover:bg-accent rounded-lg transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <h3 className="text-xl font-display font-bold mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === currentStep ? "bg-primary w-4" : "bg-border"
                  )} 
                />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="p-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/80 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Backdrop for highlighting */}
      <div className="fixed inset-0 bg-background/60 backdrop-blur-[2px] z-[205]" />
    </div>
  );
}
