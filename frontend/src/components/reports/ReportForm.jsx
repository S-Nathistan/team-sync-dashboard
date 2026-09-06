import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createReport, updateReport, submitReport } from '../../api/reports';
import { useProjects } from '../../hooks/useProjects';
import { getCurrentWeekRange } from '../../utils/formatters';
import { TASK_TYPES } from '../../utils/constants';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import TaskTable from './TaskTable';
import BlockersList from './BlockersList';
import AchievementsList from './AchievementsList';
import HoursBreakdown from './HoursBreakdown';

export default function ReportForm({ existingReport, mode = 'create' }) {
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjects();
  const weekRange = getCurrentWeekRange();

  const methods = useForm({
    defaultValues: {
      project_id: '', week_start: weekRange.start, week_end: weekRange.end,
      tasks_completed: [], tasks_planned: '', blockers: [], achievements: [],
      hours_breakdown: TASK_TYPES.map((t) => ({ task_type: t, hours: 0 })), notes: '',
    },
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    if (existingReport?.latest_version) {
      const v = existingReport.latest_version;
      reset({
        project_id: existingReport.project_id || '',
        week_start: existingReport.week_start, week_end: existingReport.week_end,
        tasks_completed: v.tasks_completed || [], tasks_planned: v.tasks_planned || '',
        blockers: v.blockers || [], achievements: v.achievements || [],
        hours_breakdown: v.hours_breakdown?.length ? v.hours_breakdown : TASK_TYPES.map((t) => ({ task_type: t, hours: 0 })),
        notes: v.notes || '',
      });
    }
  }, [existingReport, reset]);

  const onSaveDraft = async (data) => {
    try {
      const payload = { ...data, project_id: data.project_id ? Number(data.project_id) : null };
      if (mode === 'create') {
        const res = await createReport(payload);
        toast.success('Report saved as draft');
        navigate(`/reports/${res.data.id}/edit`);
      } else {
        await updateReport(existingReport.id, payload);
        toast.success('Report updated');
      }
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
  };

  const onSubmitAndSend = async (data) => {
    try {
      const payload = { ...data, project_id: data.project_id ? Number(data.project_id) : null };
      let reportId = existingReport?.id;
      if (mode === 'create') {
        const res = await createReport(payload);
        reportId = res.data.id;
      } else {
        await updateReport(reportId, payload);
      }
      await submitReport(reportId);
      toast.success('Report submitted for review!');
      navigate('/reports');
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to submit'); }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSaveDraft)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Project / Category" options={[{ value: '', label: '-- Select Project --' }, ...projects.map((p) => ({ value: String(p.id), label: p.name }))]} {...register('project_id')} />
          <Input label="Week Start" type="date" {...register('week_start')} disabled={mode === 'edit'} />
          <Input label="Week End" type="date" {...register('week_end')} disabled={mode === 'edit'} />
        </div>
        <TaskTable />
        <BlockersList />
        <AchievementsList />
        <HoursBreakdown />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Planned for Next Week</label>
          <textarea className="input-field min-h-[100px]" placeholder="What do you plan to work on next week?" {...register('tasks_planned')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Links (Optional)</label>
          <textarea className="input-field min-h-[80px]" placeholder="Any additional notes or relevant links..." {...register('notes')} />
        </div>
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button type="submit" loading={isSubmitting} variant="secondary">Save Draft</Button>
          <Button type="button" onClick={handleSubmit(onSubmitAndSend)} loading={isSubmitting}>Save & Submit for Review</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </FormProvider>
  );
}