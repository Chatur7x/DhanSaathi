import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LivePulseProps {
  isConnected?: boolean;
  label?: string;
}

/**
 * 21st.dev-inspired LivePulse indicator
 * A glowing, breathing dot that indicates real-time connection status.
 */
export function LivePulse({ isConnected = true, label = 'LIVE' }: LivePulseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '100px',
        background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: isConnected ? '#10b981' : '#ef4444',
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isConnected ? '#10b981' : '#ef4444',
          boxShadow: isConnected
            ? '0 0 8px rgba(16, 185, 129, 0.6)'
            : '0 0 8px rgba(239, 68, 68, 0.6)',
        }}
      />
      {label}
    </motion.div>
  );
}

interface ShimmerTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 21st.dev-inspired ShimmerText
 * Text with a sweeping metallic shimmer animation.
 */
export function ShimmerText({ children, className = '', style }: ShimmerTextProps) {
  return (
    <span
      className={className}
      style={{
        background: 'linear-gradient(110deg, #e2e8f0 35%, #ffffff 50%, #e2e8f0 65%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'shimmer-text 3s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

interface StaggerListProps {
  children: React.ReactNode[];
  delay?: number;
}

/**
 * Wraps children in staggered Framer Motion animations.
 */
export function StaggerList({ children, delay = 0.06 }: StaggerListProps) {
  return (
    <AnimatePresence mode="wait">
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            delay: i * delay,
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
        >
          {child}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

interface NumberTickerProps {
  value: number;
  className?: string;
}

/**
 * 21st.dev-inspired NumberTicker
 * Individual digits animate independently with a slot-machine effect.
 */
export function NumberTicker({ value, className = '' }: NumberTickerProps) {
  const [displayDigits, setDisplayDigits] = useState<string[]>([]);

  useEffect(() => {
    const str = value.toLocaleString('en-IN');
    setDisplayDigits(str.split(''));
  }, [value]);

  return (
    <span className={className} style={{ display: 'inline-flex', overflow: 'hidden' }}>
      {displayDigits.map((digit, i) => (
        <motion.span
          key={`${i}-${digit}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
            delay: i * 0.03,
          }}
          style={{ display: 'inline-block' }}
        >
          {digit}
        </motion.span>
      ))}
    </span>
  );
}
