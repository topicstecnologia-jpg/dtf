import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ONBOARDING_QUESTIONS, MOVIES, MOCK_USERS } from '../data/mock';
import { ChevronRight, Check } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  
  const [phase, setPhase] = useState<'questions' | 'result' | 'movies' | 'matches'>('questions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [swipedMovies, setSwipedMovies] = useState<string[]>([]);
  const [calculatedProfile, setCalculatedProfile] = useState<string>('Romântico Idealista');

  const profileDescriptions: Record<string, string> = {
    'Romântico Idealista': 'Você acredita no poder transformador do amor e busca conexões profundas que transcendem o cotidiano.',
    'Explorador Existencial': 'Sua jornada é marcada pela busca por significado e pela compreensão das complexidades da vida.',
    'Amante de Histórias Intensas': 'Você se atrai por narrativas viscerais e personagens que vivem cada momento com paixão absoluta.',
    'Sonhador Nostálgico': 'O passado e as memórias têm um lugar especial no seu coração, guiando sua busca por beleza.',
    'Coração Dramático': 'Você abraça a montanha-russa das emoções humanas, encontrando beleza na vulnerabilidade.'
  };

  // Questions Logic
  const question = ONBOARDING_QUESTIONS[currentQuestionIndex];
  const totalQuestions = ONBOARDING_QUESTIONS.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleOptionSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate profile
      const counts: Record<string, number> = {};
      Object.values(answers).forEach((val: string) => {
        counts[val] = (counts[val] || 0) + 1;
      });
      
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const topTrait = sorted[0]?.[0] || 'romantic';

      let profile = 'Romântico Idealista';
      if (topTrait === 'existential') profile = 'Explorador Existencial';
      if (topTrait === 'intense') profile = 'Amante de Histórias Intensas';
      if (topTrait === 'dreamer') profile = 'Sonhador Nostálgico';
      if (topTrait === 'dramatic') profile = 'Coração Dramático';

      setCalculatedProfile(profile);
      setPhase('result');
    }
  };

  // Movies Logic
  const recommendedMovies = MOVIES.slice(0, 3);
  const handleSwipe = (id: string) => {
    setSwipedMovies(prev => [...prev, id]);
    if (swipedMovies.length + 1 >= recommendedMovies.length) {
      setTimeout(() => setPhase('matches'), 800);
    }
  };

  // Matches Logic
  const matchedUsers = MOCK_USERS.slice(0, 3);

  const handleFinish = () => {
    completeOnboarding(answers);
    navigate('/home');
  };

  // Render Functions
  const renderQuestions = () => (
    <div className="flex flex-col h-full p-6 max-w-md mx-auto w-full">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#2A2A30] rounded-full mb-8 mt-4">
        <motion.div 
          className="h-full bg-[#3F1521] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-sm font-bold text-[#3F1521] mb-2 uppercase tracking-wider">
          Passo {currentQuestionIndex + 1}
        </h2>
        <motion.p 
          key={question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-bold text-white mb-8 leading-tight"
        >
          {question.text}
        </motion.p>

        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.value;
            return (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full p-5 rounded-2xl text-left transition-all border relative overflow-hidden ${
                  isSelected 
                    ? 'bg-[#3F1521] border-[#3F1521] text-white shadow-[0_0_15px_rgba(63,21,33,0.5)] bg-tech-pattern' 
                    : 'bg-[#222226] border-white/5 text-gray-300 hover:bg-[#2A2A30]'
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className="font-medium text-lg">{option.text}</span>
                  {isSelected && <Check size={20} className="text-white" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={handleNextQuestion}
          disabled={!answers[question.id]}
          className="w-full flex items-center justify-center space-x-2 py-4 h-14 rounded-full bg-[#3F1521] hover:bg-[#5B343C] text-white font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:shadow-none transition-all bg-tech-pattern btn-tech-glow border border-white/5"
        >
          <span>Próxima</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderResult = () => (
    <div 
      className="flex flex-col h-full items-center justify-center p-6 text-center cursor-pointer max-w-md mx-auto w-full"
      onClick={() => setPhase('movies')}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <h2 className="text-2xl text-gray-400 font-light">Seu tipo de amor é</h2>
        <h1 className="text-5xl font-display font-bold text-white leading-tight">
          {calculatedProfile.split(' ').map((word, i) => (
            <React.Fragment key={i}>
              {word}
              {i === 0 && calculatedProfile.split(' ').length > 1 && <br/>}
              {i !== 0 && ' '}
            </React.Fragment>
          ))}
        </h1>
        <p className="text-gray-400 text-lg max-w-[280px] mx-auto leading-relaxed">
          {profileDescriptions[calculatedProfile]}
        </p>
        <p className="text-white/40 animate-pulse mt-12 font-medium uppercase tracking-widest text-xs">
          Toque para continuar
        </p>
      </motion.div>
    </div>
  );

  const renderMovies = () => (
    <div className="flex flex-col h-full items-center justify-center p-6 relative max-w-md mx-auto w-full">
      <h2 className="text-2xl font-bold text-white mb-12 text-center absolute top-12 z-10">
        Filmes que combinam<br/>com você
      </h2>
      
      <div className="relative w-full max-w-[280px] aspect-[2/3] flex items-center justify-center" style={{ perspective: '1200px' }}>
        <AnimatePresence>
          {recommendedMovies.filter(m => !swipedMovies.includes(m.id)).map((movie, index) => {
             const isTop = index === 0;
             return (
               <SwipeCard 
                 key={movie.id} 
                 movie={movie} 
                 index={index} 
                 onSwipe={() => handleSwipe(movie.id)} 
                 isTop={isTop}
               />
             );
          }).reverse()} 
        </AnimatePresence>
      </div>
      
      <p className="text-gray-500 text-sm mt-12 absolute bottom-12">
        Arraste para cima para jogar
      </p>
    </div>
  );

  const renderMatches = () => (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 w-full"
      >
        <div>
          <h2 className="text-4xl font-display font-bold text-white mb-2">Deu Match!</h2>
          <p className="text-gray-400">Usuários que combinam com você</p>
        </div>

        <div className="flex justify-center space-x-4 py-8">
          {matchedUsers.map((user, i) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2 + 0.3 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#3F1521] to-pink-500 shadow-xl">
                <div className="w-full h-full rounded-full p-[2px] bg-[#17171B]">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <span className="text-white font-medium text-sm">{user.name.split(' ')[0]}</span>
                <span className="text-[#3F1521] font-bold text-xs bg-[#3F1521]/10 px-2 py-0.5 rounded-full border border-[#3F1521]/20">
                  {Math.floor(Math.random() * 15) + 80}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={handleFinish}
          className="w-full py-4 rounded-full bg-[#3F1521] hover:bg-[#5B343C] text-white font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.3)] transition-all mt-8 bg-tech-pattern btn-tech-glow border border-white/5 relative overflow-hidden"
        >
          <span className="relative z-10">Começar a explorar</span>
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#17171B] overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {phase === 'questions' && (
          <motion.div key="questions" className="h-screen" exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }}>{renderQuestions()}</motion.div>
        )}
        {phase === 'result' && (
          <motion.div key="result" className="h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>{renderResult()}</motion.div>
        )}
        {phase === 'movies' && (
          <motion.div key="movies" className="h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>{renderMovies()}</motion.div>
        )}
        {phase === 'matches' && (
          <motion.div key="matches" className="h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>{renderMatches()}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Subcomponent for Swipe Card
const SwipeCard = ({ movie, index, onSwipe, isTop }: any) => {
  const y = useMotionValue(0);
  const rotate = useTransform(y, [-300, 0, 300], [-15, 0, 15]);
  const opacity = useTransform(y, [-300, -150, 0], [0, 0.5, 1]);
  
  // 3D Stack values
  const scale = 1 - index * 0.08;
  const z = -index * 60;
  const yOffset = -index * 30;
  const rotateX = -index * 5;

  return (
    <motion.div
      style={{ 
        y: isTop ? y : yOffset, 
        rotate: isTop ? rotate : 0,
        zIndex: 10 - index,
        scale,
        z,
        rotateX,
        opacity: isTop ? opacity : 1 - index * 0.25,
        transformStyle: 'preserve-3d'
      }}
      drag={isTop ? "y" : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (info.offset.y < -100) {
          onSwipe();
        }
      }}
      initial={{ scale: 0.8, opacity: 0, z: -200, y: 100 }}
      animate={{ 
        scale, 
        opacity: 1 - index * 0.25, 
        y: isTop ? 0 : yOffset,
        z,
        rotateX
      }}
      exit={{ y: -500, opacity: 0, transition: { duration: 0.3 } }}
      className="absolute w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-[#222226] border border-white/10"
    >
      {/* Shine Effect */}
      {isTop && (
        <motion.div 
          className="absolute inset-0 z-20 pointer-events-none"
          initial={{ x: '-150%', skewX: -25 }}
          animate={{ x: '250%' }}
          transition={{ 
            duration: 1.8, 
            delay: 0.8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2.5
          }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
          }}
        />
      )}

      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20">
        <h3 className="text-white font-bold text-2xl">{movie.title}</h3>
        <p className="text-gray-300 text-sm mt-1">{movie.year} • {movie.genres[0]}</p>
      </div>
    </motion.div>
  );
};
