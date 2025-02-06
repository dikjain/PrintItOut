import React from 'react';
import { Outlet } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/animations/PageTransition';

export function AuthLayout() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-purple-100">
        <div className="flex min-h-screen">
          <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -top-48 -left-48 mix-blend-overlay"></div>
              <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -bottom-48 -right-48 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
            </div>
            <div className="mx-auto w-full max-w-sm lg:w-96 relative z-10">
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Printer className="h-8 w-8 text-blue-600" />
                </motion.div>
                <motion.h2 
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Print-It-Out
                </motion.h2>
              </motion.div>
              <motion.div 
                className="mt-8 backdrop-blur-xl bg-white/70 p-6 rounded-2xl border border-white/20 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Outlet />
              </motion.div>
            </div>
          </div>
          <motion.div 
            className="relative hidden w-0 flex-1 lg:block overflow-hidden"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              className="absolute inset-0 h-full w-full object-cover rounded-l-3xl shadow-2xl"
              src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2073&q=80"
              alt="Students studying"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-purple-500/20 mix-blend-overlay"></div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}