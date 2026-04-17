import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import agent from '../agent';
import { ARTICLE_FAVORITED, ARTICLE_UNFAVORITED } from '../constants/actionTypes';
import { Heart, ChevronRight, Hash } from 'lucide-react';

const mapDispatchToProps = dispatch => ({
  favorite: slug => dispatch({
    type: ARTICLE_FAVORITED,
    payload: agent.Articles.favorite(slug)
  }),
  unfavorite: slug => dispatch({
    type: ARTICLE_UNFAVORITED,
    payload: agent.Articles.unfavorite(slug)
  })
});

// Dynamic Avatar Fallback Component
const Avatar = ({ src, alt, size = "w-10 h-10", textClass = "text-base" }) => {
  const defaultImage = 'https://static.productionready.io/images/smiley-cyrus.jpg';
  const isMissing = !src || src === defaultImage;
  const initial = alt ? alt.charAt(0).toUpperCase() : '?';

  if (isMissing) {
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold ${textClass} shadow-inner shrink-0`}>
        {initial}
      </div>
    );
  }
  return <img src={src} alt={alt} className={`${size} rounded-full object-cover border-2 border-white shadow-sm shrink-0`} />;
};

const ArticlePreview = props => {
  const { article } = props;

  const handleClick = ev => {
    ev.preventDefault();
    if (article.favorited) {
      props.unfavorite(article.slug);
    } else {
      props.favorite(article.slug);
    }
  };

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
      {/* Decorative background gradient element */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <Link to={`/@${article.author.username}`} className="relative transform hover:scale-105 transition-transform">
            <Avatar src={article.author.image} alt={article.author.username} />
          </Link>
          <div className="flex flex-col">
            <Link to={`/@${article.author.username}`} className="font-bold text-gray-900 hover:text-indigo-600 transition-colors">
              {article.author.username}
            </Link>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${article.favorited
            ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
            : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'
            }`}
        >
          <Heart size={16} className={article.favorited ? "fill-red-600 text-red-600" : ""} />
          {article.favoritesCount}
        </button>
      </div>

      <Link to={`/article/${article.slug}`} className="block relative z-10">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
          {article.title}
        </h1>
        <p className="text-gray-500 mb-6 line-clamp-3 leading-relaxed">
          {article.description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
          <span className="text-indigo-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
            Read full article <ChevronRight size={16} strokeWidth={3} />
          </span>

          <ul className="flex flex-wrap gap-2">
            {article.tagList.map(tag => (
              <li key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100 hover:border-indigo-200 hover:text-indigo-600 transition-colors">
                <Hash size={12} className="text-gray-400" />
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </Link>
    </div>
  );
}

export default connect(() => ({}), mapDispatchToProps)(ArticlePreview);