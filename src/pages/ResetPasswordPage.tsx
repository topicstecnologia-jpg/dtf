import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, authError } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (password.length < 6) {
      setLocalError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('As senhas nao conferem.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      setSuccessMessage('Senha atualizada com sucesso.');
      setTimeout(() => navigate('/home'), 900);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Não foi possível atualizar a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17171B] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20 blur-sm mix-blend-overlay pointer-events-none" />

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-full max-w-md z-10"
      >
        <img
          src="https://i.postimg.cc/GpHmXR5D/Design-sem-nome.png"
          alt="DTF Logo"
          className="w-36 h-auto mb-8 drop-shadow-2xl"
        />

        <div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-[#222226] border border-white/10 flex items-center justify-center mb-5">
            <Lock size={22} />
          </div>
          <h1 className="text-4xl font-bold font-display mb-3">Nova senha</h1>
          <p className="text-gray-400 text-lg">Defina uma nova senha para sua conta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Nova senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Confirmar senha</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full px-6 py-4 rounded-full bg-[#222226] border border-gray-700 text-white focus:border-wine-900 focus:ring-1 focus:ring-wine-900 outline-none transition-all placeholder-gray-600"
              placeholder="********"
            />
          </div>

          {(localError || authError) && !successMessage && (
            <p className="text-sm text-red-300 text-center">{localError || authError}</p>
          )}

          {successMessage && (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 text-center">
              {successMessage}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full h-14 rounded-full font-bold text-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center bg-tech-pattern btn-tech-glow border border-white/5"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Atualizar senha'
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
