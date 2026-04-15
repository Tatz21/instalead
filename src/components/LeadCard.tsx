import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Phone, Globe, Star, MoreVertical, ExternalLink, Copy, MessageSquare, HelpCircle, Mail, Zap, RefreshCw, ChevronDown, ChevronUp, Tag as TagIcon } from 'lucide-react';
import { Lead, CustomFieldDefinition } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { generateOutreachMessage } from '../services/aiService';

interface LeadCardProps {
  lead: Partial<Lead>;
  onSave?: () => void;
  onView?: () => void;
  isSaved?: boolean;
  businessType?: string;
  offer?: string;
  customFieldDefinitions?: CustomFieldDefinition[];
}

export default function LeadCard({ lead, onSave, onView, isSaved, businessType, offer, customFieldDefinitions = [] }: LeadCardProps) {
  const [quickMessage, setQuickMessage] = useState<{ cold_dm: string, follow_up: string } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const copyToClipboard = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleQuickMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!businessType || !offer) {
      toast.error('Please set your business details in settings first');
      return;
    }
    setLoadingMessage(true);
    try {
      const result = await generateOutreachMessage(businessType, offer, 'professional', lead.name, lead.category);
      setQuickMessage(result);
      toast.success('AI Message generated');
    } catch (error) {
      toast.error('Failed to generate message');
    } finally {
      setLoadingMessage(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const tags = lead.tags || [];
  const displayTags = showAllTags ? tags : tags.slice(0, 3);
  const hasMoreTags = tags.length > 3;

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
                className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground/60 hover:text-primary"
                title="Copy Address"
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead.aiScore !== undefined && (
            <div className="relative group/score">
              <div className={cn(
                "w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold border cursor-help",
                lead.aiScore > 70 ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                lead.aiScore > 40 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                <span className="text-[8px] opacity-70">SCORE</span>
                {lead.aiScore}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-popover border border-border rounded-xl shadow-2xl text-[10px] leading-relaxed text-popover-foreground opacity-0 invisible group-hover/score:opacity-100 group-hover/score:visible transition-all z-50">
                <div className="flex items-center gap-1.5 mb-2 text-primary">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <p className="font-bold text-xs">AI Scoring System</p>
                </div>
                <div className="space-y-2 opacity-90">
                  <div>
                    <p className="font-bold text-primary/80 mb-0.5 uppercase tracking-tighter">Relevance</p>
                    <p>How well the business matches your specific industry and offer.</p>
                  </div>
                  <div>
                    <p className="font-bold text-primary/80 mb-0.5 uppercase tracking-tighter">Growth Potential</p>
                    <p>Analysis of review trends, rating quality, and market presence.</p>
                  </div>
                  <div className="pt-1 border-t border-border/50">
                    <p className="italic text-[9px]">Higher scores indicate a better fit for your current outreach campaign.</p>
                  </div>
                </div>
              </div>
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
              className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground/60 hover:text-primary"
              title="Copy Phone"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
              <Mail className="w-3 h-3" />
              {lead.email}
            </div>
            <button 
              onClick={(e) => copyToClipboard(e, lead.email!, 'Email')}
              className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground/60 hover:text-primary"
              title="Copy Email"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        )}
        {lead.website ? (
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
              <Globe className="w-3 h-3" />
              <a 
                href={lead.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
            <button 
              onClick={(e) => copyToClipboard(e, lead.website!, 'Website URL')}
              className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground/60 hover:text-primary"
              title="Copy Website"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
            <Globe className="w-3 h-3" />
            <span className="italic opacity-50">No website found</span>
          </div>
        )}
      </div>

      {lead.notes && (
        <div className="mb-4 p-2 bg-accent/20 rounded-xl border border-border/50">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mb-1">
            <MessageSquare className="w-3 h-3" />
            NOTES
          </div>
          <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
            "{stripHtml(lead.notes)}"
          </p>
        </div>
      )}

      {customFieldDefinitions.length > 0 && lead.customFields && Object.keys(lead.customFields).length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-2">
          {customFieldDefinitions
            .filter(def => lead.customFields?.[def.id])
            .map(def => (
              <div key={def.id} className="flex items-center justify-between p-2 bg-accent/10 rounded-lg border border-border/30">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{def.label}</span>
                <span className="text-[10px] font-medium truncate max-w-[120px]">{lead.customFields?.[def.id]}</span>
              </div>
            ))}
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

      <div className="flex flex-wrap gap-1.5 mb-4">
        <AnimatePresence initial={false}>
          {displayTags.map((tag, idx) => (
            <motion.span 
              key={`${tag}-${idx}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-md text-[9px] font-bold text-primary uppercase tracking-wider"
            >
              {tag}
            </motion.span>
          ))}
        </AnimatePresence>
        {hasMoreTags && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowAllTags(!showAllTags);
            }}
            className="px-2 py-0.5 bg-accent/50 hover:bg-accent border border-border rounded-md text-[9px] font-bold text-muted-foreground uppercase tracking-wider transition-colors flex items-center gap-1"
          >
            {showAllTags ? (
              <>Hide <ChevronUp className="w-2.5 h-2.5" /></>
            ) : (
              <>+{tags.length - 3} more <ChevronDown className="w-2.5 h-2.5" /></>
            )}
          </button>
        )}
      </div>

      {(lead.phoneNumber || lead.email) && (
        <div className="flex gap-2 mb-4">
          {lead.phoneNumber && (
            <a 
              href={`tel:${lead.phoneNumber.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all border border-primary/20"
            >
              <Phone className="w-3 h-3" />
              Call
            </a>
          )}
          {lead.email && (
            <a 
              href={`mailto:${lead.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all border border-primary/20"
            >
              <Mail className="w-3 h-3" />
              Email
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 mb-4">
        <button
          onClick={handleQuickMessage}
          disabled={loadingMessage}
          className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          {loadingMessage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          {loadingMessage ? 'Generating...' : 'Quick Message'}
        </button>

        {quickMessage && (
          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-500 uppercase">AI Generated Message</span>
              <button 
                onClick={(e) => copyToClipboard(e, quickMessage.cold_dm, 'AI Message')}
                className="p-1 hover:bg-blue-500/10 rounded transition-colors"
              >
                <Copy className="w-3 h-3 text-blue-500" />
              </button>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground italic">
              "{quickMessage.cold_dm}"
            </p>
          </div>
        )}
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
