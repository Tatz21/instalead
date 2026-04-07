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
  Instagram, Copy, RefreshCw, Trash2, Save, MessageCircle, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

import { auth, db, googleProvider } from './lib/firebase';
import { cn, formatNumber } from './lib/utils';
import { Lead, LeadStatus, OutreachMessage, UserProfile } from './types';
import { instagramService } from './services/instagramService';
import { generateOutreachMessage } from './services/aiService';

import Layout from './components/Layout';
import StatsCard from './components/StatsCard';
import LeadCard from './components/LeadCard';

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
            <Search className="text-primary-foreground w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">InstaLead AI</h1>
          <p className="text-muted-foreground">The ultimate Instagram lead generation tool</p>
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
function DashboardScreen({ leads }: { leads: Lead[] }) {
  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, trend: '+12%', trendUp: true },
    { label: 'Messages Sent', value: leads.filter(l => l.status !== 'new').length, icon: MessageSquare, trend: '+5%', trendUp: true },
    { label: 'Conversions', value: leads.filter(l => l.status === 'converted').length, icon: CheckCircle2, trend: '+2%', trendUp: true },
    { label: 'Response Rate', value: '18%', icon: TrendingUp, trend: '+1%', trendUp: true },
  ];

  return (
    <div className="space-y-8">
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
              <LeadCard key={lead.id} lead={lead} />
            ))}
            {leads.length === 0 && (
              <div className="col-span-full py-12 text-center bg-card rounded-3xl border border-dashed border-border">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No leads found. Start searching!</p>
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
              { label: 'Export CRM (CSV)', icon: Github, color: 'bg-gray-500' },
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
  );
}

// --- Finder Screen ---
function FinderScreen({ onSaveLead, savedUsernames }: { onSaveLead: (lead: Partial<Lead>) => void, savedUsernames: Set<string> }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Partial<Lead>[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;
    setLoading(true);
    try {
      const data = await instagramService.searchLeads(keyword, location, [0, 1000000]);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold tracking-tight">Lead Finder</h2>
        <p className="text-muted-foreground">Search Instagram for potential business leads.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((lead, i) => (
          <motion.div
            key={lead.username}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <LeadCard 
              lead={lead} 
              onSave={() => onSaveLead(lead)} 
              isSaved={savedUsernames.has(lead.username!)}
            />
          </motion.div>
        ))}
        {results.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center">
            <Instagram className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
            <p className="text-muted-foreground">Search results will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Leads Screen ---
function LeadsScreen({ leads, onUpdateStatus, onDeleteLead }: { leads: Lead[], onUpdateStatus: (id: string, status: LeadStatus) => void, onDeleteLead: (id: string) => void }) {
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">My Leads</h2>
          <p className="text-muted-foreground">Manage and track your outreach progress.</p>
        </div>
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
      </header>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Username</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Followers</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Added</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-accent/20 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="font-bold">@{lead.username}</span>
                    </div>
                  </td>
                  <td className="p-4">
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
                  <td className="p-4 text-sm font-medium">{formatNumber(lead.followers)}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-primary">
                        <PenTool className="w-4 h-4" />
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
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground">No leads found in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- AI Writer Screen ---
function AIWriterScreen() {
  const [businessType, setBusinessType] = useState('');
  const [offer, setOffer] = useState('');
  const [tone, setTone] = useState('casual');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ cold_dm: string, follow_up: string } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !offer) return;
    setLoading(true);
    try {
      const result = await generateOutreachMessage(businessType, offer, tone);
      setMessages(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast would go here
  };

  return (
    <div className="space-y-8">
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

// --- Settings Screen ---
function SettingsScreen({ user }: { user: FirebaseUser }) {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-display font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </header>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-xl font-bold">Profile</h3>
          <div className="flex items-center gap-4">
            <img src={user.photoURL || ''} alt="" className="w-16 h-16 rounded-2xl border border-border" />
            <div>
              <p className="font-bold text-lg">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-xl font-bold">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts for new replies</p>
              </div>
              <div className="w-12 h-6 bg-muted rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-xl font-bold">API Keys</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gemini API Key</label>
              <input type="password" value="••••••••••••••••" readOnly className="w-full bg-accent/50 border border-border rounded-xl py-2.5 px-4 outline-none" />
            </div>
          </div>
        </div>

        <button 
          onClick={() => signOut(auth)}
          className="w-full py-4 bg-destructive/10 text-destructive rounded-2xl font-bold hover:bg-destructive/20 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'leads'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
      setLeads(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSaveLead = async (leadData: Partial<Lead>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'leads'), {
        ...leadData,
        ownerId: user.uid,
        status: 'new',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    try {
      await updateDoc(doc(db, 'leads', id), { 
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const savedUsernames = new Set(leads.map(l => l.username));

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardScreen leads={leads} />} />
          <Route path="/leads" element={<LeadsScreen leads={leads} onUpdateStatus={handleUpdateStatus} onDeleteLead={handleDeleteLead} />} />
          <Route path="/finder" element={<FinderScreen onSaveLead={handleSaveLead} savedUsernames={savedUsernames} />} />
          <Route path="/ai-writer" element={<AIWriterScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/settings" element={<SettingsScreen user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
