"use client";

import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Play, Star, Clock, ChevronRight, Trophy, Flame } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AppShell } from "@/components/layout/app-shell";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 300, damping: 25 } } };

const courses = [
  { title: "Stock Market Basics", lessons: 12, duration: "2h 30m", level: "Beginner", color: "#10b981", progress: 75 },
  { title: "Technical Analysis Mastery", lessons: 18, duration: "4h 15m", level: "Intermediate", color: "#6366f1", progress: 30 },
  { title: "Options Trading Strategies", lessons: 24, duration: "6h 45m", level: "Advanced", color: "#f59e0b", progress: 0 },
  { title: "Mutual Funds & ETFs", lessons: 10, duration: "1h 50m", level: "Beginner", color: "#8b5cf6", progress: 100 },
  { title: "Risk Management", lessons: 8, duration: "1h 20m", level: "Intermediate", color: "#ef4444", progress: 50 },
  { title: "Fundamental Analysis", lessons: 15, duration: "3h 30m", level: "Intermediate", color: "#06b6d4", progress: 10 },
];

export default function AcademyPage() {
  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <GraduationCap size={28} className="text-indigo-400" /> DhanSaathi Academy
            </h1>
            <p className="text-sm text-slate-500 mt-1">Master the markets with structured learning paths</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Flame size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">7 Day Streak</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-4">
          {[
            { label: "Courses Done", value: "1/6", icon: Trophy, color: "text-emerald-400" },
            { label: "Hours Learned", value: "4.5h", icon: Clock, color: "text-indigo-400" },
            { label: "XP Points", value: "1,240", icon: Star, color: "text-amber-400" },
          ].map((s, i) => (
            <GlowCard key={i} glowColor={s.color.includes("emerald") ? "#10b981" : s.color.includes("indigo") ? "#6366f1" : "#f59e0b"}>
              <s.icon size={20} className={s.color} />
              <p className="text-[0.6rem] text-slate-500 uppercase tracking-widest font-semibold mt-2">{s.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{s.value}</p>
            </GlowCard>
          ))}
        </motion.div>

        {/* Courses */}
        <div className="space-y-3">
          {courses.map((course, i) => (
            <motion.div key={course.title} variants={item}>
              <GlowCard glowColor={course.color} className="cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${course.color}15` }}>
                    {course.progress === 100 ? <Trophy size={22} style={{ color: course.color }} /> :
                     course.progress > 0 ? <Play size={22} style={{ color: course.color }} /> :
                     <BookOpen size={22} style={{ color: course.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{course.title}</h3>
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border" style={{
                        color: course.color, borderColor: `${course.color}30`, background: `${course.color}10`
                      }}>{course.level}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{course.lessons} lessons · {course.duration}</p>
                    {course.progress > 0 && (
                      <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full" style={{ background: course.color }} />
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
}
