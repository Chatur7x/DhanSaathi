import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  monthlySIP: number;
  expectedReturn: number;
  targetDate: string;
  createdAt: string;
  color: string;
}

interface GoalState {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  addContribution: (id: string, amount: number) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goals: [
        {
          id: 'g1', name: "Child's Education", icon: '🎓',
          targetAmount: 5000000, currentAmount: 850000, monthlySIP: 15000,
          expectedReturn: 12, targetDate: '2038-06-01', createdAt: '2024-01-15', color: '#3b82f6'
        },
        {
          id: 'g2', name: 'Dream Home', icon: '🏠',
          targetAmount: 3000000, currentAmount: 420000, monthlySIP: 25000,
          expectedReturn: 10, targetDate: '2030-01-01', createdAt: '2024-06-01', color: '#10b981'
        },
        {
          id: 'g3', name: 'Early Retirement', icon: '🏖️',
          targetAmount: 30000000, currentAmount: 1200000, monthlySIP: 50000,
          expectedReturn: 13, targetDate: '2045-01-01', createdAt: '2024-01-01', color: '#f59e0b'
        },
      ],

      addGoal: (goal) => set(s => ({
        goals: [...s.goals, { ...goal, id: 'g_' + Date.now(), createdAt: new Date().toISOString() }]
      })),

      updateGoal: (id, updates) => set(s => ({
        goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g)
      })),

      removeGoal: (id) => set(s => ({
        goals: s.goals.filter(g => g.id !== id)
      })),

      addContribution: (id, amount) => set(s => ({
        goals: s.goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)
      })),
    }),
    { name: 'dhansaathi-goals' }
  )
);
