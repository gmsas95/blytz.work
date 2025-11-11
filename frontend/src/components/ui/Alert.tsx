'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

// Alert Props Interface
interface AlertProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

// Alert Component - WORKING
export function Alert({ 
  type = 'info', 
  title, 
  children, 
  onClose,
  className = '' 
}: AlertProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 ${styles[type]} ${className}`}>
      <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${icons[type]}`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// AlertContainer - DEFINITIVE WORKING VERSION
const AlertContainerComponent = () => {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAlerts(prev => prev.filter(alert => Date.now() - alert.timestamp < 3000));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (window as any).showAlert = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      setAlerts(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message,
        timestamp: Date.now()
      }]);
    };
    return () => {
      delete (window as any).showAlert;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          type={alert.type}
          onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
};

// EXPORT GUARANTEED TO WORK
export const AlertContainer = AlertContainerComponent;

// DEFAULT EXPORT FOR COMPATIBILITY
export default AlertContainerComponent;

// NAMED EXPORTS FOR TREE SHAKING
export { AlertContainerComponent as Toast };
export { AlertContainerComponent as NotificationProvider };
