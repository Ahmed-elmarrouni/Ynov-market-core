import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { Edit3, Trash2, Heart, Plus, AlertTriangle } from 'lucide-react';
import agent from '../../agent';
import { Avatar } from '../Header';
import { DELETE_ARTICLE, FOLLOW_USER, UNFOLLOW_USER, ARTICLE_FAVORITED, ARTICLE_UNFAVORITED } from '../../constants/actionTypes';

const mapDispatchToProps = dispatch => ({
  onClickDelete: payload => dispatch({ type: DELETE_ARTICLE, payload }),
  follow: username => dispatch({ type: FOLLOW_USER, payload: agent.Profile.follow(username) }),
  unfollow: username => dispatch({ type: UNFOLLOW_USER, payload: agent.Profile.unfollow(username) }),
  favorite: slug => dispatch({ type: ARTICLE_FAVORITED, payload: agent.Articles.favorite(slug) }),
  unfavorite: slug => dispatch({ type: ARTICLE_UNFAVORITED, payload: agent.Articles.unfavorite(slug) })
});

// Reusable Confirmation Modal
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-50 text-red-500 p-3 rounded-full"><AlertTriangle size={24} /></div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-500 mb-8">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};

const ArticleMeta = ({ article, canModify, isBanner, onClickDelete, follow, unfollow, favorite, unfavorite }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const textColor = isBanner ? "text-gray-300" : "text-gray-500";
  const nameColor = isBanner ? "text-white" : "text-gray-900";

  const handleDelete = () => {
    onClickDelete(agent.Articles.del(article.slug));
    setShowModal(false);
    navigate('/');
  };

  const toggleFavorite = () => {
    if (article.favorited) unfavorite(article.slug);
    else favorite(article.slug);
  };

  const toggleFollow = () => {
    if (article.author.following) unfollow(article.author.username);
    else follow(article.author.username);
  };

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-3">
        <Link to={`/@${article.author.username}`}><Avatar src={article.author.image} alt={article.author.username} size="w-12 h-12" /></Link>
        <div>
          <Link to={`/@${article.author.username}`} className={`font-bold text-lg hover:underline block ${nameColor}`}>{article.author.username}</Link>
          <span className={`text-sm ${textColor}`}>{new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {canModify ? (
          <>
            <Link to={`/editor/${article.slug}`} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${isBanner ? 'text-gray-300 border-gray-600 hover:bg-white/10' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
              <Edit3 size={14} /> Edit Article
            </Link>
            <button onClick={() => setShowModal(true)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${isBanner ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' : 'text-red-500 border-red-200 hover:bg-red-50'}`}>
              <Trash2 size={14} /> Delete Article
            </button>
            <ConfirmModal isOpen={showModal} onClose={() => setShowModal(false)} onConfirm={handleDelete} title="Delete Article?" message="Are you sure you want to permanently delete this article? This action cannot be undone." />
          </>
        ) : (
          <>
            <button onClick={toggleFollow} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${article.author.following ? 'bg-gray-200 text-gray-800 border-transparent' : (isBanner ? 'text-gray-300 border-gray-600 hover:bg-white/10' : 'text-gray-600 border-gray-300 hover:bg-gray-50')}`}>
              {article.author.following ? 'Unfollow' : <><Plus size={14} /> Follow</>} {article.author.username}
            </button>
            <button onClick={toggleFavorite} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${article.favorited ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : (isBanner ? 'text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50')}`}>
              <Heart size={14} className={article.favorited ? "fill-red-600 text-red-600" : ""} />
              {article.favorited ? 'Unfavorite' : 'Favorite'} ({article.favoritesCount})
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default connect(() => ({}), mapDispatchToProps)(ArticleMeta);