'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

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
  const baseClasses = 'p-4 rounded-md border flex items-start gap-3';
  
  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${iconColors[type]}`} />
      <div className="flex-1">
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-black/5 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Hook for managing alerts
export function useAlert() {
  const [alerts, setAlerts] = React.useState<Array<{
    id: string;
    type: AlertProps['type'];
    title?: string;
    message: string;
  }>>([]);

  const addAlert = React.useCallback((
    type: AlertProps['type'], 
    message: string, 
    title?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [...prev, { id, type, title, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  }, []);

  const removeAlert = React.useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const AlertContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
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
  );

  return {
    addAlert,
    removeAlert,
    AlertContainer,
    alerts
  };
}