import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MOCK_USERS } from '../data/mock';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  MoreVertical, 
  Phone, 
  Video as VideoIcon,
  Paperclip,
  X,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, chats, sendMessage, matches } = useApp();
  const [inputText, setInputText] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Find the match and other user
  const match = matches.find(m => m.id === matchId);
  const otherUserId = match?.userIds.find(id => id !== user?.id);
  const otherUser = MOCK_USERS.find(u => u.id === otherUserId);
  
  // Find the chat for this match
  const chat = chats.find(c => c.matchId === matchId);
  const messages = chat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() && matchId) {
      sendMessage(matchId, inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && matchId) {
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio';
      const url = URL.createObjectURL(file);
      sendMessage(matchId, undefined, { url, type: type as 'image' | 'video' | 'audio' });
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording start
      setTimeout(() => {
        // Simulate recording end and send
        if (matchId) {
           // In a real app, this would be the recorded audio blob URL
           sendMessage(matchId, undefined, { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'audio' });
           setIsRecording(false);
        }
      }, 3000);
    }
  };

  if (!match || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#17171B] text-white">
        <p className="text-gray-400">Conversa não encontrada.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-white underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#17171B] text-white overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-[#17171B]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="relative">
            <img 
              src={otherUser.avatarUrl} 
              alt={otherUser.name} 
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#17171B]"></div>
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-tight">{otherUser.name}</h2>
            <p className="text-xs text-green-500 font-medium">Online agora</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <button className="hover:text-white transition-colors">
            <Phone size={22} strokeWidth={1.5} />
          </button>
          <button className="hover:text-white transition-colors">
            <VideoIcon size={22} strokeWidth={1.5} />
          </button>
          <button className="hover:text-white transition-colors">
            <MoreVertical size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#17171B] scrollbar-hide overscroll-none">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  isMe 
                    ? 'bg-[#3F1521] text-white rounded-br-none' 
                    : 'bg-[#2A2A30] text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.mediaUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden cursor-pointer">
                    {msg.mediaType === 'image' && (
                      <img 
                        src={msg.mediaUrl} 
                        alt="Sent image" 
                        className="w-full h-auto max-h-60 object-cover" 
                        onClick={() => setSelectedImageUrl(msg.mediaUrl!)}
                      />
                    )}
                    {msg.mediaType === 'video' && (
                      <video src={msg.mediaUrl} controls className="w-full h-auto max-h-60" />
                    )}
                    {msg.mediaType === 'audio' && (
                      <audio src={msg.mediaUrl} controls className="w-full min-w-[200px]" />
                    )}
                  </div>
                )}
                {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/50' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed */}
      <div className="bg-[#17171B] p-3 border-t border-white/5 sticky bottom-0 z-20">
        <div className="flex items-center space-x-2 bg-[#2A2A30] rounded-full px-4 py-2 border border-white/5">
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*,audio/*"
            onChange={handleFileUpload}
          />
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder-gray-500 text-white"
          />
          
          {inputText ? (
            <button 
              onClick={handleSend}
              className="p-2 bg-[#3F1521] rounded-full text-white hover:bg-[#5B343C] transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white transition-colors">
                <ImageIcon size={20} onClick={() => fileInputRef.current?.click()} />
              </button>
              <button 
                className={`text-gray-400 hover:text-red-500 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                onClick={toggleRecording}
              >
                <Mic size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {selectedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10">
              <button 
                onClick={() => setSelectedImageUrl(null)}
                className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => setSelectedImageUrl(null)}
                  className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full h-full flex items-center justify-center p-4"
              onClick={() => setSelectedImageUrl(null)}
            >
              <img 
                src={selectedImageUrl} 
                alt="Full screen view" 
                className="max-w-full max-h-full object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
