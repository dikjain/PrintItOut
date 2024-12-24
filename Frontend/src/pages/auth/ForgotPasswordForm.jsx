import React from 'react';
import { Link } from 'react-router-dom';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm.jsx';

export function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
