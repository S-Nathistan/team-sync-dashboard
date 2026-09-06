import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import { capitalize } from '../../utils/formatters';

export default function Badge({ status, className = '' }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const label = STATUS_LABELS[status] || capitalize(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}