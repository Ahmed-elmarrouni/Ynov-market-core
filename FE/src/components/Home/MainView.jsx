import { connect } from 'react-redux';
import ArticleList from '../ArticleList';
import agent from '../../agent';
import { CHANGE_TAB } from '../../constants/actionTypes';
import { Globe, UserCircle, Hash } from 'lucide-react';

const YourFeedTab = ({ token, tab, onTabClick }) => {
  if (!token) return null;

  const isActive = tab === 'feed';
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onTabClick('feed', agent.Articles.feed, agent.Articles.feed());
      }}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${isActive
        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
        : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
        }`}
    >
      <UserCircle size={18} /> Your Feed
    </button>
  );
};

const GlobalFeedTab = ({ tab, onTabClick }) => {
  const isActive = tab === 'all';
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onTabClick('all', agent.Articles.all, agent.Articles.all());
      }}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${isActive
        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
        : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
        }`}
    >
      <Globe size={18} /> Global Feed
    </button>
  );
};

const TagFilterTab = ({ tag }) => {
  if (!tag) return null;

  return (
    <button className="flex items-center gap-1.5 px-4 py-3 text-sm font-bold transition-all duration-200 border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50">
      <Hash size={16} strokeWidth={3} /> {tag}
    </button>
  );
};

const mapStateToProps = state => ({
  ...state.articleList,
  tags: state.home.tags,
  token: state.common.token
});

const mapDispatchToProps = dispatch => ({
  onTabClick: (tab, pager, payload) => dispatch({ type: CHANGE_TAB, tab, pager, payload })
});

const MainView = props => {
  return (
    <div className="flex flex-col gap-6">
      {/* Modern Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-wrap">
        <YourFeedTab token={props.token} tab={props.tab} onTabClick={props.onTabClick} />
        <GlobalFeedTab tab={props.tab} onTabClick={props.onTabClick} />
        <TagFilterTab tag={props.tag} />
      </div>

      {/* Article List */}
      <div className="w-full">
        <ArticleList
          pager={props.pager}
          articles={props.articles}
          loading={props.loading}
          articlesCount={props.articlesCount}
          currentPage={props.currentPage}
        />
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MainView);