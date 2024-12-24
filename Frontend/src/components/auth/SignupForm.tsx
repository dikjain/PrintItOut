import { useEffect, useState } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '../../context.js';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { FiUser, FiMail, FiPhone, FiLock, FiKey, FiHash } from 'react-icons/fi';
import { motion } from 'framer-motion';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  rollnumber: z.string().min(10, 'Roll number is required'),
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
  const [errorMessage, setErrorMessage] = useState('');
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
      setOtpSent(true);
      const response = await axios.post('/api/otp/send-otp', { email });
      setServerOtp(response.data.otp);
      console.log('OTP sent successfully:', response.data.otp);
      setOtpSent(false);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrorMessage('Failed to send OTP. Please try again.');
      setOtpSent(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    if (data.otp !== serverOtp) {
      console.error('Invalid OTP');
      setErrorMessage('Invalid OTP. Please check and try again.');
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
      setOtpSent(false);
      setServerOtp('');
      setErrorMessage('Registration failed. Please try again.');
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
      
      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiUser className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.name ? 'text-red-500' : 'text-blue-500'}`} />
        <Input
          placeholder="Full Name"
          {...register('name')}
          error={errors.name?.message}
          className={`pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <motion.p 
            className="text-red-500 bg-red-100 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {errors.name.message}
          </motion.p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiMail className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-500' : 'text-blue-500'}`} />
        <Input
          type="email"
          placeholder="Email"
          {...register('email')}
          error={errors.email?.message}
          className={`pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <motion.p 
            className="text-red-500 bg-red-100 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {errors.email.message}
          </motion.p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiHash className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.rollnumber ? 'text-red-500' : 'text-blue-500'}`} />
        <Input
          placeholder="Enrollment Number(11 digits)"
          {...register('rollnumber')}
          className={`pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all ${errors.rollnumber ? 'border-red-500' : ''}`}
        />
        {errors.rollnumber && (
          <motion.p 
            className="text-red-500 bg-red-100 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {errors.rollnumber.message}
          </motion.p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiPhone className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.phone ? 'text-red-500' : 'text-blue-500'}`} />
        <Input
          placeholder="Mobile Phone"
          {...register('phone')}
          error={errors.phone?.message}
          className={`pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all ${errors.phone ? 'border-red-500' : ''}`}
        />
        {errors.phone && (
          <motion.p 
            className="text-red-500 bg-red-100 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {errors.phone.message}
          </motion.p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiLock className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-500' : 'text-blue-500'}`} />
        <Input
          type="password"
          placeholder="Password"
          {...register('password')}
          error={errors.password?.message}
          className={`pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all ${errors.password ? 'border-red-500' : ''}`}
        />
        {errors.password && (
          <motion.p 
            className="text-red-500 bg-red-100 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {errors.password.message}
          </motion.p>
        )}
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiLock className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-red-500' : 'text-blue-500'}`} />
        <Input
          type="password"
          placeholder="Confirm Password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          className={`pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
        />
        {errors.confirmPassword && (
          <motion.p 
            className="text-red-500 bg-red-100 p-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {errors.confirmPassword.message}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="flex items-center w-full justify-between gap-4">
        <div className="relative flex-1">
          <FiKey className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.otp ? 'text-red-500' : 'text-blue-500'}`} />
          <Input
            placeholder="Enter OTP"
            {...register('otp')}
            error={errors.otp?.message}
            className={`pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all ${errors.otp ? 'border-red-500' : ''}`}
          />
          {errors.otp && (
            <motion.p 
              className="text-red-500 bg-red-100 p-3 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {errors.otp.message}
            </motion.p>
          )}
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
          ) : 'Create account'}
        </Button>
      </motion.div>
    </motion.form>
  );
}