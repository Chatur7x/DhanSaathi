import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoalStore, Goal } from '../store/goalStore';
import { formatCurrency, formatCompact } from '../utils/formatters';
import { Target, Plus, Trash2, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

export default function GoalPlannerPage() {
  const { goals, addGoal, removeGoal, addContribution } = useGoalStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '🎯', targetAmount: 1000000, monthlySIP: 10000, expectedReturn: 12, targetDate: '2035-01-01', color: '#3b82f6' });

  const calcProgress = (g: Goal) => Math.min(100, (g.currentAmount / g.targetAmount) * 100);
  const calcYearsLeft = (date: string) => Math.max(0, ((new Date(date).getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000)));
  const calcProjected = (g: Goal) => {
    const r = g.expectedReturn / 100 / 12;
    const months = calcYearsLeft(g.targetDate) * 12;
    const sipFV = g.monthlySIP * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const currentFV = g.currentAmount * Math.pow(1 + r, months);
    return sipFV + currentFV;
  };

  const handleAdd = () => {
    addGoal({ ...form, currentAmount: 0 });
    setShowAdd(false);
    setForm({ name: '', icon: '🎯', targetAmount: 1000000, monthlySIP: 10000, expectedReturn: 12, targetDate: '2035-01-01', color: '#3b82f6' });
  };

  const ICON_OPTIONS = ['🎓', '🏠', '🏖️', '🚗', '💍', '✈️', '🎯', '💰', '👶', '🏥'];
  const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
            <Target size={28} style={{ display: 'inline', marginRight: '0.5rem', color: '#3b82f6' }} />
            Goal Planner
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tie your investments to life goals and track progress</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAdd && (
        <motion.div className="glass-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Create New Goal</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="label">Goal Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Child's Education" />
            </div>
            <div>
              <label className="label">Target Amount (₹)</label>
              <input className="input" type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: +e.target.value })} />
            </div>
            <div>
              <label className="label">Monthly SIP (₹)</label>
              <input className="input" type="number" value={form.monthlySIP} onChange={e => setForm({ ...form, monthlySIP: +e.target.value })} />
            </div>
            <div>
              <label className="label">Expected Return (%)</label>
              <input className="input" type="number" value={form.expectedReturn} onChange={e => setForm({ ...form, expectedReturn: +e.target.value })} />
            </div>
            <div>
              <label className="label">Target Date</label>
              <input className="input" type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Icon</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {ICON_OPTIONS.map(icon => (
                  <button key={icon} onClick={() => setForm({ ...form, icon })}
                    style={{ fontSize: '1.5rem', padding: '0.25rem', background: form.icon === icon ? 'rgba(59,130,246,0.2)' : 'transparent', borderRadius: '8px', border: form.icon === icon ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer' }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn--primary" onClick={handleAdd} disabled={!form.name}>Create Goal</button>
            <button className="btn btn--ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Goal Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {goals.map((goal, i) => {
          const progress = calcProgress(goal);
          const yearsLeft = calcYearsLeft(goal.targetDate);
          const projected = calcProjected(goal);
          const onTrack = projected >= goal.targetAmount;

          return (
            <motion.div key={goal.id} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ borderTop: `3px solid ${goal.color}` }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{goal.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{goal.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> {yearsLeft.toFixed(1)} years left
                    </div>
                  </div>
                </div>
                <button onClick={() => removeGoal(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Progress Ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle cx="40" cy="40" r="35" fill="none" stroke={goal.color} strokeWidth="6"
                      strokeDasharray={`${progress * 2.2} ${220 - progress * 2.2}`}
                      strokeDashoffset="55" strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {progress.toFixed(0)}%
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCompact(goal.currentAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCompact(goal.targetAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Projected</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: onTrack ? '#10b981' : '#ef4444' }}>{formatCompact(projected)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem',
                background: onTrack ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: onTrack ? '#10b981' : '#ef4444',
                border: `1px solid ${onTrack ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {onTrack ? <TrendingUp size={14} /> : <AlertTriangle size={14} />}
                {onTrack ? `On track! Projected ${formatCompact(projected)} by target date` : `Behind schedule. Increase SIP by ${formatCurrency(Math.max(0, (goal.targetAmount - projected) / (yearsLeft * 12)))}/month`}
              </div>

              {/* SIP Info */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                SIP: {formatCurrency(goal.monthlySIP)}/month @ {goal.expectedReturn}% expected return
              </div>
            </motion.div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Target size={64} style={{ color: '#3b82f6', opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Goals Yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Create your first financial goal to start planning your wealth journey.</p>
        </div>
      )}
    </div>
  );
}
