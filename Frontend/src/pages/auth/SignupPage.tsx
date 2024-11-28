import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';

export function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <SignupForm />
    </div>
  );
}