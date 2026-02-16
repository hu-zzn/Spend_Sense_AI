export type MoodType = 'happy' | 'sad' | 'stressed' | 'neutral' | 'excited' | 'angry' | 'anxious';

export type CategoryType = 'food' | 'housing' | 'transport' | 'entertainment' | 'shopping' | 'utilities' | 'health' | 'education' | 'savings' | 'other';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: CategoryType;
  type: TransactionType;
  mood: MoodType | null;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
  color: string;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: MoodType;
  note: string | null;
  date: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  monthly_income: number;
  created_at: string;
  updated_at: string;
}

export const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  stressed: '😰',
  neutral: '😐',
  excited: '🎉',
  angry: '😡',
  anxious: '😟',
};

export const MOOD_COLORS: Record<MoodType, string> = {
  happy: '#4ade80',
  sad: '#60a5fa',
  stressed: '#f87171',
  neutral: '#a78bfa',
  excited: '#fbbf24',
  angry: '#ef4444',
  anxious: '#fb923c',
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  food: '🍔',
  housing: '🏠',
  transport: '🚗',
  entertainment: '🎮',
  shopping: '🛒',
  utilities: '💡',
  health: '🏥',
  education: '📚',
  savings: '💰',
  other: '📌',
};

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  food: '#00d4ff',
  housing: '#a855f7',
  transport: '#3b82f6',
  entertainment: '#d946ef',
  shopping: '#f97316',
  utilities: '#eab308',
  health: '#22c55e',
  education: '#06b6d4',
  savings: '#10b981',
  other: '#6b7280',
};
