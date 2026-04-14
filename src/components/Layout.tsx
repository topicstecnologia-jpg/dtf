import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Play, MessageCircle, User, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { user } = useApp();

  if (!user) {
    return <div className="min-h-screen bg-light-bg text-text-main">{children}</div>;
  }

  const navItems = [
    { path: '/home', icon: Home, label: 'Início' },
    { path: '/feed', icon: Play, label: 'Recomendações' },
    { path: '/matches', icon: MessageCircle, label: 'Conversas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const MotionLink = motion.create(Link);

  const isChatPage = pathname.startsWith('/chat/');

  return (
    <div className="min-h-screen bg-light-bg text-text-main flex flex-col md:flex-row">
      {/* Mobile Header - Hide on Chat Page */}
      {!isChatPage && (
        <header className="md:hidden h-16 flex items-center justify-center px-6 sticky top-0 bg-[#17171B]/80 backdrop-blur-md z-50 border-b border-white/5">
          <img 
            src="https://i.postimg.cc/GpHmXR5D/Design-sem-nome.png" 
            alt="App Icon" 
            className="w-10 h-10 object-contain"
          />
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${!isChatPage ? 'pb-24' : ''} md:pb-0 relative scrollbar-hide bg-[#17171B]`}>
        {children}
      </main>

      {/* Mobile Bottom Nav - Hide on Chat Page */}
      {!isChatPage && (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-[#222226]/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-between px-8 z-50 border border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <MotionLink 
                key={item.path} 
                to={item.path}
                className="relative flex items-center justify-center w-10 h-10 rounded-full"
                whileTap={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-background"
                    className="absolute inset-0 bg-[#3F1521] rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  <item.icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={isActive ? "text-white" : "text-gray-500"} 
                  />
                </span>
              </MotionLink>
            );
          })}
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-gray-200 bg-white flex-col p-6 sticky top-0 h-screen">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-text-main font-display">DTF</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-light-bg text-text-main font-bold' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div>
              <p className="font-bold text-sm text-text-main">{user.name}</p>
              <p className="text-xs text-gray-500">{user.emotionalProfile}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
