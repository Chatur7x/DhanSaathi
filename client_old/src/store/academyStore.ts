import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  content: string;
  keyTakeaways: string[];
  xp: number;
  quiz?: QuizQuestion[];
}

export interface AcademyModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  icon: string;
  color: string;
  totalXP: number;
  lessons: AcademyLesson[];
}

interface AcademyState {
  completedLessons: string[];
  quizScores: Record<string, number>;
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  badges: string[];
  currentPath: string | null;
  completeLesson: (lessonId: string, xp: number) => void;
  submitQuiz: (lessonId: string, score: number, total: number) => void;
  setCurrentPath: (id: string | null) => void;
}

export const useAcademyStore = create<AcademyState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      quizScores: {},
      totalXP: 0,
      streak: 0,
      lastActiveDate: '',
      badges: [],
      currentPath: null,

      completeLesson: (lessonId, xp) => {
        const s = get();
        if (s.completedLessons.includes(lessonId)) return;
        const today = new Date().toDateString();
        const b = [...s.badges];
        const c = [...s.completedLessons, lessonId];
        const newXP = s.totalXP + xp;
        if (c.length === 1 && !b.includes('first_lesson')) b.push('first_lesson');
        if (c.length >= 10 && !b.includes('dedicated_learner')) b.push('dedicated_learner');
        if (newXP >= 500 && !b.includes('xp_500')) b.push('xp_500');
        if (newXP >= 1000 && !b.includes('xp_1000')) b.push('xp_1000');
        let str = s.streak;
        if (s.lastActiveDate !== today) {
          const y = new Date(); y.setDate(y.getDate() - 1);
          str = s.lastActiveDate === y.toDateString() ? str + 1 : 1;
          if (str >= 7 && !b.includes('week_streak')) b.push('week_streak');
        }
        set({ completedLessons: c, totalXP: newXP, streak: str, lastActiveDate: today, badges: b });
      },

      submitQuiz: (lessonId, score, total) => {
        const pct = Math.round((score / total) * 100);
        const bonus = pct >= 80 ? 50 : pct >= 50 ? 25 : 10;
        const b = [...get().badges];
        if (pct === 100 && !b.includes('perfect_score')) b.push('perfect_score');
        set(s => ({ quizScores: { ...s.quizScores, [lessonId]: pct }, totalXP: s.totalXP + bonus, badges: b }));
      },

      setCurrentPath: (id) => set({ currentPath: id }),
    }),
    { name: 'dhansaathi-academy' }
  )
);

export const BADGE_INFO: Record<string, { name: string; icon: string; description: string }> = {
  first_lesson: { name: 'First Step', icon: '👣', description: 'Completed your first lesson' },
  dedicated_learner: { name: 'Dedicated Learner', icon: '📖', description: 'Completed 10 lessons' },
  xp_500: { name: 'Rising Star', icon: '⭐', description: 'Earned 500 XP' },
  xp_1000: { name: 'Market Scholar', icon: '🌟', description: 'Earned 1,000 XP' },
  week_streak: { name: '7-Day Streak', icon: '🔥', description: '7-day study streak' },
  perfect_score: { name: 'Perfect Score', icon: '💯', description: '100% on a quiz' },
};
