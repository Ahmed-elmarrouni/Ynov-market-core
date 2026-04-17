import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { Edit3, Eye, Tag, Send, LayoutTemplate } from 'lucide-react';
import agent from '../agent';
import ListErrors from './ListErrors';
import {
  ADD_TAG,
  EDITOR_PAGE_LOADED,
  REMOVE_TAG,
  ARTICLE_SUBMITTED,
  EDITOR_PAGE_UNLOADED,
  UPDATE_FIELD_EDITOR
} from '../constants/actionTypes';

const mapStateToProps = state => ({ ...state.editor });

const mapDispatchToProps = dispatch => ({
  onAddTag: () => dispatch({ type: ADD_TAG }),
  onLoad: payload => dispatch({ type: EDITOR_PAGE_LOADED, payload }),
  onRemoveTag: tag => dispatch({ type: REMOVE_TAG, tag }),
  onSubmit: payload => dispatch({ type: ARTICLE_SUBMITTED, payload }),
  onUnload: () => dispatch({ type: EDITOR_PAGE_UNLOADED }),
  onUpdateField: (key, value) => dispatch({ type: UPDATE_FIELD_EDITOR, key, value })
});

const EditorInner = (props) => {
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
  const [isPreviewMode, setIsPreviewMode] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => setIsPreviewMode(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (props.slug) {
      props.onLoad(agent.Articles.get(props.slug));
    } else {
      props.onLoad(null);
    }
    return () => {
      props.onUnload();
    };
  }, [props.slug, props.onLoad, props.onUnload]);

  const updateFieldEvent = key => ev => props.onUpdateField(key, ev.target.value);
  const changeTitle = updateFieldEvent('title');
  const changeDescription = updateFieldEvent('description');
  const changeBody = updateFieldEvent('body');
  const changeTagInput = updateFieldEvent('tagInput');

  const watchForEnter = ev => {
    // Check both standard key and legacy keyCode for maximum compatibility
    if (ev.key === 'Enter' || ev.keyCode === 13) {
      ev.preventDefault();
      props.onAddTag();
    }
  };
  const submitForm = ev => {
    ev.preventDefault();
    const article = {
      title: props.title,
      description: props.description,
      body: props.body,
      tagList: props.tagList
    };
    const slug = { slug: props.articleSlug };
    const promise = props.articleSlug ? agent.Articles.update(Object.assign(article, slug)) : agent.Articles.create(article);
    props.onSubmit(promise);
  };

  const renderPreview = () => ({
    __html: marked(props.body || '*Nothing to preview yet...*')
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutTemplate className="text-indigo-600" size={32} />
            {props.articleSlug ? 'Edit Article' : 'New Article'}
          </h1>
          <button
            onClick={submitForm}
            disabled={props.inProgress}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Send size={18} /> Publish
          </button>
        </div>

        <ListErrors errors={props.errors} />

        {/* Top Metadata Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <input
            type="text"
            className="w-full text-3xl font-bold bg-transparent border-0 border-b-2 border-transparent hover:border-gray-100 focus:border-indigo-500 focus:ring-0 transition-colors placeholder-gray-300 px-0 py-2"
            placeholder="Article Title..."
            value={props.title || ''}
            onChange={changeTitle}
          />
          <input
            type="text"
            className="w-full text-lg text-gray-600 bg-transparent border-0 border-b-2 border-transparent hover:border-gray-100 focus:border-indigo-500 focus:ring-0 transition-colors placeholder-gray-400 px-0 py-2"
            placeholder="What's this article about?"
            value={props.description || ''}
            onChange={changeDescription}
          />
        </div>

        {/* Split/Tabbed Editor Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">

          {/* Editor Header / Mobile Tabs */}
          <div className="flex items-center justify-between px-4 border-b border-gray-100 bg-gray-50/50">
            {!isPreviewMode && (
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('write')} className={`py-3 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'write' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <span className="flex items-center gap-2"><Edit3 size={16} /> Write</span>
                </button>
                <button onClick={() => setActiveTab('preview')} className={`py-3 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'preview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <span className="flex items-center gap-2"><Eye size={16} /> Preview</span>
                </button>
              </div>
            )}
            {isPreviewMode && (
              <div className="py-3 px-2 text-sm font-semibold text-gray-500 flex items-center gap-2">
                <Edit3 size={16} /> Markdown Editor <span className="mx-2">|</span> <Eye size={16} /> Live Preview
              </div>
            )}
          </div>

          {/* Editor Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Markdown Input */}
            {(activeTab === 'write' || isPreviewMode) && (
              <div className={`flex-1 border-r border-gray-100 h-full p-4`}>
                <textarea
                  className="w-full h-full resize-none border-0 focus:ring-0 font-mono text-sm text-gray-800 bg-transparent placeholder-gray-300"
                  placeholder="Write your article (Markdown supported)..."
                  value={props.body || ''}
                  onChange={changeBody}
                ></textarea>
              </div>
            )}

            {/* HTML Preview */}
            {(activeTab === 'preview' || isPreviewMode) && (
              <div className="flex-1 h-full p-6 overflow-y-auto bg-[#fafafa]">
                <div className="prose prose-indigo max-w-none" dangerouslySetInnerHTML={renderPreview()}></div>
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
            <Tag size={20} />
          </div>
          <div className="flex-1">
            <input
              type="text"
              className="w-full text-sm bg-transparent border-0 border-b-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-colors placeholder-gray-400 px-0 py-2 mb-3"
              placeholder="Enter tags (press Enter)"
              value={props.tagInput || ''}
              onChange={changeTagInput}
              onKeyUp={watchForEnter}
            />
            <div className="flex flex-wrap gap-2">
              {(props.tagList || []).map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {tag}
                  <button type="button" onClick={() => props.onRemoveTag(tag)} className="text-indigo-400 hover:text-indigo-900 focus:outline-none text-lg leading-none">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const Editor = (props) => {
  const { slug } = useParams();
  return <EditorInner {...props} slug={slug} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(Editor);