import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAcademyStore, BADGE_INFO } from '../store/academyStore';
import { ACADEMY_COURSES } from '../data/academyData';
import { GraduationCap, ArrowLeft, CheckCircle, Lock, Flame, Star, Award, ChevronRight } from 'lucide-react';

export default function Academy() {
  const { completedLessons, quizScores, totalXP, streak, badges, completeLesson, submitQuiz } = useAcademyStore();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<{ active: boolean; current: number; answers: number[]; submitted: boolean }>({ active: false, current: 0, answers: [], submitted: false });

  const course = ACADEMY_COURSES.find(c => c.id === selectedCourse);
  const lesson = course?.lessons.find(l => l.id === selectedLesson);

  const getDifficultyBadge = (d: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      beginner: { label: 'Beginner', cls: 'badge--green' },
      intermediate: { label: 'Intermediate', cls: 'badge--blue' },
      advanced: { label: 'Advanced', cls: 'badge--gold' },
      expert: { label: 'Expert', cls: 'badge--red' }
    };
    return map[d] || map.beginner;
  };

  const getCourseProgress = (courseId: string) => {
    const c = ACADEMY_COURSES.find(x => x.id === courseId);
    if (!c) return 0;
    const done = c.lessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((done / c.lessons.length) * 100);
  };

  // ===== Lesson View =====
  if (selectedLesson && lesson && course) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem', maxWidth: '800px' }}>
        <button onClick={() => { setSelectedLesson(null); setQuizState({ active: false, current: 0, answers: [], submitted: false }); }}
          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to {course.title}
        </button>

        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{lesson.title}</h1>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className={`badge ${getDifficultyBadge(course.difficulty).cls}`}>{getDifficultyBadge(course.difficulty).label}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>+{lesson.xp} XP</span>
            {completedLessons.includes(lesson.id) && <CheckCircle size={16} color="#10b981" />}
          </div>
        </div>

        {/* Content */}
        <div className="glass-card" style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {lesson.content.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) return <h3 key={i} style={{ color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>{line.replace(/\*\*/g, '')}</h3>;
            if (line.startsWith('• ') || line.startsWith('- ')) return <div key={i} style={{ paddingLeft: '1rem', marginBottom: '0.25rem' }}>• {line.slice(2)}</div>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} style={{ marginBottom: '0.5rem' }}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
          })}
        </div>

        {/* Key Takeaways */}
        {lesson.keyTakeaways.length > 0 && (
          <div className="glass-card" style={{ borderLeft: `4px solid ${course.color}` }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>💡 Key Takeaways</h4>
            {lesson.keyTakeaways.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={16} color={course.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quiz */}
        {lesson.quiz && lesson.quiz.length > 0 && (
          <div className="glass-card">
            {!quizState.active && !quizState.submitted && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>📝 Quiz Time!</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{lesson.quiz.length} questions — test your knowledge</p>
                <button className="btn btn--primary" onClick={() => setQuizState({ active: true, current: 0, answers: [], submitted: false })}>Start Quiz</button>
              </div>
            )}

            {quizState.active && !quizState.submitted && lesson.quiz[quizState.current] && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Question {quizState.current + 1} of {lesson.quiz.length}
                </div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{lesson.quiz[quizState.current].question}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {lesson.quiz[quizState.current].options.map((opt, i) => (
                    <button key={i} onClick={() => {
                      const newAnswers = [...quizState.answers, i];
                      if (quizState.current + 1 >= lesson.quiz!.length) {
                        const score = newAnswers.filter((a, idx) => a === lesson.quiz![idx].correct).length;
                        submitQuiz(lesson.id, score, lesson.quiz!.length);
                        setQuizState({ ...quizState, answers: newAnswers, submitted: true });
                      } else {
                        setQuizState({ ...quizState, current: quizState.current + 1, answers: newAnswers });
                      }
                    }}
                      style={{ padding: '0.75rem 1rem', borderRadius: '10px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizState.submitted && lesson.quiz && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  {quizScores[lesson.id] === 100 ? '🎉' : quizScores[lesson.id]! >= 50 ? '👍' : '📚'}
                </div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Score: {quizScores[lesson.id]}%
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {quizScores[lesson.id] === 100 ? 'Perfect! You nailed it!' : quizScores[lesson.id]! >= 50 ? 'Good job! Keep learning.' : 'Review the lesson and try again.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Complete Button */}
        {!completedLessons.includes(lesson.id) && (
          <button className="btn btn--green" onClick={() => completeLesson(lesson.id, lesson.xp)} style={{ alignSelf: 'center' }}>
            <CheckCircle size={16} /> Mark as Complete (+{lesson.xp} XP)
          </button>
        )}
      </div>
    );
  }

  // ===== Course View =====
  if (selectedCourse && course) {
    const progress = getCourseProgress(course.id);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>
        <button onClick={() => setSelectedCourse(null)}
          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> All Courses
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '3rem' }}>{course.icon}</span>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>{course.title}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
              <span className={`badge ${getDifficultyBadge(course.difficulty).cls}`}>{getDifficultyBadge(course.difficulty).label}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{course.lessons.length} lessons · {course.totalXP} XP</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Progress</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: course.color }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: course.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Lessons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {course.lessons.map((l, i) => {
            const done = completedLessons.includes(l.id);
            return (
              <motion.div key={l.id} className="glass-card interactive" onClick={() => setSelectedLesson(l.id)}
                whileHover={{ y: -2 }} style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? course.color : 'rgba(255,255,255,0.05)', color: done ? '#fff' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
                  {done ? <CheckCircle size={18} /> : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{l.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem' }}>
                    <span>+{l.xp} XP</span>
                    {l.quiz && <span>📝 {l.quiz.length} quiz questions</span>}
                    {quizScores[l.id] !== undefined && <span>Score: {quizScores[l.id]}%</span>}
                  </div>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== Main Academy View =====
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          <GraduationCap size={28} style={{ display: 'inline', marginRight: '0.5rem', color: '#f59e0b' }} />
          DhanSaathi Academy
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Structured learning paths from beginner to expert</p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
        {[
          { icon: <Star size={20} color="#f59e0b" />, label: 'Total XP', value: totalXP.toLocaleString() },
          { icon: <Flame size={20} color="#ef4444" />, label: 'Streak', value: `${streak} days` },
          { icon: <CheckCircle size={20} color="#10b981" />, label: 'Lessons', value: completedLessons.length },
          { icon: <Award size={20} color="#8b5cf6" />, label: 'Badges', value: badges.length },
        ].map((stat, i) => (
          <motion.div key={i} className="glass-card" style={{ textAlign: 'center', padding: '1rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            {stat.icon}
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{stat.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="glass-card" style={{ padding: '1rem' }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>🏆 Your Badges</h4>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {badges.map(b => {
              const info = BADGE_INFO[b];
              return info ? (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{info.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{info.description}</div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Course Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {ACADEMY_COURSES.map((course, i) => {
          const progress = getCourseProgress(course.id);
          const db = getDifficultyBadge(course.difficulty);
          return (
            <motion.div key={course.id} className="glass-card interactive" onClick={() => setSelectedCourse(course.id)}
              whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ cursor: 'pointer', borderTop: `3px solid ${course.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{course.icon}</span>
                <span className={`badge ${db.cls}`}>{db.label}</span>
              </div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '1.1rem' }}>{course.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.5 }}>{course.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                <span>{course.lessons.length} lessons</span>
                <span>{course.totalXP} XP</span>
              </div>
              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: course.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
              </div>
              {progress > 0 && <div style={{ fontSize: '0.7rem', color: course.color, marginTop: '0.25rem' }}>{progress}% complete</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
