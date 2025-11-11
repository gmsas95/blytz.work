'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

// Simple Alert component
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
  const styles = {
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
    <div className={`p-4 rounded-lg border flex items-start gap-3 ${styles[type]} ${className}`}>
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

// Global alert container - SIMPLE AND WORKING
let globalAlerts: Array<{id: string, type: string, message: string}> = [];
let globalSetAlerts: React.Dispatch<any> | null = null;

export function AlertContainer() {
  const [alerts, setAlerts] = React.useState(globalAlerts);

  React.useEffect(() => {
    globalSetAlerts = setAlerts;
    return () => {
      globalSetAlerts = null;
    };
  }, []);

  // Auto-remove alerts after 3 seconds
  React.useEffect(() => {
    if (alerts.length > 0) {
      const timer = setTimeout(() => {
        setAlerts(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert, index) => (
        <div key={alert.id} className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium">{alert.message}</span>
            <button
              onClick={() => {
                setAlerts(prev => prev.filter((_, i) => i !== index));
              }}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Global function to add alerts
export const showAlert = (message: string, type: string = 'success') => {
  const newAlert = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message
  };
  
  if (globalSetAlerts) {
    globalSetAlerts(prev => [...prev, newAlert]);
  } else {
    globalAlerts.push(newAlert);
  }
};

// Default export
export default AlertContainer;
