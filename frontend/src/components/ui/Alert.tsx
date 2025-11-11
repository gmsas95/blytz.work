'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

// Working Alert component
export function Alert({ type = 'info', children, onClose, className = '' }: {
  type?: 'error' | 'warning' | 'success' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}) {
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
    <div className={`p-4 rounded-lg border flex items-start gap-3 ${styles[type as keyof typeof styles]} ${className}`}>
      <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${icons[type as keyof typeof icons]}`} />
      <div className="flex-1">
        <div className="text-sm font-medium">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Working AlertContainer - SIMPLE AND RELIABLE
let globalAlerts: Array<{id: string, message: string, type: string}> = [];
let globalSetAlerts: React.Dispatch<any> | null = null;

export function AlertContainer() {
  const [alerts, setAlerts] = React.useState(globalAlerts);

  React.useEffect(() => {
    globalSetAlerts = setAlerts;
    return () => { globalSetAlerts = null; };
  }, []);

  React.useEffect(() => {
    globalAlerts = alerts;
  }, [alerts]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{alert.message}</span>
            <button onClick={() => {
              const newAlerts = alerts.filter(a => a.id !== alert.id);
              setAlerts(newAlerts);
              globalAlerts = newAlerts;
            }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Global function to add alerts
export const addAlert = (message: string, type: string = 'success') => {
  const newAlert = {
    id: Date.now().toString(),
    message,
    type
  };
  
  if (globalSetAlerts) {
    globalSetAlerts((prev: any) => [...prev, newAlert]);
  } else {
    globalAlerts.push(newAlert);
  }
};

// Default export - GUARANTEED TO WORK
export default AlertContainer;

// Named exports - ADDITIONAL COMPATIBILITY
export { AlertContainer as Toast };
export { AlertContainer as NotificationProvider };
