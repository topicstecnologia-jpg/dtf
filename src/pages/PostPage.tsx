import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOVIES } from '../data/mock';

export const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { posts, getUserById, toggleLikePost } = useApp();
  const post = posts.find(item => item.id === postId);
  const postUser = getUserById(post?.userId);

  if (!post || !postUser) {
    return (
      <div className="min-h-screen bg-[#17171B] text-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-zinc-400 mb-4">Postagem nao encontrada.</p>
        <button onClick={() => navigate('/home')} className="px-5 py-2 rounded-full bg-white text-black font-bold">
          Voltar
        </button>
      </div>
    );
  }

  const movie = post.movieId ? MOVIES.find(item => item.id === post.movieId) : null;
  const displayImage = post.thumbnailUrl || movie?.posterUrl;

  return (
    <div className="min-h-screen bg-[#17171B] text-white pb-24">
      <div className="sticky top-0 z-20 bg-[#17171B]/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm font-bold">{postUser.handle}</p>
          <p className="text-xs text-zinc-500">Postagem</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {displayImage ? (
          <div className="aspect-[1080/1450] rounded-3xl overflow-hidden bg-zinc-900">
            <img src={displayImage} alt="Post" className="w-full h-full object-cover" />
          </div>
        ) : (
          <article className="rounded-2xl border border-white/10 bg-[#111113] p-5">
            <div className="flex items-start gap-3">
              {postUser.avatarUrl ? (
                <img src={postUser.avatarUrl} alt={postUser.name} className="w-11 h-11 rounded-full object-cover" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#3F1521] flex items-center justify-center font-bold">
                  {postUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold">{postUser.handle}</p>
                <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line">{post.caption}</p>
              </div>
            </div>
          </article>
        )}

        {displayImage && (
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">
            <span className="font-bold text-white mr-2">{postUser.handle}</span>
            {post.caption || 'Sem legenda.'}
          </p>
        )}

        <div className="mt-4 flex items-center gap-6 text-zinc-300">
          <button onClick={() => toggleLikePost(post.id)} className="flex items-center gap-2">
            <Heart size={22} />
            {post.likes}
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle size={22} />
            {post.comments.length}
          </div>
          <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="flex items-center gap-2">
            <Share2 size={22} />
            Link
          </button>
        </div>
      </div>
    </div>
  );
};
