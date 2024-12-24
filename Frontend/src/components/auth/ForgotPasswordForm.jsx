import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { FiMail, FiKey, FiLock } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(6, 'OTP must be 6 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function ForgotPasswordForm() {
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const sendOtp = async (email) => {
    try {
      setOtpSent(true);
      const response = await axios.post('/api/otp/send-otp', { email });
      setServerOtp(response.data.otp);
      console.log('OTP sent successfully:', response.data.otp);
      setErrorMessage('');
      setSuccessMessage('OTP sent successfully.');  
      setOtpSent(false);
    } catch (error) {
      setOtpSent(false);    
      console.error('Error sending OTP:', error);
      setErrorMessage('Failed to send OTP. Please try again.');
    }
  };

  const onSubmit = async (data) => {
    if (data.otp !== serverOtp) {
      console.error('Invalid OTP');
      setErrorMessage('Invalid OTP. Please check and try again.');
      return;
    }
    try {
      const response = await axios.post('/api/users/reset-password', {
        email: data.email,
        newPassword: data.newPassword,
      });
      console.log('Password reset successfully:', response.data);
      setOtpSent(false);
      setServerOtp('');
      setSuccessMessage('Password reset successfully.');
      setTimeout(() => {
        navigate('/login');
      }, 700);
    } catch (error) {   
      console.error('Error resetting password:', error);
      if (error.response && error.response.status === 404) {
        setErrorMessage('Email not found. Please check and try again.');
      } else {
        setErrorMessage('Password reset failed. Please try again.');
      }
      setOtpSent(false);
      setServerOtp('');
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit(onSubmit)} 
      className="w-full space-y-4 p-6 bg-white/[0.7] backdrop-blur-xl rounded-3xl border border-gray-200 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {errorMessage && (
        <motion.p 
          className="text-red-500 bg-red-100 p-3 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {errorMessage}
        </motion.p>
      )}
      
      {successMessage && (
        <motion.p 
          className="text-green-500 bg-green-100 p-3 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {successMessage}
        </motion.p>
      )}
      
      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
        <Input
          type="email"
          placeholder="Email"
          {...register('email')}
          error={errors.email?.message}
          className="pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all"
        />
      </motion.div>

      <motion.div className="flex items-center w-full justify-between gap-4">
        <div className="relative flex-1">
          <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
          <Input
            placeholder="Enter OTP"
            {...register('otp')}
            error={errors.otp?.message}
            className="pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all"
          />
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            type="button" 
            onClick={() => sendOtp(getValues('email'))}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {otpSent ? <FaSpinner className="animate-spin" /> : 'Send OTP'}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
        <Input
          type="password"
          placeholder="New Password"
          {...register('newPassword')}
          error={errors.newPassword?.message}
          className="pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all"
        />
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
        <Input
          type="password"
          placeholder="Confirm New Password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          className="pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all"
        />
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <FaSpinner />
            </motion.div>
          ) : 'Reset Password'}
        </Button>
      </motion.div>
    </motion.form>
  );
}
