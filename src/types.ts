export type LeadStatus = 'new' | 'contacted' | 'replied' | 'converted' | 'lost';

export interface Lead {
  id: string;
  ownerId: string;
  username: string;
  fullName?: string;
  bio?: string;
  followers: number;
  category?: string;
  contactEmail?: string;
  status: LeadStatus;
  notes?: string;
  tags: string[];
  aiScore?: number;
  aiReasoning?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  ownerId: string;
  leadId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: string;
  settings: {
    theme: 'light' | 'dark';
    apiKeys: Record<string, string>;
  };
}

export interface OutreachMessage {
  id: string;
  ownerId: string;
  leadId: string;
  content: string;
  type: 'cold_dm' | 'follow_up';
  createdAt: string;
}
