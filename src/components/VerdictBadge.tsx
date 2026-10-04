import React from 'react';
import { Verdict } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, FileQuestion } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  size = 'md',
  showIcon = true,
}) => {
  const getStyles = () => {
    switch (verdict) {
      case 'Likely True':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />,
        };
      case 'Likely False':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500',
          icon: <XCircle className="w-4 h-4 text-rose-600 inline" />,
        };
      case 'Misleading':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 inline" />,
        };
      case 'Partially Supported':
        return {
          bg: 'bg-sky-50 border-sky-200 text-sky-800',
          dot: 'bg-sky-500',
          icon: <AlertTriangle className="w-4 h-4 text-sky-600 inline" />,
        };
      case 'Unverified':
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-800',
          dot: 'bg-slate-400',
          icon: <HelpCircle className="w-4 h-4 text-slate-500 inline" />,
        };
      case 'Insufficient Evidence':
      default:
        return {
          bg: 'bg-zinc-100 border-zinc-300 text-zinc-800',
          dot: 'bg-zinc-400',
          icon: <FileQuestion className="w-4 h-4 text-zinc-500 inline" />,
        };
    }
  };

  const style = getStyles();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium border rounded',
    md: 'text-sm px-2.5 py-1 font-semibold border rounded-md',
    lg: 'text-base px-3.5 py-1.5 font-bold border rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${style.bg} ${sizeClasses[size]} transition-colors`}
    >
      {showIcon && style.icon}
      <span>{verdict}</span>
    </span>
  );
};
