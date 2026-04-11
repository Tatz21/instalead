import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Phone, Globe, Star, Tag, Calendar, MessageSquare, Trash2, CheckCircle2, Clock, Plus, BarChart3, RefreshCw, Save, Zap, Copy, ArrowRight, HelpCircle } from 'lucide-react';
import { Lead, LeadStatus, Task } from '../types';
import { cn, formatNumber } from '../lib/utils';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { scoreLead } from '../services/aiService';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
  onUpdateLead?: (id: string, data: Partial<Lead>) => void;
  businessType: string;
  offer: string;
}

export default function LeadDetailsModal({ lead, onClose, onUpdateStatus, onDelete, onUpdateLead, businessType, offer }: LeadDetailsModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [scoring, setScoring] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const [editPhone, setEditPhone] = useState(lead.phoneNumber || '');
  const [editWebsite, setEditWebsite] = useState(lead.website || '');
  const [editCategory, setEditCategory] = useState(lead.category || '');
  const [savingInfo, setSavingInfo] = useState(false);
  const [websiteError, setWebsiteError] = useState(false);

  const validateUrl = (url: string) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return pattern.test(url);
  };

  useEffect(() => {
    setNotes(lead.notes || '');
    setEditPhone(lead.phoneNumber || '');
    setEditWebsite(lead.website || '');
    setEditCategory(lead.category || '');
    setWebsiteError(false);
  }, [lead]);

  const handleSaveInfo = async () => {
    if (!onUpdateLead) return;
    if (!validateUrl(editWebsite)) {
      setWebsiteError(true);
      toast.error('Please enter a valid website URL');
      return;
    }
    setSavingInfo(true);
    try {
      await onUpdateLead(lead.id, {
        phoneNumber: editPhone,
        website: editWebsite,
        category: editCategory
      });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, 'leads', lead.id), {
        notes,
        updatedAt: new Date().toISOString()
      });
      toast.success('Notes saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${lead.id}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  useEffect(() => {
    const path = 'tasks';
    const q = query(collection(db, path), where('leadId', '==', lead.id), where('ownerId', '==', lead.ownerId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
      setTasks(data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [lead.id, lead.ownerId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDate) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        ownerId: lead.ownerId,
        leadId: lead.id,
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        dueDate: newTaskDate,
        completed: false,
        createdAt: new Date().toISOString(),
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskDate('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks');
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), { completed: !task.completed });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${task.id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const handleScoreLead = async () => {
    if (!businessType || !offer) {
      alert('Please set your business type and offer in the AI Writer or Settings first.');
      return;
    }
    setScoring(true);
    try {
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
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${lead.id}`);
    } finally {
      setScoring(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-accent/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold tracking-tight">{lead.name}</h2>
              <p className="text-sm text-muted-foreground">{lead.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDelete(lead.id)}
              className="p-2 hover:bg-destructive/10 rounded-xl transition-colors text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info & AI Scoring */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                AI Lead Analysis
              </h3>
              <div className="bg-accent/30 border border-border rounded-2xl p-6 relative overflow-hidden">
                {lead.aiScore !== undefined ? (
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-display font-bold",
                          lead.aiScore > 70 ? "bg-green-500/20 text-green-500" : 
                          lead.aiScore > 40 ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"
                        )}>
                          {lead.aiScore}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 group/tooltip relative">
                            <p className="text-sm font-bold">Lead Score</p>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-popover border border-border rounded-lg shadow-xl text-[10px] leading-tight text-popover-foreground opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50">
                              <p className="font-bold mb-1">Scoring Framework:</p>
                              <ul className="space-y-1 list-disc list-inside">
                                <li><span className="font-bold">Relevance:</span> Match with your business type and offer.</li>
                                <li><span className="font-bold">Growth Potential:</span> Market presence and review trends.</li>
                              </ul>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Based on business relevance</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleScoreLead}
                        disabled={scoring}
                        className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground hover:text-primary"
                      >
                        <RefreshCw className={cn("w-4 h-4", scoring && "animate-spin")} />
                      </button>
                    </div>
                    <p className="text-sm italic text-muted-foreground leading-relaxed">
                      "{lead.aiReasoning}"
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-sm text-muted-foreground">No AI score yet. Let our AI analyze this lead for you.</p>
                    <button 
                      onClick={handleScoreLead}
                      disabled={scoring}
                      className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                      {scoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      {scoring ? 'Analyzing...' : 'Score Lead with AI'}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Business Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border p-4 rounded-2xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rating</p>
                  <div className="flex items-center gap-1 font-bold">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {lead.rating || 'N/A'} ({lead.userRatingsTotal || 0} reviews)
                  </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-2xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                  <p className="font-bold">{lead.category || 'N/A'}</p>
                </div>
                <div className="bg-card border border-border p-4 rounded-2xl sm:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm leading-relaxed">{lead.address}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                Notes
              </h3>
              <div className="space-y-3">
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add private notes about this lead..." 
                  rows={4}
                  className="w-full bg-accent/30 border border-border rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                />
                <button 
                  onClick={handleSaveNotes}
                  disabled={savingNotes || notes === (lead.notes || '')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {savingNotes ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Notes
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-500" />
                  Contact Info
                </h3>
                {(editPhone !== (lead.phoneNumber || '') || 
                  editWebsite !== (lead.website || '') || 
                  editCategory !== (lead.category || '')) && (
                  <button 
                    onClick={handleSaveInfo}
                    disabled={savingInfo}
                    className="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    {savingInfo ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save Changes
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Phone Number</label>
                    <button 
                      onClick={() => copyToClipboard(editPhone, 'Phone number')}
                      className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="No phone found"
                      className="w-full bg-transparent text-sm font-medium outline-none focus:text-primary transition-colors"
                    />
                  </div>
                </div>

                <div className={cn(
                  "bg-card border p-4 rounded-2xl space-y-1.5 transition-all",
                  websiteError ? "border-destructive ring-1 ring-destructive" : "border-border"
                )}>
                  <div className="flex items-center justify-between">
                    <label className={cn(
                      "text-[10px] font-bold uppercase",
                      websiteError ? "text-destructive" : "text-muted-foreground"
                    )}>Website</label>
                    <div className="flex items-center gap-1">
                      {editWebsite && !websiteError && (
                        <a href={editWebsite.startsWith('http') ? editWebsite : `https://${editWebsite}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground">
                          <Globe className="w-3 h-3" />
                        </a>
                      )}
                      <button 
                        onClick={() => copyToClipboard(editWebsite, 'Website URL')}
                        className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className={cn("w-4 h-4 shrink-0", websiteError ? "text-destructive" : "text-muted-foreground")} />
                    <input 
                      value={editWebsite}
                      onChange={(e) => {
                        setEditWebsite(e.target.value);
                        if (websiteError) setWebsiteError(false);
                      }}
                      placeholder="No website found"
                      className="w-full bg-transparent text-sm font-medium outline-none focus:text-primary transition-colors"
                    />
                  </div>
                  {websiteError && (
                    <p className="text-[9px] text-destructive font-bold">Invalid URL format</p>
                  )}
                </div>

                <div className="bg-card border border-border p-4 rounded-2xl space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input 
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="No category"
                      className="w-full bg-transparent text-sm font-medium outline-none focus:text-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-card border border-border p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Address</label>
                    <button 
                      onClick={() => copyToClipboard(lead.address, 'Address')}
                      className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{lead.address}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Tasks & Status */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold">Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {['new', 'contacted', 'replied', 'converted', 'lost'].map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateStatus(lead.id, s as LeadStatus)}
                    className={cn(
                      "py-2.5 rounded-xl text-[10px] font-bold transition-all border",
                      lead.status === s 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                        : "bg-accent/30 text-muted-foreground border-transparent hover:border-primary/50"
                    )}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-500" />
                Tasks & Reminders
              </h3>
              
              <form onSubmit={handleAddTask} className="space-y-3">
                <input 
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..." 
                  className="w-full bg-accent/50 border border-border rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <textarea 
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  placeholder="Details (optional)..." 
                  rows={2}
                  className="w-full bg-accent/50 border border-border rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
                  <div className="flex gap-2 p-1 bg-accent/30 rounded-xl border border-border">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTaskPriority(p)}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase",
                          newTaskPriority === p 
                            ? p === 'high' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" :
                              p === 'medium' ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/20" :
                              "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</label>
                    <input 
                      type="date"
                      value={newTaskDate}
                      onChange={e => setNewTaskDate(e.target.value)}
                      className="w-full bg-accent/50 border border-border rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit"
                      className="h-[38px] px-6 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      task.completed ? "bg-accent/10 border-transparent opacity-50" : "bg-card border-border"
                    )}
                  >
                    <button 
                      onClick={() => toggleTask(task)}
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                        task.completed ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground"
                      )}
                    >
                      {task.completed && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-medium truncate", task.completed && "line-through")}>
                          {task.title}
                        </p>
                        <div className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase",
                          task.priority === 'high' ? "bg-red-500/10 text-red-500" :
                          task.priority === 'medium' ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-blue-500/10 text-blue-500"
                        )}>
                          {task.priority === 'high' && <Zap className="w-2 h-2" />}
                          {task.priority === 'medium' && <Clock className="w-2 h-2" />}
                          {task.priority === 'low' && <ArrowRight className="w-2 h-2" />}
                          {task.priority}
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-1 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 opacity-30">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">No tasks scheduled</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
