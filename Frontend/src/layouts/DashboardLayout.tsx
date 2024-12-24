import  { useEffect, useState, useMemo } from 'react';
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
  const [darkMode, setDarkMode] = useState<boolean>(localStorage.getItem('themeMode') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth > 1024);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(!localStorage.getItem('themeMode'));

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
    localStorage.setItem('themeMode', !darkMode ? 'dark' : 'light');
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

  const handleThemeSelection = (mode: 'dark' | 'light') => {
    setDarkMode(mode === 'dark');
    localStorage.setItem('themeMode', mode);
    setShowThemeModal(false);
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", currentTheme.background, currentTheme.text)}>
      {showThemeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className={`${currentTheme.cardBg} p-8 rounded-3xl border ${currentTheme.border} shadow-2xl relative overflow-hidden group w-[90%] max-w-md`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="relative z-10">
              <h2 className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient} tracking-tight mb-8`}>
                Choose Your Theme
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleThemeSelection('light')}
                  className={`group relative px-6 py-4 rounded-2xl border ${currentTheme.border} bg-gradient-to-br from-blue-100 via-white to-purple-100 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <Sun className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <span className="block text-gray-800 font-medium">Light Mode</span>
                </button>
                <button
                  onClick={() => handleThemeSelection('dark')}
                  className={`group relative px-6 py-4 rounded-2xl border ${currentTheme.border} bg-gradient-to-br from-green-900 via-black to-blue-900 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <Moon className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <span className="block text-white font-medium">Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
