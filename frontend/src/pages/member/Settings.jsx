import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { updateUser } from '../../api/users';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { User, Lock, ShieldCheck } from 'lucide-react';
import { capitalize } from '../../utils/formatters';

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const updateStoreUser = useAuthStore((s) => s.updateUser);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: isProfileSubmitting },
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { isSubmitting: isPasswordSubmitting },
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  });

  // Save Profile Changes
  const onSaveProfile = async (data) => {
    try {
      const res = await updateUser(user.id, data);
      updateStoreUser(res.data);
      toast.success('Profile information updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  // Change Password
  const onSavePassword = async (data) => {
    if (data.new_password !== data.confirm_new_password) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await updateUser(user.id, {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Profile Summary */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl flex items-center justify-center select-none shadow-xs">
          {user?.full_name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{user?.full_name}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span>@{user?.username}</span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
              {capitalize(user?.role)}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Profile Information Section */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User size={18} className="text-primary-600" />
          <h3 className="font-semibold text-slate-800 text-base">Profile Information</h3>
        </div>

        <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-4 pt-1">
          <Input label="Full Name" {...registerProfile('full_name', { required: true })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Username" {...registerProfile('username', { required: true })} />
            <Input label="Email Address" type="email" {...registerProfile('email', { required: true })} />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" loading={isProfileSubmitting}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Security & Password Section */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock size={18} className="text-amber-600" />
          <h3 className="font-semibold text-slate-800 text-base">Security & Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit(onSavePassword)} className="space-y-4 pt-1">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            {...registerPassword('current_password', { required: true })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="•••••••• (Min 6 characters)"
              {...registerPassword('new_password', { required: true, minLength: 6 })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              {...registerPassword('confirm_new_password', { required: true })}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" loading={isPasswordSubmitting}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}