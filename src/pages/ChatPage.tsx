import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
  Download,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, chats, sendMessage, sendMediaMessage, matches, getUserById } = useApp();
  const [inputText, setInputText] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const match = matches.find(m => m.id === matchId);
  const otherUserId = match?.userIds.find(id => id !== user?.id);
  const otherUser = getUserById(otherUserId);
  const chat = chats.find(c => c.matchId === matchId);
  const messages = chat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim() && matchId) {
      await sendMessage(matchId, inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !matchId) return;

    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio';
    setIsSendingMedia(true);

    try {
      await sendMediaMessage(matchId, file, type as 'image' | 'video' | 'audio');
    } finally {
      setIsSendingMedia(false);
      event.target.value = '';
    }
  };

  const startRecording = async () => {
    if (!matchId) return;
    setRecordingError('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordingError('Gravacao de audio nao esta disponivel neste navegador.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (audioBlob.size === 0 || !matchId) return;

        setIsSendingMedia(true);
        try {
          await sendMediaMessage(matchId, audioBlob, 'audio');
        } catch (error) {
          setRecordingError(error instanceof Error ? error.message : 'Nao foi possivel enviar o audio.');
        } finally {
          setIsSendingMedia(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setRecordingError(error instanceof Error ? error.message : 'Permita o acesso ao microfone para gravar audio.');
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  };

  if (!match || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-[#17171B] text-white">
        <p className="text-gray-400">Conversa nao encontrada.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-white underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-[#17171B] text-white overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#17171B]/95 backdrop-blur-xl px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 -ml-1 rounded-full hover:bg-white/5 text-white shrink-0">
            <ArrowLeft size={23} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/profile/${otherUser.handle}`)}
            className="relative shrink-0"
          >
            <img
              src={otherUser.avatarUrl}
              alt={otherUser.name}
              className="w-11 h-11 rounded-full object-cover border border-white/10"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#17171B]" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/profile/${otherUser.handle}`)}
            className="text-left min-w-0"
          >
            <h2 className="font-bold text-white text-base leading-tight truncate">{otherUser.name}</h2>
            <p className="text-xs text-gray-400 font-medium truncate">{otherUser.handle}</p>
          </button>
        </div>
        <div className="flex items-center space-x-3 text-gray-400 shrink-0">
          <button className="hover:text-white transition-colors">
            <Phone size={21} strokeWidth={1.5} />
          </button>
          <button className="hover:text-white transition-colors">
            <VideoIcon size={21} strokeWidth={1.5} />
          </button>
          <button className="hover:text-white transition-colors">
            <MoreVertical size={21} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="h-full overflow-y-auto px-4 pt-24 pb-28 space-y-4 bg-[#17171B] scrollbar-hide overscroll-none">
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
                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                  isMe
                    ? 'bg-[#3F1521] text-white rounded-br-none'
                    : 'bg-[#2A2A30] text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.mediaUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                    {msg.mediaType === 'image' && (
                      <img
                        src={msg.mediaUrl}
                        alt="Sent image"
                        className="w-full h-auto max-h-60 object-cover cursor-pointer"
                        onClick={() => setSelectedImageUrl(msg.mediaUrl!)}
                      />
                    )}
                    {msg.mediaType === 'video' && (
                      <video src={msg.mediaUrl} controls className="w-full h-auto max-h-60" />
                    )}
                    {msg.mediaType === 'audio' && (
                      <audio src={msg.mediaUrl} controls className="w-full min-w-[220px] max-w-full" />
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

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#17171B]/95 backdrop-blur-xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-white/5">
        {(recordingError || isRecording || isSendingMedia) && (
          <div className="px-4 pb-2 text-xs">
            {recordingError && <p className="text-red-300">{recordingError}</p>}
            {isRecording && <p className="text-red-300 animate-pulse">Gravando audio... toque no quadrado para enviar.</p>}
            {isSendingMedia && <p className="text-gray-400">Enviando midia...</p>}
          </div>
        )}
        <div className="flex items-center space-x-2 bg-[#2A2A30] rounded-full px-4 py-2 border border-white/5">
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSendingMedia}
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
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder-gray-500 text-white outline-none min-w-0"
            disabled={isRecording}
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
              <button className="text-gray-400 hover:text-white transition-colors" disabled={isSendingMedia}>
                <ImageIcon size={20} onClick={() => fileInputRef.current?.click()} />
              </button>
              <button
                className={`transition-colors ${isRecording ? 'text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                onClick={toggleRecording}
                disabled={isSendingMedia}
              >
                {isRecording ? <Square size={19} fill="currentColor" /> : <Mic size={20} />}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          >
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
                onClick={(event) => event.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
