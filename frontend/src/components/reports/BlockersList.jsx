import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

export default function BlockersList() {
  const { control, register, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'blockers' });
  const blockers = watch('blockers');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Blockers / Challenges</h3>
        <Button variant="outline" size="sm" type="button" onClick={() => append({ description: '', is_key_issue: false })}>
          <Plus size={16} /> Add Blocker
        </Button>
      </div>
      {fields.length === 0 && <p className="text-sm text-gray-400 py-2">No blockers this week 🎉</p>}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex-1">
              <Input {...register(`blockers.${index}.description`)} placeholder="Describe the blocker..." />
            </div>
            <label className="flex items-center gap-1 text-xs text-orange-600 whitespace-nowrap mt-2 cursor-pointer">
              <input type="checkbox" checked={blockers?.[index]?.is_key_issue} onChange={(e) => setValue(`blockers.${index}.is_key_issue`, e.target.checked)} className="rounded" />
              <AlertTriangle size={14} /> Key
            </label>
            <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 mt-2 p-1"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}