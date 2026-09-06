import React from 'react';
import { FileText } from 'lucide-react';

export default function EmptyState({ title = 'No data', description = '', icon: Icon = FileText, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon size={48} className="mb-4" />
      <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      {description && <p className="text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}