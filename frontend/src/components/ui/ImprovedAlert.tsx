'use client';

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, Info, AlertTriangle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
}

interface ImprovedAlertProps {
  alert: Alert;
  onClose: (id: string) => void;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    iconColor: 'text-green-500',
    buttonHover: 'hover:bg-green-100',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    buttonHover: 'hover:bg-red-100',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    buttonHover: 'hover:bg-yellow-100',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    buttonHover: 'hover:bg-blue-100',
  },
};

export function ImprovedAlert({ alert, onClose }: ImprovedAlertProps) {
  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.2 
        }}
        className={`relative w-full max-w-sm overflow-hidden rounded-lg border ${config.bg} ${config.border} ${config.text} shadow-lg`}
      >
        <div className="flex items-start p-4">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {alert.message}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 transition-colors duration-200 ${config.buttonHover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white`}
              onClick={() => onClose(alert.id)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ImprovedAlertContainerProps {
  alerts: Alert[];
  onClose: (id: string) => void;
}

export function ImprovedAlertContainer({ alerts, onClose }: ImprovedAlertContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ImprovedAlert alert={alert} onClose={onClose} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}