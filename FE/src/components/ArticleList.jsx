import ArticlePreview from './ArticlePreview';
import ListPagination from './ListPagination';
import { Newspaper, UserPlus } from 'lucide-react';

const ArticleList = props => {
  if (!props.articles) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-2 w-16 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-100 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (props.articles.length === 0) {
    return (
      <div className="flex  flex-col items-center justify-center py-20 px-4 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm text-center">
        <div className="bg-indigo-50 p-4 rounded-full mb-4 text-indigo-500">
          <Newspaper size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">
          There are no articles here yet. Follow other authors to populate your feed, or explore the global timeline!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-0">
        {props.articles.map(article => (
          <ArticlePreview article={article} key={article.slug} />
        ))}
      </div>

      <div className="pt-6 pb-12">
        <ListPagination
          pager={props.pager}
          articlesCount={props.articlesCount}
          currentPage={props.currentPage}
        />
      </div>
    </div>
  );
};

export default ArticleList;