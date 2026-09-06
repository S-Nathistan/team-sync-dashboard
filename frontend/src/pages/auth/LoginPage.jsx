import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'manager' || user.role === 'admin') {
        navigate('/manager/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {}
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Button type="submit" loading={isSubmitting} className="w-full">Sign In</Button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-6">
        Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Register</Link>
      </p>
      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700">Demo Accounts:</p>
        <p>Manager: manager@example.com / manager123</p>
        <p>Member: alice@example.com / member123</p>
        <p>Admin: admin@example.com / admin123</p>
      </div>
    </div>
  );
}