import { create } from 'zustand';

interface SettingsState {
  theme: 'dark' | 'light';
  currency: 'INR' | 'USD';
  notifications: boolean;
  biometricEnabled: boolean;
  
  toggleTheme: () => void;
  toggleNotifications: () => void;
  toggleBiometric: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  currency: 'INR',
  notifications: true,
  biometricEnabled: false,

  toggleTheme: () => set(state => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),

  toggleNotifications: () => set(state => ({ 
    notifications: !state.notifications 
  })),

  toggleBiometric: () => set(state => ({ 
    biometricEnabled: !state.biometricEnabled 
  }))
}));
