export type LeadStatus = 'new' | 'contacted' | 'replied' | 'converted' | 'lost';

export interface Lead {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  category?: string;
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
  description?: string;
  priority: 'low' | 'medium' | 'high';
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
  updatedAt: string;
  onboardingCompleted?: boolean;
  settings: {
    theme: 'light' | 'dark';
    apiKeys: Record<string, string>;
  };
}

export interface AutomationRule {
  id: string;
  ownerId: string;
  name: string;
  trigger: {
    type: 'status_change';
    status: LeadStatus;
  };
  action: {
    type: 'create_task';
    taskTitle: string;
    taskPriority: 'low' | 'medium' | 'high';
    daysOffset: number;
  };
  enabled: boolean;
  createdAt: string;
}

export interface OutreachMessage {
  id: string;
  ownerId: string;
  leadId: string;
  content: string;
  type: 'cold_dm' | 'follow_up';
  createdAt: string;
}
