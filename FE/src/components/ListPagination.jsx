import { connect } from 'react-redux';
import agent from '../agent';
import { SET_PAGE } from '../constants/actionTypes';

const mapDispatchToProps = dispatch => ({
  onSetPage: (page, payload) =>
    dispatch({ type: SET_PAGE, page, payload })
});

const ListPagination = props => {
  if (props.articlesCount <= 10) {
    return null;
  }

  const range = [];
  for (let i = 0; i < Math.ceil(props.articlesCount / 10); ++i) {
    range.push(i);
  }

  const setPage = page => {
    if (props.pager) {
      props.onSetPage(page, props.pager(page));
    } else {
      props.onSetPage(page, agent.Articles.all(page))
    }
  };

  return (
    <nav className="flex justify-center w-full">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {range.map(v => {
          const isCurrent = v === props.currentPage;
          const onClick = ev => {
            ev.preventDefault();
            setPage(v);
          };

          return (
            <li key={v.toString()}>
              <button
                onClick={onClick}
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isCurrent
                  ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {v + 1}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default connect(() => ({}), mapDispatchToProps)(ListPagination);