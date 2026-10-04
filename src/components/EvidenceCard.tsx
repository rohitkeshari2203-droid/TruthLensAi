import React from 'react';
import { EvidenceItem } from '../types';
import { ExternalLink, Check, X, Minus, ShieldCheck, Calendar } from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceItem;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  const getStanceBadge = () => {
    switch (evidence.stance) {
      case 'SUPPORTS':
        return {
          label: 'SUPPORTS',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Check className="w-3.5 h-3.5 text-emerald-600 inline" />,
        };
      case 'CONTRADICTS':
        return {
          label: 'CONTRADICTS',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <X className="w-3.5 h-3.5 text-rose-600 inline" />,
        };
      case 'NEUTRAL':
      default:
        return {
          label: 'NEUTRAL',
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <Minus className="w-3.5 h-3.5 text-slate-500 inline" />,
        };
    }
  };

  const stance = getStanceBadge();

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{evidence.source_name}</span>
            <span aria-hidden="true">·</span>
            <span>{evidence.source_type}</span>
            {evidence.publication_date && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {evidence.publication_date}
                </span>
              </>
            )}
          </div>
          <h4 className="text-base font-semibold text-slate-900 leading-snug">
            {evidence.title}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 font-bold tracking-wide border rounded ${stance.bg}`}
          >
            {stance.icon}
            {stance.label}
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100 italic">
        "{evidence.evidence_text}"
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4 text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Source Authority:{' '}
            <strong className="text-slate-800 font-semibold">
              {evidence.source_reputation ?? 75}/100
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Semantic Relevance:{' '}
            <strong className="text-slate-800 font-semibold">{evidence.relevance_score}%</strong>
          </span>
        </div>

        {evidence.url && (
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            Verify at Original Source
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
