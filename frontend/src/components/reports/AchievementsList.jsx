import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2, Star } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

export default function AchievementsList() {
  const { control, register, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'achievements' });
  const achievements = watch('achievements');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Achievements / Highlights</h3>
        <Button variant="outline" size="sm" type="button" onClick={() => append({ description: '', is_key_achievement: false })}>
          <Plus size={16} /> Add
        </Button>
      </div>
      {fields.length === 0 && <p className="text-sm text-gray-400 py-2">No achievements added yet.</p>}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex-1">
              <Input {...register(`achievements.${index}.description`)} placeholder="Describe the achievement..." />
            </div>
            <label className="flex items-center gap-1 text-xs text-yellow-600 whitespace-nowrap mt-2 cursor-pointer">
              <input type="checkbox" checked={achievements?.[index]?.is_key_achievement} onChange={(e) => setValue(`achievements.${index}.is_key_achievement`, e.target.checked)} className="rounded" />
              <Star size={14} /> Key
            </label>
            <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 mt-2 p-1"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}