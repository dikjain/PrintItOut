import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '../../context.js';
import { useNavigate } from 'react-router-dom';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  rollnumber: z.any(), // Allow rollnumber to be any data type
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  otp: z.string().min(6, 'OTP must be 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const navigate = useNavigate();
  const { setUser, user } = useAuth();
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [user]);

  const sendOtp = async (email: string) => {
    try {
      const response = await axios.post('/api/otp/send-otp', { email });
      setServerOtp(response.data.otp);
      setOtpSent(true);
      console.log('OTP sent successfully:', response.data.otp);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    if (data.otp !== serverOtp) {
      console.error('Invalid OTP');
      return;
    }
    try {
      const response = await axios.post('/api/users/register', {
        username: data.name,
        email: data.email,
        rollnumber: data.rollnumber,
        phone: data.phone,
        password: data.password,
      });
      console.log('User registered successfully:', response.data);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setOtpSent(false);
      setServerOtp('');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div>
        <Input
          placeholder="Full Name"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>
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
          placeholder="Roll Number"
          {...register('rollnumber')}
        />
      </div>
      <div>
        <Input
          placeholder="Mobile Phone"
          {...register('phone')}
          error={errors.phone?.message}
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
      <div>
        <Input
          type="password"
          placeholder="Confirm Password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
      </div>
      <div className="flex items-center w-full justify-between">
        <Input
          placeholder="Enter OTP"
          {...register('otp')}
          error={errors.otp?.message}
          className="w-full"
        />
        <Button type="button" onClick={() => sendOtp(getValues('email'))} className="w-[40%]">
          Send OTP
        </Button>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}