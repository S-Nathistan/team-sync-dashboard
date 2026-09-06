import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';

export default function ProjectForm({ initialData, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      color: initialData?.color || '#3B82F6',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Project Name"
        placeholder="e.g. Mobile App Redesign"
        error={errors.name?.message}
        {...register('name', { required: 'Project name is required' })}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          className="input-field min-h-[90px]"
          placeholder="Brief description of the project"
          {...register('description')}
        />
      </div>

      <Input
        label="Accent Color"
        type="color"
        className="h-10 cursor-pointer p-1"
        {...register('color')}
      />

      <div className="flex justify-end gap-2 pt-3 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}