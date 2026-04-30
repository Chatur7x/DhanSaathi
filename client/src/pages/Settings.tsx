import { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useSettingsStore } from '../store/settingsStore';
import { motion } from 'framer-motion';
import { User, Bell, Moon, Shield, Fingerprint, Save, Check } from 'lucide-react';

export default function Settings() {
  const { isAuthenticated, user, setAuth } = usePortfolioStore();
  const { theme, notifications, biometricEnabled, toggleTheme, toggleNotifications, toggleBiometric } = useSettingsStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setAuth(isAuthenticated, { ...user, name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    setAuth(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Settings</h1>

      {/* Profile Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} /> Profile
        </h3>
        {isAuthenticated ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn--primary" onClick={handleSave}>
                <Save size={16} /> Save Changes
              </button>
              <button className="btn btn--secondary" onClick={handleLogout}>
                Logout
              </button>
            </div>
            {saved && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Check size={16} /> Profile updated!
              </motion.div>
            )}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Please login to manage your profile.
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} /> Preferences
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Moon size={16} />
              <span style={{ color: 'var(--text-primary)' }}>Dark Mode</span>
            </div>
            <button 
              onClick={toggleTheme}
              style={{ 
                background: theme === 'dark' ? 'var(--accent-blue)' : 'var(--bg-tertiary)', 
                padding: '0.5rem 1rem', 
                borderRadius: '20px',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {theme === 'dark' ? 'On' : 'Off'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} />
              <span style={{ color: 'var(--text-primary)' }}>Push Notifications</span>
            </div>
            <button 
              onClick={toggleNotifications}
              style={{ 
                background: notifications ? 'var(--accent-blue)' : 'var(--bg-tertiary)', 
                padding: '0.5rem 1rem', 
                borderRadius: '20px',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {notifications ? 'On' : 'Off'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Fingerprint size={16} />
              <span style={{ color: 'var(--text-primary)' }}>Biometric Lock (Android)</span>
            </div>
            <button 
              onClick={toggleBiometric}
              style={{ 
                background: biometricEnabled ? 'var(--accent-blue)' : 'var(--bg-tertiary)', 
                padding: '0.5rem 1rem', 
                borderRadius: '20px',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {biometricEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Legal Disclaimers */}
      <div className="glass-card" style={{ padding: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <Shield size={16} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
        <p><strong>Disclaimers:</strong></p>
        <p>1. Not SEBI registered. For educational purposes only.</p>
        <p>2. Past performance does not guarantee future results.</p>
        <p>3. AI suggestions are informational, not financial advice.</p>
        <p>4. Consult a SEBI-registered advisor before making investment decisions.</p>
      </div>
    </div>
  );
}
