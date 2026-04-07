import React from 'react';
import { User, Instagram, Mail, Tag, MoreVertical, ExternalLink } from 'lucide-react';
import { Lead } from '../types';
import { cn } from '../lib/utils';

interface LeadCardProps {
  lead: Partial<Lead>;
  onSave?: () => void;
  onView?: () => void;
  isSaved?: boolean;
}

export default function LeadCard({ lead, onSave, onView, isSaved }: LeadCardProps) {
  return (
    <div className="glass-dark rounded-2xl p-5 hover:border-primary/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-border">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-1">
              @{lead.username}
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-muted-foreground">{lead.fullName}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-accent rounded-full transition-colors">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 italic">
        "{lead.bio}"
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-accent/30 rounded-xl p-2 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Followers</p>
          <p className="font-bold text-sm">{(lead.followers || 0).toLocaleString()}</p>
        </div>
        <div className="bg-accent/30 rounded-xl p-2 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Category</p>
          <p className="font-bold text-sm truncate">{lead.category || 'N/A'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaved}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200",
              isSaved 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isSaved ? 'Saved' : 'Save Lead'}
          </button>
        )}
        {onView && (
          <button
            onClick={onView}
            className="p-2 bg-accent hover:bg-accent/80 rounded-xl transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
