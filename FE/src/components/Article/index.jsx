import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { marked } from 'marked';
import agent from '../../agent';
import ArticleMeta from './ArticleMeta';
import CommentContainer from './CommentContainer';
import {
  ARTICLE_PAGE_LOADED,
  ARTICLE_PAGE_UNLOADED,
} from '../../constants/actionTypes';

const mapStateToProps = state => ({
  ...state.article,
  currentUser: state.common.currentUser,
});

const mapDispatchToProps = dispatch => ({
  onLoad: payload => dispatch({ type: ARTICLE_PAGE_LOADED, payload }),
  onUnload: () => dispatch({ type: ARTICLE_PAGE_UNLOADED }),
});

const ArticleInner = ({ article, comments, commentErrors, currentUser, id, onLoad, onUnload }) => {
  useEffect(() => {
    onLoad(Promise.all([
      agent.Articles.get(id),
      agent.Comments.forArticle(id),
    ]));
    return () => onUnload();
  }, [id, onLoad, onUnload]);

  if (!article) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const markup = { __html: marked(article.body) };
  const canModify = currentUser && currentUser.username === article.author.username;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Banner */}
      <div className="relative bg-[#0f172a] text-white py-16 sm:py-24 overflow-hidden border-b border-indigo-900/50 shadow-xl">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[100px] opacity-20 mix-blend-screen pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 leading-tight drop-shadow-md">
            {article.title}
          </h1>
          <ArticleMeta article={article} canModify={canModify} isBanner={true} />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          {/* Custom Typography without needing external plugin */}
          <div className="text-gray-800 text-lg leading-relaxed space-y-6 [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600" dangerouslySetInnerHTML={markup}></div>

          {/* Tags */}
          <ul className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
            {article.tagList.map(tag => (
              <li key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-semibold rounded-full border border-gray-200">
                #{tag}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 flex justify-center">
        <ArticleMeta article={article} canModify={canModify} isBanner={false} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
        <CommentContainer comments={comments || []} errors={commentErrors} slug={id} currentUser={currentUser} />
      </div>
    </div>
  );
};

const Article = (props) => {
  const { id } = useParams();
  return <ArticleInner {...props} id={id} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(Article);