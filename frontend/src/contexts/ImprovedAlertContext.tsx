'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { Alert, AlertType } from '@/components/ui/ImprovedAlert';

interface ImprovedAlertContextType {
  alerts: Alert[];
  addAlert: (message: string, type: AlertType, duration?: number) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

const ImprovedAlertContext = createContext<ImprovedAlertContextType | undefined>(undefined);

export function useImprovedAlert() {
  const context = useContext(ImprovedAlertContext);
  if (context === undefined) {
    throw new Error('useImprovedAlert must be used within an ImprovedAlertProvider');
  }
  return context;
}

interface ImprovedAlertProviderProps {
  children: React.ReactNode;
}

export function ImprovedAlertProvider({ children }: ImprovedAlertProviderProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((message: string, type: AlertType, duration = 5000) => {
    const newAlert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      duration,
    };

    setAlerts(prev => [...prev, newAlert]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeAlert(newAlert.id);
      }, duration);
    }
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
  };

  return (
    <ImprovedAlertContext.Provider value={value}>
      {children}
    </ImprovedAlertContext.Provider>
  );
}