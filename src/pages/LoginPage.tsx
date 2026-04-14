import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2 && password) {
      handleLogin();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Extract name from email for demo purposes
      const name = email.split('@')[0] || 'Usuário';
      login(name.charAt(0).toUpperCase() + name.slice(1));
      setIsLoading(false);
      navigate('/onboarding');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#17171B] flex flex-col items-center justify-between p-6 relative overflow-hidden text-white">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 blur-sm mix-blend-overlay pointer-events-none" />
      
      {/* Logo Area - Top */}
      <div className="flex-1 flex flex-col justify-center w-full z-10 max-w-md mx-auto">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                staggerChildren: 0.2,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1] // Custom ease for "fluid" feel
              }
            }
          }}
          className="text-left"
        >
          <motion.img 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            src="https://i.postimg.cc/GpHmXR5D/Design-sem-nome.png" 
            alt="DTF Logo" 
            className="w-40 h-auto mb-8 drop-shadow-2xl"
          />
          <motion.h1 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-4xl font-bold font-display mb-3"
          >
            Bem-vindo
          </motion.h1>
          <motion.p 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-gray-400 text-lg"
          >
            Entre para continuar
          </motion.p>
        </motion.div>
      </div>

      {/* Input Area - Bottom Sheet Style */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-full max-w-md z-20 mb-8"
      >
        <form onSubmit={handleNext} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                  <input 
                    type="email" 
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-full bg-[#222226] border border-gray-700 text-white focus:border-wine-900 focus:ring-1 focus:ring-wine-900 outline-none transition-all placeholder-gray-600"
                    placeholder="seu@email.com"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-medium text-gray-300">Senha</label>
                    <button type="button" onClick={handleBack} className="text-xs text-gray-500 hover:text-white flex items-center">
                      <ArrowLeft size={12} className="mr-1" /> Voltar
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-full bg-[#222226] border border-gray-700 text-white focus:border-wine-900 focus:ring-1 focus:ring-wine-900 outline-none transition-all pr-12 placeholder-gray-600"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-gray-400 hover:text-white font-medium">
                      Esqueceu a senha?
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            type="submit" 
            variant="primary"
            className="w-full h-14 rounded-full font-bold text-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center space-x-2 bg-tech-pattern btn-tech-glow border border-white/5 relative overflow-hidden"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="relative z-10">{step === 1 ? 'Continuar' : 'Entrar'}</span>
                {step === 1 && <ArrowRight size={20} className="relative z-10" />}
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Não tem uma conta?{' '}
            <button className="text-white font-bold hover:underline">
              Criar conta
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
