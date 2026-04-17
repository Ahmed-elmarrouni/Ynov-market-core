import React, { useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import agent from '../agent';
import ArticleList from './ArticleList';
import { Avatar } from './Header';
import { Settings, Plus, Minus, FileText, Heart } from 'lucide-react';
import {
  FOLLOW_USER,
  UNFOLLOW_USER,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
} from '../constants/actionTypes';

const mapStateToProps = state => ({
  ...state.articleList,
  currentUser: state.common.currentUser,
  profile: state.profile,
});

const mapDispatchToProps = dispatch => ({
  onFollow: username => dispatch({ type: FOLLOW_USER, payload: agent.Profile.follow(username) }),
  onUnfollow: username => dispatch({ type: UNFOLLOW_USER, payload: agent.Profile.unfollow(username) }),
  onLoad: payload => dispatch({ type: PROFILE_PAGE_LOADED, payload }),
  onUnload: () => dispatch({ type: PROFILE_PAGE_UNLOADED }),
});

const Profile = ({
  currentUser,
  profile,
  articles,
  articlesCount,
  currentPage,
  pager,
  onLoad,
  onUnload,
  onFollow,
  onUnfollow
}) => {
  const { username } = useParams();
  const location = useLocation();
  const isFavoritesTab = location.pathname.endsWith('/favorites');

  useEffect(() => {
    // Fetch profile and articles depending on which tab we are on
    const articlesPromise = isFavoritesTab
      ? agent.Articles.favoritedBy(username)
      : agent.Articles.byAuthor(username);

    onLoad(Promise.all([agent.Profile.get(username), articlesPromise]));

    return () => {
      onUnload();
    };
  }, [username, isFavoritesTab, onLoad, onUnload]);

  // Loading State Fix - Prevents the blank screen crash
  if (!profile || !profile.username) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const isUser = currentUser && profile.username === currentUser.username;

  const handleFollowClick = (ev) => {
    ev.preventDefault();
    if (profile.following) {
      onUnfollow(profile.username);
    } else {
      onFollow(profile.username);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
          <Avatar
            src={profile.image}
            alt={profile.username}
            size="w-32 h-32 mb-4 shadow-md ring-4 ring-indigo-50"
            textClass="text-4xl"
          />
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile.username}</h2>
          {profile.bio && <p className="mt-3 text-lg text-gray-500 max-w-2xl">{profile.bio}</p>}

          <div className="mt-6 flex justify-center gap-4">
            {isUser ? (
              <Link to="/settings" className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                <Settings size={16} /> Edit Profile Settings
              </Link>
            ) : (
              <button
                onClick={handleFollowClick}
                className={`inline-flex items-center gap-2 px-6 py-2.5 shadow-sm text-sm font-medium rounded-full transition-colors ${profile.following
                  ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  : 'border border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                {profile.following ? <Minus size={16} /> : <Plus size={16} />}
                {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-6 border-b border-gray-200 mb-6">
          <Link
            to={`/@${profile.username}`}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${!isFavoritesTab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <FileText size={16} /> My Articles
          </Link>
          <Link
            to={`/@${profile.username}/favorites`}
            className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${isFavoritesTab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Heart size={16} /> Favorited Articles
          </Link>
        </div>

        <ArticleList
          pager={pager}
          articles={articles}
          articlesCount={articlesCount}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);