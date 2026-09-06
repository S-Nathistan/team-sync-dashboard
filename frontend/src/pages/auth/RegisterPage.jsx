import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'team_member' },
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" placeholder="John Doe" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="Username" placeholder="johndoe" error={errors.username?.message} {...register('username')} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
        <Input label="Confirm Password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Select label="Role" options={[{ value: 'team_member', label: 'Team Member' }, { value: 'manager', label: 'Manager' }]} {...register('role')} />
        <Button type="submit" loading={isSubmitting} className="w-full">Create Account</Button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign In</Link>
      </p>
    </div>
  );
}