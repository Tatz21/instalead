import React from 'react';
import { User, MapPin, Phone, Globe, Star, MoreVertical, ExternalLink, Copy, MessageSquare } from 'lucide-react';
import { Lead } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface LeadCardProps {
  lead: Partial<Lead>;
  onSave?: () => void;
  onView?: () => void;
  isSaved?: boolean;
}

export default function LeadCard({ lead, onSave, onView, isSaved }: LeadCardProps) {
  const copyToClipboard = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div 
      className="glass-dark rounded-2xl p-5 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
      onClick={onView}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-border shrink-0">
            <MapPin className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground flex items-center gap-2 truncate">
              {lead.status && (
                <div className={cn(
                  "px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase shrink-0",
                  lead.status === 'new' ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" :
                  lead.status === 'contacted' ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" :
                  lead.status === 'replied' ? "bg-purple-500/20 text-purple-500 border border-purple-500/30" :
                  lead.status === 'converted' ? "bg-green-500/20 text-green-500 border border-green-500/30" :
                  lead.status === 'lost' ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-muted text-muted-foreground"
                )}>
                  {lead.status}
                </div>
              )}
              <span className="truncate">{lead.name}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <div className="flex items-center gap-1 min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">{lead.address}</p>
              <button 
                onClick={(e) => copyToClipboard(e, lead.address || '', 'Address')}
                className="p-1 hover:bg-accent rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <Copy className="w-2.5 h-2.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead.aiScore !== undefined && (
            <div className={cn(
              "w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold border",
              lead.aiScore > 70 ? "bg-green-500/10 text-green-500 border-green-500/20" : 
              lead.aiScore > 40 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            )}>
              <span className="text-[8px] opacity-70">SCORE</span>
              {lead.aiScore}
            </div>
          )}
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {lead.phoneNumber && (
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
              <Phone className="w-3 h-3" />
              {lead.phoneNumber}
            </div>
            <button 
              onClick={(e) => copyToClipboard(e, lead.phoneNumber!, 'Phone number')}
              className="p-1 hover:bg-accent rounded transition-colors opacity-0 group-hover/item:opacity-100"
            >
              <Copy className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
          <Globe className="w-3 h-3" />
          {lead.website ? (
            <a 
              href={lead.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          ) : (
            <span className="italic opacity-50">No website found</span>
          )}
        </div>
      </div>

      {lead.notes && (
        <div className="mb-4 p-2 bg-accent/20 rounded-xl border border-border/50">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mb-1">
            <MessageSquare className="w-3 h-3" />
            NOTES
          </div>
          <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
            "{lead.notes}"
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-accent/30 rounded-xl p-2 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rating</p>
          <div className="flex items-center justify-center gap-1 font-bold text-sm">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            {lead.rating || 'N/A'}
          </div>
        </div>
        <div className="bg-accent/30 rounded-xl p-2 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reviews</p>
          <p className="font-bold text-sm">{lead.userRatingsTotal || 0}</p>
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
      </div>
    </div>
  );
}
