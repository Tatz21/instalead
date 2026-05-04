import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export default function StatsCard({ label, value, icon: Icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-5 relative overflow-hidden group", className)}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-2.5 rounded-xl bg-secondary border border-border text-primary shadow-sm">
          <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-mono font-bold px-2 py-1 rounded-md border",
            trendUp ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-1">{label}</p>
        <h3 className="text-3xl font-mono font-bold tracking-tighter">{value}</h3>
      </div>
    </div>
  );
}
