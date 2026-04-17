import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import agent from '../../agent';
import { ADD_COMMENT, DELETE_COMMENT } from '../../constants/actionTypes';
import ListErrors from '../ListErrors';
import { Avatar } from '../Header';
import { ConfirmModal } from './ArticleMeta';

const mapDispatchToProps = dispatch => ({
  onAddComment: payload => dispatch({ type: ADD_COMMENT, payload }),
  onDeleteComment: (payload, commentId) => dispatch({ type: DELETE_COMMENT, payload, commentId })
});

const CommentCard = ({ comment, currentUser, slug, onDeleteComment }) => {
  const [showModal, setShowModal] = useState(false);
  const isOwner = currentUser && currentUser.username === comment.author.username;

  const handleDelete = () => {
    onDeleteComment(agent.Comments.delete(slug, comment.id), comment.id);
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
      <p className="text-gray-800 text-[15px] mb-4 whitespace-pre-wrap">{comment.body}</p>
      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="flex items-center gap-2">
          <Link to={`/@${comment.author.username}`}><Avatar src={comment.author.image} alt={comment.author.username} size="w-8 h-8" /></Link>
          <Link to={`/@${comment.author.username}`} className="text-sm font-bold text-gray-900 hover:text-indigo-600">{comment.author.username}</Link>
          <span className="text-xs text-gray-400 font-medium ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        {isOwner && (
          <>
            <button onClick={() => setShowModal(true)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
              <Trash2 size={16} />
            </button>
            <ConfirmModal isOpen={showModal} onClose={() => setShowModal(false)} onConfirm={handleDelete} title="Delete Comment?" message="Are you sure you want to remove this comment?" />
          </>
        )}
      </div>
    </div>
  );
};

const CommentContainer = ({ comments, errors, slug, currentUser, onAddComment, onDeleteComment }) => {
  const [body, setBody] = useState('');

  const createComment = (ev) => {
    ev.preventDefault();
    onAddComment(agent.Comments.create(slug, { body }));
    setBody('');
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
        <MessageSquare className="text-indigo-600" /> Discussion ({comments?.length || 0})
      </h3>

      {currentUser ? (
        <form onSubmit={createComment} className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow">
          <ListErrors errors={errors} />
          <textarea
            className="w-full p-4 border-0 focus:ring-0 text-gray-800 resize-none min-h-[120px]"
            placeholder="Share your thoughts..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex items-center justify-between">
            <Avatar src={currentUser.image} alt={currentUser.username} size="w-8 h-8" />
            <button type="submit" disabled={!body.trim()} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Send size={14} /> Post
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-indigo-50 text-indigo-800 rounded-2xl p-6 text-center font-medium border border-indigo-100 shadow-inner">
          <Link to="/login" className="font-bold underline hover:text-indigo-600">Sign in</Link> or <Link to="/register" className="font-bold underline hover:text-indigo-600">sign up</Link> to join the conversation.
        </div>
      )}

      <div className="space-y-4">
        {(comments || []).map(comment => (
          <CommentCard key={comment.id} comment={comment} currentUser={currentUser} slug={slug} onDeleteComment={onDeleteComment} />
        ))}
      </div>
    </div>
  );
};

export default connect(() => ({}), mapDispatchToProps)(CommentContainer);