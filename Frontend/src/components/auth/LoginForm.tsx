import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '../../context.js';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { setUser, user } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
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
      
      const userData = response.data;
      if (userData) {
        setUser(userData);
        if (data.rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        toast.success("Successfully logged in!");
        navigate('/dashboard');
      } else {
        const errorMsg = 'Invalid credentials. Please check your email and password.';
        toast.error(errorMsg);
        setErrorMessage(errorMsg);
        console.error('Login failed:', errorMsg);
      }
    } catch (error: any) {
      let errorMsg;
      if (error.response?.status === 401) {
        errorMsg = 'Invalid email or password';
      } else if (error.response?.status === 404) {
        errorMsg = 'Account not found. Please check your email';
      } else if (error.response?.status === 403) {
        errorMsg = 'Your account has been locked. Please contact support';
      } else if (!navigator.onLine) {
        errorMsg = 'No internet connection. Please check your network';
      } else {
        errorMsg = 'Unable to connect to server. Please try again later';
      }
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
      console.error('Login error:', error);
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
        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
        <Input
          type="email"
          placeholder="Email"
          {...register('email')}
          error={errors.email?.message}
          className="pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all"
        />
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
        <Input
          type="password"
          placeholder="Password"
          {...register('password')}
          error={errors.password?.message}
          className="pl-10 bg-white/50 border-blue-100 focus:border-blue-500 transition-all"
        />
      </motion.div>

      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="flex items-center space-x-2 group">
          <motion.input
            type="checkbox"
            {...register('rememberMe')}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            whileTap={{ scale: 0.9 }}
          />
          <span className="text-sm text-gray-600 group-hover:text-blue-500 transition-colors">Remember me</span>
        </label>
        <motion.div
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/forgot-password">
            Forgot password?
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}