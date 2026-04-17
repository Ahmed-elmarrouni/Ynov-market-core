// export default Tags;
import React from 'react';
import agent from '../../agent';

const Tags = ({ tags, onClickTag }) => {
  // Safe Loading State (Fixes the "don't return tags" error)
  if (!tags) {
    return (
      <div className="flex flex-wrap gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 animate-pulse rounded-full"></div>
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return <p className="text-sm text-gray-500 italic">No trending tags available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => {
        const handleClick = ev => {
          ev.preventDefault();
          onClickTag(tag, page => agent.Articles.byTag(tag, page), agent.Articles.byTag(tag));
        };

        return (
          <button
            key={tag}
            onClick={handleClick}
            className="px-3 py-1.5 bg-gray-100/80 text-gray-600 text-sm font-medium rounded-full border border-gray-200/60 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none"
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default Tags;