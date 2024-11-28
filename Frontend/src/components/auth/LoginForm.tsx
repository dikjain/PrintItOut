import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '../../context.js';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { setUser, user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    if (!user) {
      const localdata = localStorage.getItem('user');
      if (localdata) {
        setUser(JSON.parse(localdata));
        navigate('/dashboard');
      }
    }
  }, [user]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post('/api/users/login', {
        email: data.email,
        password: data.password,
      });
      if (response.status === 200) {
        setUser(response.data);
        if (data.rememberMe) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        navigate('/dashboard');
      } else {
        console.error('Error logging in:', response.data);
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          {...register('password')}
          error={errors.password?.message}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}