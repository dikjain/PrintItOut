import React from 'react';
import { Outlet } from 'react-router-dom';
import { Printer } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="flex items-center space-x-2">
              <Printer className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Student Print Portal
              </h2>
            </div>
            <div className="mt-8">
              <Outlet />
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2073&q=80"
            alt="Students studying"
          />
        </div>
      </div>
    </div>
  );
}