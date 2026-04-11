/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { 
  LayoutDashboard, Users, Search, PenTool, Settings, 
  LogOut, Mail, Lock, Github, Chrome, Plus, Filter, 
  ArrowRight, CheckCircle2, MessageSquare, TrendingUp,
  Instagram, Copy, RefreshCw, Trash2, Save, MessageCircle, Send,
  ChevronRight, MoreHorizontal, CheckSquare, Square, Clock, Zap, X, Tag,
  MapPin, LayoutGrid, List, Globe, Phone, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Toaster, toast } from 'sonner';
import Papa from 'papaparse';

import { auth, db, googleProvider } from './lib/firebase';
import { cn, formatNumber } from './lib/utils';
import { Lead, LeadStatus, OutreachMessage, UserProfile, Task, AutomationRule } from './types';
import { googleMapsService } from './services/googleMapsService';
import { generateOutreachMessage, scoreLead } from './services/aiService';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';

import Layout from './components/Layout';
import StatsCard from './components/StatsCard';
import LeadCard from './components/LeadCard';
import LandingPage from './components/LandingPage';
import LeadDetailsModal from './components/LeadDetailsModal';
import OnboardingTour from './components/OnboardingTour';

// --- Auth Screen ---
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-2xl shadow-primary/40">
            <MapPin className="text-primary-foreground w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">GoogleLead AI</h1>
          <p className="text-muted-foreground">The ultimate Google Maps lead generation tool</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" placeholder="name@example.com" className="w-full bg-accent/50 border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" placeholder="••••••••" className="w-full bg-accent/50 border border-border rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Dashboard Screen ---
