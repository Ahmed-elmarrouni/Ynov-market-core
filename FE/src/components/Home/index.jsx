import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Banner from './Banner';
import MainView from './MainView';
import Tags from './Tags';
import agent from '../../agent';
import { Sparkles } from 'lucide-react';
import {
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  APPLY_TAG_FILTER,
} from '../../constants/actionTypes';

const mapStateToProps = state => ({
  ...state.home,
  appName: state.common.appName,
  token: state.common.token,
});

const mapDispatchToProps = dispatch => ({
  onClickTag: (tag, pager, payload) =>
    dispatch({ type: APPLY_TAG_FILTER, tag, pager, payload }),
  onLoad: (tab, pager, payload) =>
    dispatch({ type: HOME_PAGE_LOADED, tab, pager, payload }),
  onUnload: () => dispatch({ type: HOME_PAGE_UNLOADED }),
});

const Home = ({ appName, token, tags, onClickTag, onLoad, onUnload }) => {
  useEffect(() => {
    const tab = token ? 'feed' : 'all';
    const articlesPromise = token ? agent.Articles.feed : agent.Articles.all;

    // Load Tags and Articles concurrently
    onLoad(
      tab,
      articlesPromise,
      Promise.all([agent.Tags.getAll(), articlesPromise()])
    );

    return () => {
      onUnload();
    };
  }, [token, onLoad, onUnload]);

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden flex flex-col">
      {/* Futuristic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-indigo-200/40 to-transparent blur-3xl -z-10 pointer-events-none" />

      <Banner token={token} appName={appName} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Feed Column */}
          <div className="w-full lg:w-2/3">
            <MainView />
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                Trending Topics
              </h3>

              <Tags tags={tags} onClickTag={onClickTag} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);