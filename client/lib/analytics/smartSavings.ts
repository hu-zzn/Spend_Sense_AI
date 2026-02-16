import { Transaction, Budget, CategoryType } from '@/types';

export interface SavingHack {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  icon: string;
  category: 'subscription' | 'habit' | 'alternative' | 'automation' | 'general';
  priority: 'high' | 'medium' | 'low';
}

export interface BudgetCompliance {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface Rule5030_20 {
  needs: { amount: number; percent: number; target: number; categories: string[] };
  wants: { amount: number; percent: number; target: number; categories: string[] };
  savings: { amount: number; percent: number; target: number; categories: string[] };
  totalIncome: number;
}

// Generate smart saving suggestions based on spending patterns
export function generateSavingHacks(transactions: Transaction[]): SavingHack[] {
  const hacks: SavingHack[] = [];
  const expenses = transactions.filter(t => t.type === 'expense');
  const last30Days = expenses.filter(t => {
    const daysDiff = (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  });

  // Analyze food/dining spending
  const foodSpending = last30Days.filter(t => t.category === 'food');
  const foodTotal = foodSpending.reduce((sum, t) => sum + Number(t.amount), 0);
  if (foodTotal > 300) {
    hacks.push({
      id: 'food-savings',
      title: 'Reduce Food Spending',
      description: `You spent $${foodTotal.toFixed(0)} on food this month. Meal prepping could save you up to $${(foodTotal * 0.4).toFixed(0)}/month.`,
      potentialSavings: foodTotal * 0.4,
      icon: '🍳',
      category: 'habit',
      priority: 'high',
    });
  }

  // Entertainment spending
  const entertainmentSpending = last30Days.filter(t => t.category === 'entertainment');
  const entertainmentTotal = entertainmentSpending.reduce((sum, t) => sum + Number(t.amount), 0);
  if (entertainmentTotal > 100) {
    hacks.push({
      id: 'entertainment-savings',
      title: 'Entertainment Alternatives',
      description: `$${entertainmentTotal.toFixed(0)} on entertainment this month. Free alternatives: parks, libraries, community events.`,
      potentialSavings: entertainmentTotal * 0.5,
      icon: '🎭',
      category: 'alternative',
      priority: 'medium',
    });
  }

  // Shopping spending
  const shoppingSpending = last30Days.filter(t => t.category === 'shopping');
  const shoppingTotal = shoppingSpending.reduce((sum, t) => sum + Number(t.amount), 0);
  if (shoppingTotal > 150) {
    hacks.push({
      id: 'shopping-savings',
      title: '30-Day Wishlist Rule',
      description: `Add non-essential items to a wishlist and wait 30 days. 70% of items become undesirable after waiting.`,
      potentialSavings: shoppingTotal * 0.7,
      icon: '📝',
      category: 'habit',
      priority: 'high',
    });
  }

  // Transport savings
  const transportSpending = last30Days.filter(t => t.category === 'transport');
  const transportTotal = transportSpending.reduce((sum, t) => sum + Number(t.amount), 0);
  if (transportTotal > 200) {
    hacks.push({
      id: 'transport-savings',
      title: 'Consider Public Transport',
      description: `Spending $${transportTotal.toFixed(0)}/month on transport. Public transit could save you up to 60%.`,
      potentialSavings: transportTotal * 0.6,
      icon: '🚌',
      category: 'alternative',
      priority: 'medium',
    });
  }

  // Round-up savings suggestion
  const totalExpenses = last30Days.reduce((sum, t) => sum + Number(t.amount), 0);
  if (totalExpenses > 0) {
    const roundUpSavings = last30Days.reduce((sum, t) => {
      const rounded = Math.ceil(Number(t.amount) / 5) * 5;
      return sum + (rounded - Number(t.amount));
    }, 0);
    
    hacks.push({
      id: 'round-up',
      title: 'Round-Up Savings',
      description: `Round every purchase to the nearest $5 and save the difference. You could save $${roundUpSavings.toFixed(0)}/month!`,
      potentialSavings: roundUpSavings,
      icon: '🔄',
      category: 'automation',
      priority: 'low',
    });
  }

  // Opportunity cost visualization
  if (foodTotal > 0) {
    const yearlyFoodExtra = foodTotal * 12;
    hacks.push({
      id: 'opportunity-cost',
      title: 'Opportunity Cost',
      description: `Your food spending equals $${yearlyFoodExtra.toFixed(0)}/year. That's a vacation or emergency fund!`,
      potentialSavings: 0,
      icon: '✈️',
      category: 'general',
      priority: 'low',
    });
  }

  return hacks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Calculate budget compliance
export function calculateBudgetCompliance(
  transactions: Transaction[],
  budgets: Budget[],
  month: number,
  year: number
): BudgetCompliance[] {
  const monthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year && t.type === 'expense';
  });

  return budgets.map(budget => {
    const spent = monthExpenses
      .filter(t => t.category === budget.category)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const remaining = budget.amount - spent;
    const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      category: budget.category,
      budgeted: budget.amount,
      spent,
      remaining,
      percentUsed,
      status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'safe',
    };
  });
}

// 50/30/20 Rule Analysis
export function calculate503020Rule(
  transactions: Transaction[],
  month: number,
  year: number
): Rule5030_20 {
  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const needsCategories: CategoryType[] = ['housing', 'utilities', 'transport', 'health'];
  const wantsCategories: CategoryType[] = ['food', 'entertainment', 'shopping', 'education', 'other'];
  const savingsCategories: CategoryType[] = ['savings'];

  const calcGroup = (categories: CategoryType[]) => {
    const amount = monthTransactions
      .filter(t => t.type === 'expense' && categories.includes(t.category as CategoryType))
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return amount;
  };

  const needsAmount = calcGroup(needsCategories);
  const wantsAmount = calcGroup(wantsCategories);
  const savingsAmount = calcGroup(savingsCategories);
  const totalExpenses = needsAmount + wantsAmount + savingsAmount;

  return {
    needs: {
      amount: needsAmount,
      percent: totalExpenses > 0 ? (needsAmount / totalExpenses) * 100 : 0,
      target: totalIncome * 0.5,
      categories: needsCategories,
    },
    wants: {
      amount: wantsAmount,
      percent: totalExpenses > 0 ? (wantsAmount / totalExpenses) * 100 : 0,
      target: totalIncome * 0.3,
      categories: wantsCategories,
    },
    savings: {
      amount: savingsAmount,
      percent: totalExpenses > 0 ? (savingsAmount / totalExpenses) * 100 : 0,
      target: totalIncome * 0.2,
      categories: savingsCategories,
    },
    totalIncome,
  };
}

// Predict monthly spending based on current trend
export function predictMonthlySpending(transactions: Transaction[]): number {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
  });

  const totalSoFar = monthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const dailyRate = dayOfMonth > 0 ? totalSoFar / dayOfMonth : 0;
  
  return dailyRate * daysInMonth;
}
