import React, { useEffect, useState, useMemo } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth > 1024);

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 1024);
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

  const themes = useMemo(() => ({
    dark: {
      background: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900 via-black to-blue-900",
      text: "text-white",
      cardBg: "backdrop-blur-2xl bg-white/[0.02]",
      border: "border-white/[0.05]",
      gradientOverlay: "from-green-500/[0.05] via-transparent to-blue-500/[0.05]",
      accentGradient: "from-green-400 to-blue-400",
      iconBg: "from-green-500/20 to-green-500/10",
    },
    light: {
      background: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-purple-100",
      text: "text-gray-800",
      cardBg: "backdrop-blur-2xl bg-white/[0.7]",
      border: "border-gray-200",
      gradientOverlay: "from-blue-500/[0.05] via-transparent to-purple-500/[0.05]",
      accentGradient: "from-blue-500 to-purple-500",
      iconBg: "from-blue-500/20 to-purple-500/10",
    }
  }), []);

  const currentTheme = useMemo(() => darkMode ? themes.dark : themes.light, [darkMode, themes]);

  return (
    <div className={cn("min-h-screen transition-colors duration-500", currentTheme.background, currentTheme.text)}>
      <div className="flex h-screen">
        <motion.div
          initial="show"
          animate={sidebarOpen ? "show" : "hidden"}
          variants={sidebarAnimation}
          style={{ boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)", borderRadius: "0px 20px 20px 0px" }}
          className={cn(" relative inset-y-0  overflow-hidden left-0 z-50 w-64 max-[1024px]:fixed max-[1024px]:h-fit min-[1024px]:flex min-[1024px]:flex-shrink-0", sidebarOpen ? "max-[1024px]:block" : "[1024px]:block")}
        >
          <div className={cn("flex w-64 flex-col", currentTheme.cardBg)}>
            <div className={cn("flex min-h-0 flex-1 flex-col border-r", currentTheme.border)}>
              <div className="flex items-center justify-between px-4 py-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center"
                >
                  <Printer className={cn("h-8 w-8", currentTheme.text)} />
                  <span className="ml-2 text-2xl font-bold tracking-wider">Print Portal</span>
                </motion.div>
                {window.innerWidth < 1024 && <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
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
                            'group flex items-center px-3 py-2 text-lg font-medium rounded-md transition-all duration-100 border-0 hover:border-2 border-gray-300/10',
                            location.pathname === item.href
                              ? currentTheme.cardBg
                              : currentTheme.text
                          )}
                        >
                          <Icon
                            className={cn(
                              'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200',
                              location.pathname === item.href
                                ? currentTheme.text
                                : currentTheme.text
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
                className="flex flex-shrink-0 border-t p-4"
              >
                <button 
                  onClick={toggleDarkMode}
                  className={cn("group flex w-full items-center px-3 py-2 text-lg font-medium rounded-md transition-all duration-200",
                    currentTheme.text)}
                >
                  {darkMode ? <Sun className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" /> : <Moon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-shrink-0 border-t p-4"
              >
                <button 
                  onClick={handleSignOut}
                  className={cn("group flex w-full items-center px-3 py-2 text-lg font-medium rounded-md transition-all duration-200",
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
          <div className="min-[1024px]:hidden p-4 flex justify-between items-center">
            <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <main className={`flex-1 overflow-y-auto p-6 ${window.innerWidth < 460 ? "p-[10px]" : "p-6"}`}>
            <PageTransition>
              <Outlet context={{ mode: darkMode }} />
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
