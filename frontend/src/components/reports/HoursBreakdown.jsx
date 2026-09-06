import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { TASK_TYPES } from '../../utils/constants';
import { capitalize } from '../../utils/formatters';
import Input from '../common/Input';
import Select from '../common/Select';

export default function HoursBreakdown() {
  const { control, register } = useFormContext();
  const { fields } = useFieldArray({ control, name: 'hours_breakdown' });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Hours Breakdown (Optional)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-1">
            <Select label={capitalize(TASK_TYPES[index])} options={[{ value: TASK_TYPES[index], label: capitalize(TASK_TYPES[index]) }]} {...register(`hours_breakdown.${index}.task_type`)} />
            <Input type="number" step="0.5" placeholder="Hours" {...register(`hours_breakdown.${index}.hours`, { valueAsNumber: true })} />
          </div>
        ))}
      </div>
    </div>
  );
}