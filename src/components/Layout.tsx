import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Play, MessageCircle, User, AtSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const { user, updateHandle } = useApp();
  const [handleInput, setHandleInput] = useState(user?.handle?.replace(/^@/, '') || '');
  const [handleError, setHandleError] = useState('');
  const [isSavingHandle, setIsSavingHandle] = useState(false);

  if (!user) {
    return <div className="min-h-screen bg-light-bg text-text-main">{children}</div>;
  }

  const navItems = [
    { path: '/home', icon: Home, label: 'Inicio' },
    { path: '/feed', icon: Play, label: 'Recomendacoes' },
    { path: '/matches', icon: MessageCircle, label: 'Conversas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const MotionLink = motion.create(Link);
  const isChatPage = pathname.startsWith('/chat/');
  const mustConfigureHandle = !user.usernameConfigured;

  const handleSubmitUsername = async (event: React.FormEvent) => {
    event.preventDefault();
    setHandleError('');
    setIsSavingHandle(true);

    try {
      await updateHandle(handleInput);
    } catch (error) {
      setHandleError(error instanceof Error ? error.message : 'Nao foi possivel salvar seu @.');
    } finally {
      setIsSavingHandle(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17171B] text-text-main">
      {!isChatPage && (
        <>
          <header className="md:hidden h-14 flex items-center justify-center px-6 sticky top-0 bg-[#17171B]/80 backdrop-blur-md z-50 border-b border-white/5">
            <img
              src="https://i.postimg.cc/GpHmXR5D/Design-sem-nome.png"
              alt="App Icon"
              className="w-9 h-9 object-contain"
            />
          </header>

          <Link to="/home" className="hidden md:flex fixed top-5 left-6 z-50 items-center gap-3">
            <img
              src="https://i.postimg.cc/GpHmXR5D/Design-sem-nome.png"
              alt="DTF"
              className="w-10 h-10 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-white font-display">DTF</span>
          </Link>
        </>
      )}

      <main className={`${!isChatPage ? 'pb-28 md:pb-24' : ''} relative bg-[#17171B] min-h-screen`}>
        <div className={`${isChatPage ? 'w-full' : 'w-full max-w-[430px] md:max-w-[520px] mx-auto'}`}>
          {children}
        </div>
      </main>

      {!isChatPage && (
        <nav className="fixed bottom-5 left-5 right-5 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[380px] h-16 md:h-14 bg-[#222226]/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-between px-7 md:px-6 z-50 border border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <MotionLink
                key={item.path}
                to={item.path}
                className="relative flex items-center justify-center w-10 h-10 rounded-full"
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-background"
                    className="absolute inset-0 bg-[#3F1521] rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-white' : 'text-gray-500'}
                  />
                </span>
              </MotionLink>
            );
          })}
        </nav>
      )}

      {mustConfigureHandle && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
          <motion.form
            onSubmit={handleSubmitUsername}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#1F1F24] p-6 shadow-2xl"
          >
            <div className="w-11 h-11 rounded-full bg-[#3F1521] flex items-center justify-center mb-5">
              <AtSign size={22} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Escolha seu @</h2>
            <p className="text-sm text-gray-400 mb-5">
              Esse nome identifica seu perfil e pode ser usado para compartilhar sua conta.
            </p>
            <div className="relative mb-3">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              <input
                value={handleInput}
                onChange={(event) => setHandleInput(event.target.value)}
                className="w-full rounded-full bg-[#17171B] border border-white/10 py-4 pl-10 pr-5 text-white outline-none focus:border-white/25"
                placeholder="seunome"
                autoFocus
              />
            </div>
            {handleError && <p className="text-sm text-red-300 mb-3">{handleError}</p>}
            <button
              type="submit"
              disabled={isSavingHandle}
              className="w-full h-12 rounded-full bg-[#3F1521] hover:bg-[#5B343C] disabled:opacity-60 text-white font-bold transition-colors"
            >
              {isSavingHandle ? 'Salvando...' : 'Salvar @'}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
};
