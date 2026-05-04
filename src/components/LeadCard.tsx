import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Users, MapPin, Phone, Globe, Star, MoreVertical, ExternalLink, 
  Copy, MessageSquare, HelpCircle, Mail, Zap, RefreshCw, 
  ChevronDown, ChevronUp, Tag as TagIcon, Hash, Calendar, Building
} from 'lucide-react';
import { Lead, CustomFieldDefinition } from '../types';
import { cn, formatNumber } from '../lib/utils';
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
  const createdAt = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'yellow';
      case 'replied': return 'purple';
      case 'converted': return 'green';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  const statusColor = lead.status ? getStatusColor(lead.status) : 'gray';

  return (
    <div 
      className="glass-dark rounded-3xl p-5 hover:border-primary/50 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col h-full border border-border/50"
      onClick={onView}
    >
      {/* Status Glow / Indicator */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 pointer-events-none transition-colors duration-500",
        statusColor === 'blue' ? "bg-blue-500" :
        statusColor === 'yellow' ? "bg-yellow-500" :
        statusColor === 'purple' ? "bg-purple-500" :
        statusColor === 'green' ? "bg-green-500" :
        statusColor === 'red' ? "bg-red-500" : "bg-muted"
      )} />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border shrink-0 transition-all duration-300 group-hover:scale-105",
              statusColor === 'blue' ? "bg-blue-500/5 border-blue-500/20" :
              statusColor === 'yellow' ? "bg-yellow-500/5 border-yellow-500/20" :
              statusColor === 'purple' ? "bg-purple-500/5 border-purple-500/20" :
              statusColor === 'green' ? "bg-green-500/5 border-green-500/20" :
              statusColor === 'red' ? "bg-red-500/5 border-red-500/20" : "bg-secondary border-border"
            )}>
              {lead.category?.toLowerCase().includes('gym') ? <Zap className="w-6 h-6 text-primary" /> :
               lead.category?.toLowerCase().includes('cafe') || lead.category?.toLowerCase().includes('restaurant') ? <Building className="w-6 h-6 text-primary" /> :
               <MapPin className="w-6 h-6 text-primary" />}
            </div>
            {/* Tiny status dot on avatar */}
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background",
              statusColor === 'blue' ? "bg-blue-500" :
              statusColor === 'yellow' ? "bg-yellow-500" :
              statusColor === 'purple' ? "bg-purple-500" :
              statusColor === 'green' ? "bg-green-500" :
              statusColor === 'red' ? "bg-red-500" : "bg-muted"
            )} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {lead.status && (
                <div className={cn(
                  "px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 border",
                  statusColor === 'blue' ? "bg-blue-500/20 text-blue-500 border-blue-500/30" :
                  statusColor === 'yellow' ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                  statusColor === 'purple' ? "bg-purple-500/20 text-purple-500 border-purple-500/30" :
                  statusColor === 'green' ? "bg-green-500/20 text-green-500 border-green-500/30" :
                  statusColor === 'red' ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-muted text-muted-foreground"
                )}>
                  {lead.status}
                </div>
              )}
              {createdAt && (
                <span className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {createdAt}
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2 truncate leading-tight">
              <span className="truncate">{lead.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <div className="flex items-center gap-1 min-w-0 mt-0.5">
              <p className="text-[11px] text-muted-foreground truncate opacity-70 leading-none">{lead.address}</p>
              <button 
                onClick={(e) => copyToClipboard(e, lead.address || '', 'Address')}
                className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground/40 hover:text-primary"
                title="Copy Address"
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10 font-mono">
          {lead.aiScore !== undefined && (
            <div className="relative group/score">
              <div className={cn(
                "w-12 h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-300 hover:scale-110",
                lead.aiScore > 70 ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-green-500/5" : 
                lead.aiScore > 40 ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-yellow-500/5" : "bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5"
              )}>
                <span className="text-[7px] font-bold opacity-60 tracking-widest">AI%</span>
                <span className="text-sm font-bold leading-none tracking-tighter">{lead.aiScore}</span>
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

      <div className="space-y-3 mb-6 relative z-10 flex-1">
        {lead.phoneNumber && (
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center gap-3 text-xs text-muted-foreground/90 font-medium truncate">
              <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                <Phone className="w-3 h-3 text-primary" />
              </div>
              {lead.phoneNumber}
            </div>
            <button 
              onClick={(e) => copyToClipboard(e, lead.phoneNumber!, 'Phone number')}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground/40 hover:text-primary"
              title="Copy Phone"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center gap-3 text-xs text-muted-foreground/90 font-medium truncate">
              <div className="w-6 h-6 rounded-lg bg-pink-500/5 flex items-center justify-center shrink-0 border border-pink-500/10">
                <Mail className="w-3 h-3 text-pink-500" />
              </div>
              {lead.email}
            </div>
            <button 
              onClick={(e) => copyToClipboard(e, lead.email!, 'Email')}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground/40 hover:text-primary"
              title="Copy Email"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {lead.website ? (
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center gap-3 text-xs text-muted-foreground/90 font-medium truncate">
              <div className="w-6 h-6 rounded-lg bg-blue-500/5 flex items-center justify-center shrink-0 border border-blue-500/10">
                <Globe className="w-3 h-3 text-blue-500" />
              </div>
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
              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground/40 hover:text-primary"
              title="Copy Website"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs text-muted-foreground/50 truncate">
            <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center shrink-0 border border-border">
              <Globe className="w-3 h-3 opacity-30" />
            </div>
            <span className="italic opacity-50">No website found</span>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-4 mt-auto relative z-10">
        {lead.notes && (
          <div className="p-3 bg-accent/30 rounded-2xl border border-border/50 relative">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground/60 mb-2 tracking-widest uppercase">
              <MessageSquare className="w-3 h-3" />
              LEAD NOTES
            </div>
            <p className="text-[11px] text-muted-foreground/90 line-clamp-3 leading-relaxed italic">
              "{stripHtml(lead.notes)}"
            </p>
          </div>
        )}

        {customFieldDefinitions.length > 0 && lead.customFields && Object.keys(lead.customFields).length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {customFieldDefinitions
              .filter(def => lead.customFields?.[def.id])
              .map(def => (
                <div key={def.id} className="flex flex-col p-2 bg-primary/5 rounded-xl border border-primary/10">
                  <span className="text-[8px] font-black text-primary/60 uppercase tracking-tight mb-0.5">{def.label}</span>
                  <span className="text-[10px] font-bold truncate text-foreground/80">{lead.customFields?.[def.id]}</span>
                </div>
              ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-border/40 font-mono">
            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Rating</span>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-500/80 fill-yellow-500/20" />
              <span className="font-bold text-sm tracking-tighter">{lead.rating || '---'}</span>
            </div>
          </div>
          <div className="bg-secondary/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1 border border-border/40 font-mono">
            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">Reviews</span>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary/80" />
              <span className="font-bold text-sm tracking-tighter">{formatNumber(lead.userRatingsTotal || 0)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence initial={false}>
            {displayTags.map((tag, idx) => (
              <motion.span 
                key={`${tag}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[9px] font-black text-primary uppercase tracking-tight"
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
              className="px-2.5 py-1 bg-accent/50 hover:bg-accent border border-border rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-tight transition-colors flex items-center gap-1"
            >
              {showAllTags ? (
                <>Less <ChevronUp className="w-2.5 h-2.5" /></>
              ) : (
                <>+{tags.length - 3} <ChevronDown className="w-2.5 h-2.5" /></>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 mt-2 relative z-10">
        <div className="flex gap-2">
          {lead.phoneNumber && (
            <a 
              href={`tel:${lead.phoneNumber.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 border border-primary/20 shadow-lg shadow-primary/5"
            >
              <Phone className="w-3.5 h-3.5" />
              Call
            </a>
          )}
          {lead.email && (
            <a 
              href={`mailto:${lead.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pink-500/10 hover:bg-pink-500 text-pink-500 hover:text-white rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 border border-pink-500/20 shadow-lg shadow-pink-500/5"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </a>
          )}
        </div>

        <button
          onClick={handleQuickMessage}
          disabled={loadingMessage}
          className="w-full py-3 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/5"
        >
          {loadingMessage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          {loadingMessage ? 'Thinking...' : 'AI Message'}
        </button>

        {quickMessage && (
          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Targeted Hook</span>
              <button 
                onClick={(e) => copyToClipboard(e, quickMessage.cold_dm, 'AI Message')}
                className="p-1.5 hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground italic font-medium">
              "{quickMessage.cold_dm}"
            </p>
          </div>
        )}

        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaved}
            className={cn(
              "w-full py-3 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300",
              isSaved 
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                : "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] border border-primary hover:bg-primary/90"
            )}
          >
            {isSaved ? 'SAVED' : 'SAVE LEAD'}
          </button>
        )}
      </div>
    </div>
  );
}
