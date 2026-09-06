import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { updateUser } from '../../api/users';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateUser(user.id, data);
      toast.success('Account profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
        <p className="text-sm text-slate-500">Manage your profile information.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('full_name')} />
          <Input label="Username" {...register('username')} />
          <Input label="Email Address" type="email" {...register('email')} />
          <div className="pt-3 flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}