import { Transaction, MoodType, MOOD_EMOJIS } from '@/types';

export interface EmotionalSpendingInsight {
  type: 'warning' | 'info' | 'alert';
  title: string;
  description: string;
  icon: string;
}

export interface MoodSpendingCorrelation {
  mood: MoodType;
  emoji: string;
  totalSpent: number;
  transactionCount: number;
  avgAmount: number;
  percentOfTotal: number;
}

export interface SpendingPattern {
  lateNightSpending: number;
  weekendBinges: number;
  frequencySpikes: boolean;
  emotionalCategories: string[];
}

// Detect late-night purchases (11 PM - 2 AM) - potential emotional spending
export function detectLateNightSpending(transactions: Transaction[]): Transaction[] {
  return transactions.filter(t => {
    const hour = new Date(t.created_at).getHours();
    return (hour >= 23 || hour <= 2) && t.type === 'expense';
  });
}

// Detect frequency spikes - unusual clustering of purchases
export function detectFrequencySpikes(transactions: Transaction[]): boolean {
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length < 5) return false;

  // Group by date
  const byDate: Record<string, number> = {};
  expenses.forEach(t => {
    const date = t.date;
    byDate[date] = (byDate[date] || 0) + 1;
  });

  const counts = Object.values(byDate);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const maxCount = Math.max(...counts);

  return maxCount > avg * 2.5;
}

// Calculate mood-spending correlations
export function calculateMoodCorrelations(transactions: Transaction[]): MoodSpendingCorrelation[] {
  const expenses = transactions.filter(t => t.type === 'expense' && t.mood);
  const totalSpent = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  const moodMap: Record<string, { total: number; count: number }> = {};
  
  expenses.forEach(t => {
    if (t.mood) {
      if (!moodMap[t.mood]) {
        moodMap[t.mood] = { total: 0, count: 0 };
      }
      moodMap[t.mood].total += Number(t.amount);
      moodMap[t.mood].count += 1;
    }
  });

  return Object.entries(moodMap).map(([mood, data]) => ({
    mood: mood as MoodType,
    emoji: MOOD_EMOJIS[mood as MoodType],
    totalSpent: data.total,
    transactionCount: data.count,
    avgAmount: data.total / data.count,
    percentOfTotal: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
  })).sort((a, b) => b.totalSpent - a.totalSpent);
}

// Detect emotional spending patterns
export function detectEmotionalSpending(transactions: Transaction[]): SpendingPattern {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const lateNight = detectLateNightSpending(expenses);
  const lateNightTotal = lateNight.reduce((sum, t) => sum + Number(t.amount), 0);

  // Weekend spending
  const weekendExpenses = expenses.filter(t => {
    const day = new Date(t.date).getDay();
    return day === 0 || day === 6;
  });
  const weekendTotal = weekendExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // Emotional categories (non-essential)
  const emotionalCategories = ['shopping', 'entertainment', 'food'];
  const emotionalPurchases = expenses.filter(t => emotionalCategories.includes(t.category));
  const topEmotionalCategories = [...new Set(emotionalPurchases.map(t => t.category))];

  return {
    lateNightSpending: lateNightTotal,
    weekendBinges: weekendTotal,
    frequencySpikes: detectFrequencySpikes(expenses),
    emotionalCategories: topEmotionalCategories,
  };
}

// Generate AI-like insights based on spending patterns
export function generateEmotionalInsights(transactions: Transaction[]): EmotionalSpendingInsight[] {
  const insights: EmotionalSpendingInsight[] = [];
  const correlations = calculateMoodCorrelations(transactions);
  const patterns = detectEmotionalSpending(transactions);

  // Check for stressed spending pattern
  const stressedSpending = correlations.find(c => c.mood === 'stressed');
  if (stressedSpending && stressedSpending.percentOfTotal > 25) {
    insights.push({
      type: 'alert',
      title: 'Stress Spending Detected',
      description: `${stressedSpending.percentOfTotal.toFixed(0)}% of your spending happens when you're stressed. Try a 5-minute walk before purchasing.`,
      icon: '😰',
    });
  }

  // Check for sad spending
  const sadSpending = correlations.find(c => c.mood === 'sad');
  if (sadSpending && sadSpending.percentOfTotal > 20) {
    insights.push({
      type: 'warning',
      title: 'Emotional Comfort Buying',
      description: `You tend to spend more when feeling sad. Consider calling a friend or journaling instead.`,
      icon: '😢',
    });
  }

  // Late night spending
  if (patterns.lateNightSpending > 0) {
    insights.push({
      type: 'info',
      title: 'Late Night Purchases',
      description: `You've spent $${patterns.lateNightSpending.toFixed(2)} on late-night purchases. Sleep on it—70% of impulse buys feel unnecessary the next day.`,
      icon: '🌙',
    });
  }

  // Frequency spike
  if (patterns.frequencySpikes) {
    insights.push({
      type: 'alert',
      title: 'Spending Spike Detected',
      description: 'You had an unusual number of purchases recently. This could indicate emotional spending.',
      icon: '📈',
    });
  }

  // Weekend binges
  const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  if (totalSpent > 0 && patterns.weekendBinges / totalSpent > 0.5) {
    insights.push({
      type: 'warning',
      title: 'Weekend Spending Alert',
      description: `Over 50% of your spending happens on weekends. Plan free activities to reduce weekend splurges.`,
      icon: '📅',
    });
  }

  // Default positive insight
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Great Job!',
      description: 'No concerning emotional spending patterns detected. Keep tracking your moods to get better insights.',
      icon: '✨',
    });
  }

  return insights;
}
