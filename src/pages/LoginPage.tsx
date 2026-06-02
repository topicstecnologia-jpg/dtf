import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signUp, resendConfirmation, requestPasswordReset, authError } = useApp();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetFeedback = () => {
    setLocalError('');
    setSuccessMessage('');
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStep(1);
    setPassword('');
    resetFeedback();
  };

  const ensureEmail = () => {
    if (!email.trim()) {
      setLocalError('Informe seu email primeiro.');
      return false;
    }
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    resetFeedback();

    if (!ensureEmail()) return;

    if (mode === 'forgot') {
      handlePasswordReset();
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    if (!password) {
      setLocalError('Informe sua senha.');
      return;
    }

    handleAuth();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      resetFeedback();
    }
  };

  const handleAuth = async () => {
    setIsLoading(true);
    resetFeedback();

    try {
      if (mode === 'signup') {
        await signUp(email, password, name, handle);
      } else {
        await login(email, password);
      }
      navigate('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel autenticar.';
      if (message.includes('Confirme seu email')) {
        setSuccessMessage(message);
      } else {
        setLocalError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!ensureEmail()) return;
    setIsLoading(true);
    resetFeedback();

    try {
      await resendConfirmation(email);
      setSuccessMessage('Email de confirmacao reenviado. Confira sua caixa de entrada.');
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Nao foi possivel reenviar a confirmacao.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!ensureEmail()) return;
    setIsLoading(true);
    resetFeedback();

    try {
      await requestPasswordReset(email);
      setSuccessMessage('Enviamos um link para voce redefinir sua senha.');
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Nao foi possivel enviar a recuperacao de senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'signup' ? 'Criar conta' : mode === 'forgot' ? 'Recuperar senha' : 'Bem-vindo';
  const subtitle = mode === 'signup'
    ? 'Cadastre-se para entrar'
    : mode === 'forgot'
      ? 'Receba um link seguro no seu email'
      : 'Entre para continuar';
  const primaryLabel = mode === 'forgot'
    ? 'Enviar link'
    : step === 1
      ? 'Continuar'
      : mode === 'signup'
        ? 'Criar conta'
        : 'Entrar';

  return (
    <div className="min-h-screen bg-[#17171B] flex flex-col items-center justify-between p-6 relative overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 blur-sm mix-blend-overlay pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center w-full z-10 max-w-md mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
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
            {title}
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-gray-400 text-lg"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-full max-w-md z-20 mb-8"
      >
        <form onSubmit={handleNext} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 || mode === 'forgot' ? (
              <motion.div
                key="step-email"
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
                {mode === 'signup' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 ml-1">Nome</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-6 py-4 rounded-full bg-[#222226] border border-gray-700 text-white focus:border-wine-900 focus:ring-1 focus:ring-wine-900 outline-none transition-all placeholder-gray-600"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 ml-1">@ de usuario</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                        <input
                          type="text"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          className="w-full px-6 py-4 pl-10 rounded-full bg-[#222226] border border-gray-700 text-white focus:border-wine-900 focus:ring-1 focus:ring-wine-900 outline-none transition-all placeholder-gray-600"
                          placeholder="seunome"
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="step-password"
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-4 rounded-full bg-[#222226] border border-gray-700 text-white focus:border-wine-900 focus:ring-1 focus:ring-wine-900 outline-none transition-all pr-12 placeholder-gray-600"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {mode === 'login' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => changeMode('forgot')}
                        className="text-xs text-gray-400 hover:text-white font-medium"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(localError || authError) && !successMessage && (
            <p className="text-sm text-red-300 text-center">{localError || authError}</p>
          )}

          {successMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <Mail size={18} className="mt-0.5 shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

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
                <span className="relative z-10">{primaryLabel}</span>
                {(step === 1 || mode === 'forgot') && <ArrowRight size={20} className="relative z-10" />}
              </>
            )}
          </Button>
        </form>

        {mode === 'signup' && (
          <button
            type="button"
            onClick={handleResendConfirmation}
            disabled={isLoading || !email}
            className="mt-4 w-full text-sm text-gray-300 hover:text-white disabled:text-gray-600"
          >
            Reenviar confirmacao de email
          </button>
        )}

        <div className="mt-8 text-center space-y-3">
          {mode === 'forgot' ? (
            <button type="button" onClick={() => changeMode('login')} className="text-white font-bold hover:underline">
              Voltar para entrar
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'Nao tem uma conta?' : 'Ja tem uma conta?'}{' '}
              <button
                type="button"
                onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}
                className="text-white font-bold hover:underline"
              >
                {mode === 'login' ? 'Criar conta' : 'Entrar'}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
