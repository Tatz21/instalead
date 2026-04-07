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
    <div className={cn("bg-card border border-border rounded-2xl p-5", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-lg",
            trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-display font-bold">{value}</h3>
      </div>
    </div>
  );
}
