import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { StudentDashboard } from './pages/student/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AnimatePresence } from 'framer-motion';
import { UserDashboard } from './pages/User/User';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordForm';
import { Toaster } from "./components/ui/sonner";
import { FilePrint } from './pages/student/FilePrint';
import { CustomPrint } from './pages/admin/CustomPrint';
import HowItWorks from './pages/HowItWorks';



function App() {
  return (
    <Router>
      <AnimatePresence mode='wait'>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="assignments" element={<StudentDashboard />} />
            <Route path="history" element={<StudentDashboard />} />
            <Route path="print" element={<FilePrint />} />
            <Route path="howitworks" element={<HowItWorks />} />
          </Route>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="customprint" element={<CustomPrint />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </Router>
  );
}

export default App;