function DashboardScreen({ leads, tasks, onSelectLead }: { leads: Lead[], tasks: Task[], onSelectLead: (lead: Lead) => void }) {
  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, trend: '+12%', trendUp: true },
    { label: 'Messages Sent', value: leads.filter(l => l.status !== 'new').length, icon: MessageSquare, trend: '+5%', trendUp: true },
    { label: 'Conversions', value: leads.filter(l => l.status === 'converted').length, icon: CheckCircle2, trend: '+2%', trendUp: true },
    { label: 'Response Rate', value: '18%', icon: TrendingUp, trend: '+1%', trendUp: true },
  ];

  return (
    <div className="space-y-8" data-tour="dashboard">
      <header>
        <h2 className="text-3xl font-display font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's your outreach overview.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Leads</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.slice(0, 4).map((lead) => (
              <LeadCard key={lead.id} lead={lead} onView={() => onSelectLead(lead)} />
            ))}
            {leads.length === 0 && (
              <div className="col-span-full py-12 text-center bg-card rounded-3xl border border-dashed border-border">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No leads found. Start searching!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Upcoming Tasks
            </h3>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-4 bg-card border border-border rounded-2xl flex items-center gap-3 group">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="p-8 text-center bg-accent/20 rounded-2xl border border-dashed border-border">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-xs text-muted-foreground">All caught up!</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Find New Leads', icon: Search, color: 'bg-blue-500' },
                { label: 'Generate AI Message', icon: PenTool, color: 'bg-purple-500' },
              ].map((action) => (
                <button key={action.label} className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:bg-accent transition-colors group">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold flex-1 text-left">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Finder Screen ---
function FinderScreen({ onSaveLead, savedNames }: { onSaveLead: (lead: Partial<Lead>) => void, savedNames: Set<string> }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<Partial<Lead>[]>([]);
  const [page, setPage] = useState(1);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;
    setLoading(true);
    setPage(1);
    setSelectedNames(new Set());
    try {
      const data = await googleMapsService.searchLeads(keyword, location, 1);
      setResults(data);
    } catch (error) {
      console.error(error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await googleMapsService.searchLeads(keyword, location, nextPage);
      setResults(prev => [...prev, ...data]);
      setPage(nextPage);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load more leads.');
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleSelect = (name: string) => {
    const newSelected = new Set(selectedNames);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedNames(newSelected);
  };

  const handleSaveSelected = async () => {
    const toSave = results.filter(r => r.name && selectedNames.has(r.name) && !savedNames.has(r.name));
    if (toSave.length === 0) return;
    
    toast.promise(
      Promise.all(toSave.map(lead => onSaveLead(lead))),
      {
        loading: `Saving ${toSave.length} leads...`,
        success: `Successfully saved ${toSave.length} leads`,
        error: 'Failed to save some leads'
      }
    );
    setSelectedNames(new Set());
  };

  return (
    <div className="space-y-8" data-tour="finder">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Lead Finder</h2>
          <p className="text-muted-foreground">Search Google Maps for potential business leads.</p>
        </div>
        {selectedNames.size > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSaveSelected}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Save Selected ({selectedNames.size})
          </motion.button>
        )}
      </header>

      <form onSubmit={handleSearch} className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. Gym, Cafe, Real Estate" 
                className="w-full bg-accent/50 border border-border rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary transition-all" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, New York" 
                className="w-full bg-accent/50 border border-border rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary transition-all" 
              />
            </div>
          </div>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {loading ? 'Searching...' : 'Find Leads'}
        </button>
      </form>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((lead, i) => (
            <motion.div
              key={`${lead.name}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (i % 20) * 0.05 }}
              className="relative"
            >
              <div className="absolute top-4 left-4 z-10">
                <button 
                  onClick={() => toggleSelect(lead.name!)}
                  className="text-muted-foreground hover:text-primary transition-colors bg-background/80 backdrop-blur-sm rounded-lg p-1"
                >
                  {selectedNames.has(lead.name!) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                </button>
              </div>
              <LeadCard 
                lead={lead} 
                onSave={() => onSaveLead(lead)} 
                isSaved={savedNames.has(lead.name!)}
              />
            </motion.div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-accent hover:bg-accent/80 text-foreground rounded-xl font-bold transition-all flex items-center gap-2"
            >
              {loadingMore ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {loadingMore ? 'Loading More...' : 'Load More Leads'}
            </button>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="py-20 text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground">Search results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Leads Screen ---
function LeadsScreen({ 
  leads, 
  onUpdateStatus, 
  onDeleteLead, 
  onSelectLead,
  businessType,
  offer,
  user
}: { 
  leads: Lead[], 
  onUpdateStatus: (id: string, status: LeadStatus) => void, 
  onDeleteLead: (id: string) => void,
  onSelectLead: (lead: Lead) => void,
  businessType: string,
  offer: string,
  user: FirebaseUser
}) {
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [messagingBulk, setMessagingBulk] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'followers'>('date');
  const [scoringBulk, setScoringBulk] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const handleImportLeads = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const newLeads = results.data as any[];
          let count = 0;
          for (const leadData of newLeads) {
            if (!leadData.name) continue;
            
            await addDoc(collection(db, 'leads'), {
              ownerId: user.uid,
              name: leadData.name,
              address: leadData.address || '',
              phoneNumber: leadData.phoneNumber || '',
              website: leadData.website || '',
              rating: parseFloat(leadData.rating) || 0,
              userRatingsTotal: parseInt(leadData.userRatingsTotal) || 0,
              category: leadData.category || '',
              status: 'new',
              tags: leadData.tags ? leadData.tags.split(',').map((t: string) => t.trim()) : [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            count++;
          }
          toast.success(`Successfully imported ${count} leads`);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'leads');
        } finally {
          setImporting(false);
        }
      }
    });
  };

  const handleBulkMessage = async () => {
    if (!businessType || !offer) {
      toast.error('Please set your business details first');
      return;
    }
    setMessagingBulk(true);
    try {
      const selectedLeads = leads.filter(l => selectedIds.has(l.id));
      for (const lead of selectedLeads) {
        const result = await generateOutreachMessage(businessType, offer, 'professional', lead.name, lead.category);
        await addDoc(collection(db, 'messages'), {
          ownerId: user.uid,
          leadId: lead.id,
          content: result.cold_dm,
          type: 'cold_dm',
          createdAt: new Date().toISOString()
        });
      }
      toast.success(`Generated messages for ${selectedLeads.length} leads`);
      setSelectedIds(new Set());
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'messages');
    } finally {
      setMessagingBulk(false);
    }
  };

  const filteredLeads = leads
    .filter(l => filter === 'all' ? true : l.status === filter)
    .filter(l => {
      const query = searchQuery.toLowerCase();
      return l.name.toLowerCase().includes(query) || 
             l.address.toLowerCase().includes(query) ||
             (l.category && l.category.toLowerCase().includes(query)) ||
             (l.tags && l.tags.some(t => t.toLowerCase().includes(query)));
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.aiScore || 0) - (a.aiScore || 0);
      if (sortBy === 'followers') return (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} leads?`)) {
      selectedIds.forEach(id => onDeleteLead(id));
      setSelectedIds(new Set());
    }
  };

  const handleBulkStatusUpdate = (status: LeadStatus) => {
    selectedIds.forEach(id => onUpdateStatus(id, status));
    setSelectedIds(new Set());
  };

  const handleBulkTag = async () => {
    if (!tagInput) return;
    try {
      const selectedLeads = leads.filter(l => selectedIds.has(l.id));
      for (const lead of selectedLeads) {
        const newTags = Array.from(new Set([...(lead.tags || []), tagInput]));
        await updateDoc(doc(db, 'leads', lead.id), {
          tags: newTags,
          updatedAt: new Date().toISOString()
        });
      }
      setTagInput('');
      setShowTagInput(false);
      setSelectedIds(new Set());
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'leads');
    }
  };
  const handleBulkScore = async () => {
    if (!businessType || !offer) {
      alert('Please set your business type and offer in the AI Writer or Settings first.');
      return;
    }
    setScoringBulk(true);
    try {
      const selectedLeads = leads.filter(l => selectedIds.has(l.id));
      for (const lead of selectedLeads) {
        const result = await scoreLead(
          lead.name, 
          lead.category || '', 
          lead.rating || 0, 
          lead.userRatingsTotal || 0,
          businessType, 
          offer
        );
        await updateDoc(doc(db, 'leads', lead.id), {
          aiScore: result.score,
          aiReasoning: result.reasoning,
          updatedAt: new Date().toISOString()
        });
      }
      setSelectedIds(new Set());
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'leads');
    } finally {
      setScoringBulk(false);
    }
  };

  return (
    <div className="space-y-8" data-tour="leads">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">My Leads</h2>
          <p className="text-muted-foreground">Manage and track your outreach progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-card border border-border rounded-xl p-1 mr-2">
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'table' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <label className="cursor-pointer px-4 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-bold hover:bg-accent/80 transition-all flex items-center gap-2">
            <Plus className="w-3 h-3" />
            {importing ? 'Importing...' : 'Import CSV'}
            <input type="file" accept=".csv" onChange={handleImportLeads} className="hidden" disabled={importing} />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'new', 'contacted', 'replied', 'converted', 'lost'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {s.toUpperCase()}
            </button>
          ))}
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, address or tag..." 
            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary transition-all" 
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-card border border-border rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="date">Date Added</option>
            <option value="score">AI Score</option>
            <option value="followers">Reviews</option>
          </select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Bulk Actions
            </div>
            <p className="text-sm font-bold text-primary">{selectedIds.size} leads selected</p>
          </div>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full lg:w-auto">
            {showTagInput ? (
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <input 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="New tag..."
                  className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none w-full sm:w-32"
                />
                <button 
                  onClick={handleBulkTag}
                  className="p-2 bg-primary text-primary-foreground rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowTagInput(false)}
                  className="p-2 bg-accent rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowTagInput(true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-bold hover:bg-accent/80 transition-all flex items-center justify-center gap-2"
              >
                <Tag className="w-3 h-3" />
                Add Tag
              </button>
            )}
            <select 
              onChange={(e) => handleBulkStatusUpdate(e.target.value as LeadStatus)}
              className="flex-1 sm:flex-none bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold outline-none"
              defaultValue=""
            >
              <option value="" disabled>Update Status</option>
              <option value="new">NEW</option>
              <option value="contacted">CONTACTED</option>
              <option value="replied">REPLIED</option>
              <option value="converted">CONVERTED</option>
              <option value="lost">LOST</option>
            </select>
            <button 
              onClick={handleBulkDelete}
              className="flex-1 sm:flex-none px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-xs font-bold hover:bg-destructive/90 transition-all"
            >
              Delete Selected
            </button>
            <button 
              onClick={handleBulkScore}
              disabled={scoringBulk}
              className="flex-1 sm:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {scoringBulk ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              {scoringBulk ? 'Scoring...' : 'Score Selected'}
            </button>
            <button 
              onClick={handleBulkMessage}
              disabled={messagingBulk}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {messagingBulk ? <RefreshCw className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
              {messagingBulk ? 'Generating...' : 'Bulk Message'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-border">
          {filteredLeads.map((lead) => (
            <div 
              key={lead.id} 
              className={cn(
                "p-4 space-y-4 transition-colors active:bg-accent/20",
                selectedIds.has(lead.id) && "bg-primary/5"
              )}
              onClick={() => onSelectLead(lead)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {selectedIds.has(lead.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{lead.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{lead.address}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {lead.aiScore !== undefined && (
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold",
                    lead.aiScore > 70 ? "bg-green-500/10 text-green-500" : 
                    lead.aiScore > 40 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {lead.aiScore}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <select 
                  value={lead.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                  className={cn(
                    "text-[10px] font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer border border-transparent",
                    lead.status === 'new' && "bg-blue-500/10 text-blue-500",
                    lead.status === 'contacted' && "bg-yellow-500/10 text-yellow-500",
                    lead.status === 'replied' && "bg-purple-500/10 text-purple-500",
                    lead.status === 'converted' && "bg-green-500/10 text-green-500",
                    lead.status === 'lost' && "bg-red-500/10 text-red-500",
                  )}
                >
                  <option value="new">NEW</option>
                  <option value="contacted">CONTACTED</option>
                  <option value="replied">REPLIED</option>
                  <option value="converted">CONVERTED</option>
                  <option value="lost">LOST</option>
                </select>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }}
                    className="p-2 bg-accent rounded-lg text-muted-foreground"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteLead(lead.id); }}
                    className="p-2 bg-destructive/10 text-destructive rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Desktop View: Table/Grid */}
      <div className="hidden md:block">
        {viewMode === 'table' ? (
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="p-4 w-10">
                      <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-primary transition-colors">
                        {selectedIds.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                      </button>
                    </th>
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Business Name</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Score</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Added</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className={cn(
                      "hover:bg-accent/20 transition-colors group cursor-pointer",
                      selectedIds.has(lead.id) && "bg-primary/5"
                    )} onClick={() => onSelectLead(lead)}>
                      <td className="p-4" onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}>
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          {selectedIds.has(lead.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold truncate max-w-[150px]">{lead.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{lead.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {lead.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {lead.phoneNumber}
                            </div>
                          )}
                          {lead.website && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-[100px]">{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {lead.rating || 'N/A'}
                          <span className="text-[10px] text-muted-foreground font-normal">({lead.userRatingsTotal || 0})</span>
                        </div>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select 
                          value={lead.status}
                          onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                          className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-lg outline-none cursor-pointer",
                            lead.status === 'new' && "bg-blue-500/10 text-blue-500",
                            lead.status === 'contacted' && "bg-yellow-500/10 text-yellow-500",
                            lead.status === 'replied' && "bg-purple-500/10 text-purple-500",
                            lead.status === 'converted' && "bg-green-500/10 text-green-500",
                            lead.status === 'lost' && "bg-red-500/10 text-red-500",
                          )}
                        >
                          <option value="new">NEW</option>
                          <option value="contacted">CONTACTED</option>
                          <option value="replied">REPLIED</option>
                          <option value="converted">CONVERTED</option>
                          <option value="lost">LOST</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {lead.aiScore !== undefined ? (
                          <div className={cn(
                            "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold",
                            lead.aiScore > 70 ? "bg-green-500/10 text-green-500" : 
                            lead.aiScore > 40 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {lead.aiScore}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => onSelectLead(lead)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-primary"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteLead(lead.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && (
                <div className="py-20 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                  <p className="text-muted-foreground">No leads found in this category</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLeads.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="relative group">
                  <div className="absolute top-4 left-4 z-10" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleSelect(lead.id)}
                      className="text-muted-foreground hover:text-primary transition-colors bg-background/80 backdrop-blur-sm rounded-lg p-1"
                    >
                      {selectedIds.has(lead.id) ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                    </button>
                  </div>
                  <LeadCard 
                    lead={lead} 
                    onView={() => onSelectLead(lead)}
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <select 
                      value={lead.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg outline-none cursor-pointer border border-transparent shadow-sm",
                        lead.status === 'new' && "bg-blue-500 text-white",
                        lead.status === 'contacted' && "bg-yellow-500 text-white",
                        lead.status === 'replied' && "bg-purple-500 text-white",
                        lead.status === 'converted' && "bg-green-500 text-white",
                        lead.status === 'lost' && "bg-red-500 text-white",
                      )}
                    >
                      <option value="new">NEW</option>
                      <option value="contacted">CONTACTED</option>
                      <option value="replied">REPLIED</option>
                      <option value="converted">CONVERTED</option>
                      <option value="lost">LOST</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredLeads.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground">No leads found in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// --- AI Writer Screen ---
function AIWriterScreen({ user, businessProfile }: { user: FirebaseUser, businessProfile: { businessType: string, offer: string } }) {
  const [businessType, setBusinessType] = useState(businessProfile.businessType);
  const [offer, setOffer] = useState(businessProfile.offer);
  const [tone, setTone] = useState('casual');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<{ cold_dm: string, follow_up: string } | null>(null);

  useEffect(() => {
    setBusinessType(businessProfile.businessType);
    setOffer(businessProfile.offer);
    
    // Auto-generate if both are present and messages haven't been generated yet
    if (businessProfile.businessType && businessProfile.offer && !messages && !loading) {
      const autoGen = async () => {
        setLoading(true);
        try {
          const result = await generateOutreachMessage(businessProfile.businessType, businessProfile.offer, tone);
          setMessages(result);
          toast.success('Messages auto-generated from your profile');
        } catch (error) {
          console.error('Auto-generation failed:', error);
        } finally {
          setLoading(false);
        }
      };
      autoGen();
    }
  }, [businessProfile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        businessType,
        offer,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Business profile saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !offer) return;
    setLoading(true);
    try {
      await handleSaveProfile();
      const result = await generateOutreachMessage(businessType, offer, tone);
      setMessages(result);
      toast.success('Messages generated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate messages');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast would go here
  };

  return (
    <div className="space-y-8" data-tour="writer">
      <header>
        <h2 className="text-3xl font-display font-bold tracking-tight">AI Message Writer</h2>
        <p className="text-muted-foreground">Generate high-converting outreach messages using AI.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleGenerate} className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6 h-fit">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Business Type</label>
            <input 
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="e.g. Web Design Agency, Fitness Coaching" 
              className="w-full bg-accent/50 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Offer</label>
            <textarea 
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g. A free website audit, 20% off first month" 
              className="w-full bg-accent/50 border border-border rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-primary transition-all min-h-[100px]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {['casual', 'professional', 'bold'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold transition-all",
                    tone === t ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:bg-accent/80"
                  )}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate Messages'}
          </button>
        </form>

        <div className="space-y-6">
          {messages ? (
            <>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-3xl p-6 shadow-xl relative group"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-primary flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Cold DM
                  </h4>
                  <button 
                    onClick={() => copyToClipboard(messages.cold_dm)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{messages.cold_dm}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-3xl p-6 shadow-xl relative group"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-purple-500 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Follow-up
                  </h4>
                  <button 
                    onClick={() => copyToClipboard(messages.follow_up)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{messages.follow_up}</p>
              </motion.div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-accent/20 rounded-3xl border border-dashed border-border">
              <PenTool className="w-16 h-16 text-muted-foreground mb-4 opacity-10" />
              <p className="text-muted-foreground">Generated messages will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Chat Screen ---
function ChatScreen() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [...messages, { role: 'user', text: userMessage }].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "You are InstaLead AI Assistant. Help users with Instagram lead generation, outreach strategies, and CRM management. Be professional, helpful, and concise.",
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Sorry, I encountered an error.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-border bg-accent/30 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-sm">InstaLead AI Assistant</h3>
          <p className="text-[10px] text-muted-foreground">Online | Powered by Gemini 3.1 Pro</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <MessageCircle className="w-12 h-12 mb-4" />
            <p className="text-sm">Ask me anything about leads or outreach!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex w-full",
            m.role === 'user' ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[80%] p-3 rounded-2xl text-sm",
              m.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "bg-accent text-foreground rounded-tl-none"
            )}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-accent p-3 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-border bg-accent/10 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..." 
          className="flex-1 bg-accent/50 border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary transition-all"
        />
        <button 
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

// --- Automation Screen ---
function AutomationScreen({ user, rules }: { user: FirebaseUser, rules: AutomationRule[] }) {
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTriggerStatus, setNewRuleTriggerStatus] = useState<LeadStatus>('replied');
  const [newRuleTaskTitle, setNewRuleTaskTitle] = useState('');
  const [newRuleTaskPriority, setNewRuleTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newRuleDaysOffset, setNewRuleDaysOffset] = useState(1);
  const [addingRule, setAddingRule] = useState(false);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleTaskTitle) return;
    setAddingRule(true);
    try {
      await addDoc(collection(db, 'automationRules'), {
        ownerId: user.uid,
        name: newRuleName,
        trigger: {
          type: 'status_change',
          status: newRuleTriggerStatus
        },
        action: {
          type: 'create_task',
          taskTitle: newRuleTaskTitle,
          taskPriority: newRuleTaskPriority,
          daysOffset: newRuleDaysOffset
        },
        enabled: true,
        createdAt: new Date().toISOString()
      });
      setNewRuleName('');
      setNewRuleTaskTitle('');
      toast.success('Automation rule added');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'automationRules');
    } finally {
      setAddingRule(false);
    }
  };

  const toggleRule = async (rule: AutomationRule) => {
    try {
      await updateDoc(doc(db, 'automationRules', rule.id), { enabled: !rule.enabled });
      toast.success(`Rule ${!rule.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `automationRules/${rule.id}`);
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'automationRules', id));
      toast.success('Rule deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `automationRules/${id}`);
    }
  };

  return (
    <div className="space-y-8" data-tour="automation">
      <header>
        <h2 className="text-3xl font-display font-bold tracking-tight">Automation</h2>
        <p className="text-muted-foreground">Automate your workflow with status-based triggers.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleAddRule} className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6 sticky top-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">New Rule</h3>
              <Plus className="w-5 h-5 text-primary" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Rule Name</label>
                <input 
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  placeholder="e.g. Follow-up on Reply"
                  className="w-full bg-accent/30 border border-border rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">If Status Changes To</label>
                <select 
                  value={newRuleTriggerStatus}
                  onChange={e => setNewRuleTriggerStatus(e.target.value as any)}
                  className="w-full bg-accent/30 border border-border rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="new">NEW</option>
                  <option value="contacted">CONTACTED</option>
                  <option value="replied">REPLIED</option>
                  <option value="converted">CONVERTED</option>
                  <option value="lost">LOST</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Then Create Task</label>
                <input 
                  value={newRuleTaskTitle}
                  onChange={e => setNewRuleTaskTitle(e.target.value)}
                  placeholder="Task Title"
                  className="w-full bg-accent/30 border border-border rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Priority</label>
                  <select 
                    value={newRuleTaskPriority}
                    onChange={e => setNewRuleTaskPriority(e.target.value as any)}
                    className="w-full bg-accent/30 border border-border rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="low">LOW</option>
                    <option value="medium">MEDIUM</option>
                    <option value="high">HIGH</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Days Offset</label>
                  <input 
                    type="number"
                    min="0"
                    value={newRuleDaysOffset}
                    onChange={e => setNewRuleDaysOffset(parseInt(e.target.value))}
                    className="w-full bg-accent/30 border border-border rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={addingRule}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {addingRule ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {addingRule ? 'Adding...' : 'Add Automation Rule'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Active Rules
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{rules.length}</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {rules.map(rule => (
              <motion.div 
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-3xl p-6 shadow-lg flex items-center justify-between group hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    rule.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{rule.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="bg-accent px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase">{rule.trigger.status}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>Create "{rule.action.taskTitle}"</span>
                      <span className="text-[10px] opacity-70">(+{rule.action.daysOffset}d)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleRule(rule)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all duration-300",
                      rule.enabled ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                      rule.enabled ? "right-1" : "left-1"
                    )} />
                  </button>
                  <button 
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
            {rules.length === 0 && (
              <div className="py-20 text-center bg-accent/10 rounded-3xl border border-dashed border-border">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
                <p className="text-muted-foreground">No automation rules configured yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Settings Screen ---
function SettingsScreen({ user, profile }: { user: FirebaseUser, profile: UserProfile | null }) {
  const toggleTheme = async () => {
    if (!profile) return;
    const newTheme = profile.settings?.theme === 'dark' ? 'light' : 'dark';
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        'settings.theme': newTheme,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Theme switched to ${newTheme} mode`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
    }
  };

  return (
    <div className="space-y-8" data-tour="settings">
      <header>
        <h2 className="text-3xl font-display font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </header>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Profile Information
          </h3>
          <div className="flex items-center gap-6 p-4 bg-accent/20 rounded-2xl border border-border">
            <img src={user.photoURL || ''} alt="" className="w-20 h-20 rounded-3xl border-2 border-primary/20 shadow-lg" />
            <div>
              <p className="font-bold text-xl">{user.displayName}</p>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                {profile?.role || 'User'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            App Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-2xl border border-border group hover:border-primary/50 transition-all">
              <div>
                <p className="font-bold">Theme Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark interface</p>
              </div>
              <button 
                onClick={toggleTheme}
                className={cn(
                  "w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner",
                  profile?.settings?.theme === 'dark' ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md flex items-center justify-center",
                  profile?.settings?.theme === 'dark' ? "right-1" : "left-1"
                )}>
                  {profile?.settings?.theme === 'dark' ? <Clock className="w-3 h-3 text-primary" /> : <RefreshCw className="w-3 h-3 text-muted-foreground" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => signOut(auth)}
          className="w-full py-4 bg-destructive/10 text-destructive rounded-3xl font-bold hover:bg-destructive/20 transition-all flex items-center justify-center gap-2 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [showLanding, setShowLanding] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [businessProfile, setBusinessProfile] = useState({ businessType: '', offer: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setShowLanding(false);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const qLeads = query(collection(db, 'leads'), where('ownerId', '==', user.uid));
    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
      setLeads(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });

    const qTasks = query(collection(db, 'tasks'), where('ownerId', '==', user.uid), where('completed', '==', false));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
      setTasks(data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    // Fetch business profile and user profile
    const profileRef = doc(db, 'profiles', user.uid);
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({ uid: user.uid, ...data } as UserProfile);
        setBusinessProfile({
          businessType: data.businessType || '',
          offer: data.offer || ''
        });
      } else {
        // Initialize profile
        const newProfile: Partial<UserProfile> = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          onboardingCompleted: false,
          settings: {
            theme: 'light',
            apiKeys: {}
          }
        };
        const initProfile = async () => {
          try {
            await setDoc(profileRef, newProfile);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
          }
        };
        initProfile();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `profiles/${user.uid}`);
    });

    const qRules = query(collection(db, 'automationRules'), where('ownerId', '==', user.uid));
    const unsubRules = onSnapshot(qRules, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AutomationRule[];
      setAutomationRules(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'automationRules');
    });

    return () => {
      unsubLeads();
      unsubTasks();
      unsubProfile();
      unsubRules();
    };
  }, [user]);

  useEffect(() => {
    const theme = profile?.settings?.theme || 'dark';
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [profile]);

  const toggleTheme = async () => {
    if (!user || !profile) return;
    const newTheme = profile.settings?.theme === 'dark' ? 'light' : 'dark';
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        'settings.theme': newTheme,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Theme switched to ${newTheme} mode`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
    }
  };

  const handleSaveLead = async (leadData: Partial<Lead>) => {
    if (!user) return;
    try {
      let scoreData = {};
      if (businessProfile.businessType && businessProfile.offer) {
        try {
          const result = await scoreLead(
            leadData.name!, 
            leadData.category || '', 
            leadData.rating || 0, 
            leadData.userRatingsTotal || 0,
            businessProfile.businessType, 
            businessProfile.offer
          );
          scoreData = {
            aiScore: result.score,
            aiReasoning: result.reasoning
          };
        } catch (err) {
          console.error("Auto-scoring failed:", err);
        }
      }

      await addDoc(collection(db, 'leads'), {
        ...leadData,
        ...scoreData,
        ownerId: user.uid,
        status: 'new',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'leads');
    }
  };

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    try {
      await updateDoc(doc(db, 'leads', id), { 
        status,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Lead status updated to ${status}`);

      // Trigger Automation Rules
      const triggeredRules = automationRules.filter(r => r.enabled && r.trigger.type === 'status_change' && r.trigger.status === status);
      for (const rule of triggeredRules) {
        if (rule.action.type === 'create_task') {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + rule.action.daysOffset);
          
          await addDoc(collection(db, 'tasks'), {
            ownerId: user!.uid,
            leadId: id,
            title: rule.action.taskTitle,
            priority: rule.action.taskPriority,
            dueDate: dueDate.toISOString().split('T')[0],
            completed: false,
            createdAt: new Date().toISOString(),
          });
          toast.info(`Automation: Task "${rule.action.taskTitle}" created`);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${id}`);
    }
  };

  const handleUpdateLead = async (id: string, data: Partial<Lead>) => {
    try {
      await updateDoc(doc(db, 'leads', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      toast.success('Lead updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${id}`);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  const savedNames = new Set(leads.map(l => l.name));

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      {profile && !profile.onboardingCompleted && (
        <OnboardingTour onComplete={async () => {
          try {
            await updateDoc(doc(db, 'profiles', user!.uid), { onboardingCompleted: true });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `profiles/${user!.uid}`);
          }
        }} />
      )}
      <Routes>
        <Route element={<Layout theme={profile?.settings?.theme || 'dark'} onToggleTheme={toggleTheme} />}>
          <Route path="/" element={<DashboardScreen leads={leads} tasks={tasks} onSelectLead={setSelectedLead} />} />
          <Route path="/leads" element={
            <LeadsScreen 
              leads={leads} 
              onUpdateStatus={handleUpdateStatus} 
              onDeleteLead={handleDeleteLead}
              onSelectLead={setSelectedLead}
              businessType={businessProfile.businessType}
              offer={businessProfile.offer}
              user={user}
            />
          } />
          <Route path="/finder" element={<FinderScreen onSaveLead={handleSaveLead} savedNames={savedNames} />} />
          <Route path="/ai-writer" element={<AIWriterScreen user={user} businessProfile={businessProfile} />} />
          <Route path="/automation" element={<AutomationScreen user={user} rules={automationRules} />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/settings" element={<SettingsScreen user={user} profile={profile} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      <AnimatePresence>
        {selectedLead && (
          <LeadDetailsModal 
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onUpdateStatus={handleUpdateStatus}
            onUpdateLead={handleUpdateLead}
            onDelete={(id) => {
              if (window.confirm('Are you sure you want to delete this lead?')) {
                handleDeleteLead(id);
                setSelectedLead(null);
              }
            }}
            businessType={businessProfile.businessType}
            offer={businessProfile.offer}
          />
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}
