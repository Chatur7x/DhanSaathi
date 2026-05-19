import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Activity, Percent, BookOpen, Target, Home, BarChart2 } from 'lucide-react';
import './Calculators.scss';

import SIPCalculator from './SIPCalculator';
import LumpsumCalculator from './LumpsumCalculator';
import StepUpSIPCalculator from './StepUpSIPCalculator';
import SWPCalculator from './SWPCalculator';
import EMICalculator from './EMICalculator';
import GoalPlanner from './GoalPlanner';
import CAGRCalculator from './CAGRCalculator';
import InflationCalculator from './InflationCalculator';
import TaxCalculator from './TaxCalculator';
import XIRRCalculator from './XIRRCalculator';
import OptionsPayoffCalculator from './OptionsPayoffCalculator';
import MarginCalculator from './MarginCalculator';

const CALCULATORS = [
  { id: 'sip', title: 'SIP Calculator', desc: 'Calculate returns for regular monthly investments', icon: TrendingUp, color: '#0a84ff', component: SIPCalculator },
  { id: 'lumpsum', title: 'Lumpsum', desc: 'Estimate returns for one-time investments', icon: Wallet, color: '#bf5af2', component: LumpsumCalculator },
  { id: 'stepup', title: 'Step-up SIP', desc: 'SIP that increases automatically every year', icon: ArrowUpRight, color: '#34c759', component: StepUpSIPCalculator },
  { id: 'swp', title: 'SWP Calculator', desc: 'Plan systematic withdrawals for regular income', icon: ArrowDownRight, color: '#ff9f0a', component: SWPCalculator },
  { id: 'goal', title: 'Goal Planner', desc: 'Find how much to invest to reach your target', icon: Target, color: '#ff375f', component: GoalPlanner },
  { id: 'emi', title: 'EMI Calculator', desc: 'Calculate home, car or personal loan EMIs', icon: Home, color: '#64d2ff', component: EMICalculator },
  { id: 'cagr', title: 'CAGR', desc: 'Compound annual growth rate calculation', icon: BarChart2, color: '#0a84ff', component: CAGRCalculator },
  { id: 'tax', title: 'Tax Calculator', desc: 'Estimate STCG and LTCG on your gains', icon: Percent, color: '#ff3b30', component: TaxCalculator },
  { id: 'inflation', title: 'Inflation', desc: 'See how inflation eats your money over time', icon: Activity, color: '#bf5af2', component: InflationCalculator },
  { id: 'margin', title: 'F&O Margin', desc: 'Calculate margin required for F&O trades', icon: Activity, color: '#ff9f0a', component: MarginCalculator },
  { id: 'options', title: 'Options Payoff', desc: 'Visualize profit/loss for options strategies', icon: Activity, color: '#34c759', component: OptionsPayoffCalculator },
  { id: 'xirr', title: 'XIRR', desc: 'Actual returns for multiple cash flows', icon: Activity, color: '#ff3b30', component: XIRRCalculator },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function Calculators() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCalc = CALCULATORS.find(c => c.id === selectedId);

  return (
    <div className="calculators-page">
      
      {/* Bento Grid */}
      <motion.div 
        className="calc-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {CALCULATORS.map((calc) => {
          const Icon = calc.icon;
          return (
            <motion.div
              layoutId={`card-${calc.id}`}
              key={calc.id}
              variants={itemVariants}
              className="calc-card"
              style={{ '--card-accent': calc.color, '--card-bg-gradient': `linear-gradient(135deg, ${calc.color} 0%, transparent 100%)` } as any}
              onClick={() => setSelectedId(calc.id)}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div layoutId={`icon-${calc.id}`} className="calc-card__icon">
                <Icon size={24} />
              </motion.div>
              <motion.h3 layoutId={`title-${calc.id}`} className="calc-card__title">
                {calc.title}
              </motion.h3>
              <motion.p layoutId={`desc-${calc.id}`} className="calc-card__desc">
                {calc.desc}
              </motion.p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Expanded View Modal Overlay */}
      <AnimatePresence>
        {selectedId && selectedCalc && (
          <motion.div
            layoutId={`card-${selectedId}`}
            className="calc-expanded"
            style={{ '--card-accent': selectedCalc.color } as any}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
          >
            <div className="calc-expanded__header">
              <button 
                className="calc-expanded__back-btn"
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="calc-expanded__title-group">
                <motion.div layoutId={`icon-${selectedId}`} className="calc-expanded__icon" transition={{ type: "spring", stiffness: 350, damping: 35 }}>
                  <selectedCalc.icon size={28} />
                </motion.div>
                <motion.h2 layoutId={`title-${selectedId}`} className="calc-expanded__title" transition={{ type: "spring", stiffness: 350, damping: 35 }}>
                  {selectedCalc.title}
                </motion.h2>
              </div>
            </div>

            <motion.div 
              className="calc-expanded__content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {selectedCalc.component ? (
                <selectedCalc.component />
              ) : (
                <div style={{padding: '2rem', color: '#9ca3af'}}>Calculator not found</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
