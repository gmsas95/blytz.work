'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertData {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  timestamp: number;
}

interface AlertContextType {
  alerts: AlertData[];
  addAlert: (alert: Omit<AlertData, 'id' | 'timestamp'>) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

// useAlert hook - ONLY provides context functionality
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertContainer');
  }
  return context;
}

interface AlertProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ 
  type = 'info', 
  title, 
  children, 
  onClose,
  className = '' 
}: AlertProps) {
  const baseClasses = 'p-4 rounded-lg border flex items-start gap-3';
  
  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses} ${className}`}>
      <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[type]}`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// AlertContainer component with context provider
export function AlertContainer({ children }: { children?: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const addAlert = (alert: Omit<AlertData, 'id' | 'timestamp'>) => {
    const newAlert: AlertData = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Auto-remove alerts after 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAlerts(prev => prev.filter(alert => 
        Date.now() - alert.timestamp < 3000
      ));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const contextValue: AlertContextType = {
    alerts,
    addAlert,
    removeAlert,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            type={alert.type}
            title={alert.title}
            onClose={() => removeAlert(alert.id)}
          >
            {alert.message}
          </Alert>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

// Default export
export default AlertContainer;

// Additional named exports
export { AlertContainer as Toast };
export { AlertContainer as NotificationProvider };
