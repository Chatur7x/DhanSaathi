"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Play, Trophy, Clock, ChevronRight, Star, Flame, Check } from "lucide-react";
import { GlowCard } from "@/components/premium/glow-card";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useLocalStorage } from "@/lib/store";
import { useState } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const courses = [
  { id: "basics", title: "Stock Market Basics", lessons: 12, duration: "2h 30m", level: "Beginner", color: "#7fb069" },
  { id: "technical", title: "Technical Analysis Mastery", lessons: 18, duration: "4h 15m", level: "Intermediate", color: "#d97757" },
  { id: "options", title: "Options Trading Strategies", lessons: 24, duration: "6h 45m", level: "Advanced", color: "#d4a24e" },
  { id: "mutual", title: "Mutual Funds & ETFs", lessons: 10, duration: "1h 50m", level: "Beginner", color: "#a58bd4" },
  { id: "risk", title: "Risk Management", lessons: 8, duration: "1h 20m", level: "Intermediate", color: "#d96a4b" },
  { id: "fundamental", title: "Fundamental Analysis", lessons: 15, duration: "3h 30m", level: "Intermediate", color: "#6aa5d4" },
];

const lessonTopics = (title: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${title} — Part ${i + 1}`);

export default function AcademyPage() {
  const [done, setDone] = useLocalStorage<Record<string, number[]>>("ds-academy", {});
  const [open, setOpen] = useState<string | null>("basics");

  const toggleLesson = (courseId: string, idx: number) => {
    setDone((d) => {
      const cur = d[courseId] || [];
      return { ...d, [courseId]: cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx] };
    });
  };

  const progress = (id: string, total: number) => Math.round(((done[id]?.length || 0) / total) * 100);
  const coursesDone = courses.filter((c) => progress(c.id, c.lessons) === 100).length;
  const totalDone = Object.values(done).reduce((s, a) => s + a.length, 0);

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <PageHeader
            icon={GraduationCap} eyebrow="Learn" title="DhanSaathi Academy" subtitle="Structured paths · progress saves automatically"
            right={
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Flame size={15} className="text-amber-500" />
                <span className="text-[13px] font-semibold text-amber-500">7 day streak</span>
              </div>
            }
          />
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {[
            { label: "Courses Done", value: `${coursesDone}/${courses.length}`, icon: Trophy },
            { label: "Lessons Done", value: `${totalDone}`, icon: BookOpen },
            { label: "XP Points", value: `${totalDone * 10}`, icon: Star },
          ].map((s) => (
            <GlowCard key={s.label} className="!p-4">
              <s.icon size={17} className="text-primary" />
              <p className="eyebrow !text-[0.6rem] mt-2">{s.label}</p>
              <p className="text-xl font-semibold mt-0.5">{s.value}</p>
            </GlowCard>
          ))}
        </motion.div>

        <div className="space-y-2.5">
          {courses.map((course) => {
            const pct = progress(course.id, course.lessons);
            const isOpen = open === course.id;
            const lessons = lessonTopics(course.title, course.lessons);
            return (
              <motion.div key={course.id} variants={item}>
                <GlowCard className="!p-4">
                  <button onClick={() => setOpen(isOpen ? null : course.id)} className="w-full flex items-center gap-4 text-left">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${course.color}18` }}>
                      {pct === 100 ? <Trophy size={20} style={{ color: course.color }} /> :
                       pct > 0 ? <Play size={20} style={{ color: course.color }} /> :
                       <BookOpen size={20} style={{ color: course.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{course.title}</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{
                          color: course.color, borderColor: `${course.color}35`, background: `${course.color}12`
                        }}>{course.level}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.lessons} lessons · {course.duration} · {pct}%</p>
                      {pct > 0 && (
                        <div className="mt-2 h-1 rounded-full bg-accent overflow-hidden">
                          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }}
                            className="h-full rounded-full" style={{ background: course.color }} />
                        </div>
                      )}
                    </div>
                    <motion.span animate={{ rotate: isOpen ? 90 : 0 }}>
                      <ChevronRight size={17} className="text-muted-foreground shrink-0" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                        <div className="pt-2 mt-1 space-y-0.5">
                          {lessons.map((lesson, i) => {
                            const checked = (done[course.id] || []).includes(i);
                            return (
                              <button key={i} onClick={() => toggleLesson(course.id, i)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent/60 transition-colors text-left">
                                <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                  checked ? "bg-emerald-500 border-emerald-500" : "border-border"
                                }`}>
                                  {checked && <Check size={13} className="text-white" />}
                                </span>
                                <span className={`text-[13px] ${checked ? "text-muted-foreground line-through" : ""}`}>
                                  {lesson}
                                </span>
                                <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                                  <Clock size={11} /> {Math.max(5, Math.round(parseInt(course.duration) * 60 / course.lessons))}m
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AppShell>
  );
}
