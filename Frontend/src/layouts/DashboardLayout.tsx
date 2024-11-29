import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Printer, Home, FileText, History, LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/animations/PageTransition';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';

const navigation = [
  { name: 'Dashboard', href: location.pathname.toLowerCase().startsWith('/admin') ? '/admin' : '/dashboard', icon: Home },
  ...(location.pathname.toLowerCase().startsWith('/admin') ? [] : [
    { name: 'Assignments', href: '/dashboard/assignments', icon: FileText },
    { name: 'Print History', href: '/dashboard/history', icon: History },
  ]),
];

const sidebarAnimation = {
  hidden: { x: -300, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth > 768);

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900")}>
      <div className="flex h-screen">
        <motion.div
          initial="show"
          animate={sidebarOpen ? "show" : "hidden"}
          variants={sidebarAnimation}
          style={{ boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.4)" ,borderRadius:"0px 20px 20px 0px"}}
          className={cn("fixed inset-y-0 overflow-hidden left-0 z-50 w-64 md:relative max-[768px]:h-fit md:flex md:flex-shrink-0 ", sidebarOpen ? "max-[768px]:block" : "md:block")}
        >
          <div className={cn("flex w-64 flex-col", darkMode ? "bg-gray-800" : "bg-white")}>
            <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200">
              <div className="flex items-center justify-between px-4 py-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center"
                >
                  <Printer className={cn("h-8 w-8", darkMode ? "text-white" : "text-blue-600")} />
                  <span className="ml-2 text-xl font-semibold">Print Portal</span>
                </motion.div>
                {window.innerWidth < 768 && <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
                  <X className="h-6 w-6" />
                </button>}
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="mt-2 flex-1 space-y-1 px-2">
                  {navigation.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                      >
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200',
                            location.pathname === item.href
                              ? darkMode ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-600'
                              : darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <Icon
                            className={cn(
                              'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                              location.pathname === item.href
                                ? darkMode ? 'text-white' : 'text-blue-600'
                                : darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-500'
                            )}
                          />
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-shrink-0 border-t border-gray-200 p-4"
              >
                <button 
                  onClick={toggleDarkMode}
                  className={cn("group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}
                >
                  {darkMode ? <Sun className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" /> : <Moon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-shrink-0 border-t border-gray-200 p-4"
              >
                <button 
                  onClick={handleSignOut}
                  className={cn("group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                    "text-red-600 hover:bg-red-100 hover:text-red-800")}
                >
                  <LogOut className={cn("mr-3 h-5 w-5", "text-red-600 group-hover:text-red-800")} />
                  Sign out
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="md:hidden p-4 flex justify-between items-center">
            <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <main className="flex-1 overflow-y-auto p-6">
            <PageTransition>
              <Outlet context={{ mode: darkMode }} />
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
