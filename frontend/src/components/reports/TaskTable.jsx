import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { capitalize } from '../../utils/formatters';

export default function TaskTable() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'tasks_completed' });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Tasks Completed</h3>
        <Button variant="outline" size="sm" type="button" onClick={() =>
          append({ task_name: '', priority: 'medium', planned_percentage: 100, actual_percentage: 0, status: 'in_progress', time_planned_hours: 0, time_spent_hours: 0, output_deliverable: '' })
        }>
          <Plus size={16} /> Add Task
        </Button>
      </div>
      {fields.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No tasks yet. Click "Add Task" to begin.</p>}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Task #{index + 1}</span>
              <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input label="Task Name" {...register(`tasks_completed.${index}.task_name`)} />
              <Select label="Priority" options={PRIORITIES.map((p) => ({ value: p, label: capitalize(p) }))} {...register(`tasks_completed.${index}.priority`)} />
              <Select label="Status" options={TASK_STATUSES.map((s) => ({ value: s, label: capitalize(s) }))} {...register(`tasks_completed.${index}.status`)} />
              <Input label="Deliverable" {...register(`tasks_completed.${index}.output_deliverable`)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <Input label="Planned %" type="number" {...register(`tasks_completed.${index}.planned_percentage`, { valueAsNumber: true })} />
              <Input label="Actual %" type="number" {...register(`tasks_completed.${index}.actual_percentage`, { valueAsNumber: true })} />
              <Input label="Planned (hrs)" type="number" step="0.5" {...register(`tasks_completed.${index}.time_planned_hours`, { valueAsNumber: true })} />
              <Input label="Spent (hrs)" type="number" step="0.5" {...register(`tasks_completed.${index}.time_spent_hours`, { valueAsNumber: true })} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}