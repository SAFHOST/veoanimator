
export interface GlobalWindow extends Window {
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
    getHostUrl: () => any;
    getModelQuota: () => any;
  };
}

export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface VeoGenerationConfig {
  image: File;
  prompt?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
}

export interface GenerationState {
  isGenerating: boolean;
  progressMessage: string;
  videoUrl: string | null;
  error: string | null;
}

export enum LoadingStage {
  IDLE,
  UPLOADING,
  THINKING,
  GENERATING,
  DOWNLOADING,
  COMPLETE,
  ERROR
}

// SaaS Types
export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  credits: number; // Remaining generations
  usedCredits: number;
  status: 'active' | 'suspended';
  avatar: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: string;
}

export interface AppSettings {
  appName: string;
  branding: {
    logo: string | null; // Base64 data URI
    favicon: string | null; // Base64 data URI
  };
  apiKeys: {
    googleGenAI: { key: string; enabled: boolean };
    veo: { key: string; enabled: boolean };
  };
  allowRegistrations: boolean;
  maintenanceMode: boolean;
  paymentMethods: {
    stripe: { enabled: boolean; publicKey: string };
    paypal: { enabled: boolean; clientId: string };
  };
}

export type View = 'dashboard' | 'generator' | 'users' | 'billing' | 'settings';