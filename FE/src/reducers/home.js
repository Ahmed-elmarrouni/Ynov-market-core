import { HOME_PAGE_LOADED, HOME_PAGE_UNLOADED } from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    case HOME_PAGE_LOADED:
      return {
        ...state,
        // payload[0] is the tags response; guard against null / missing field
        tags: (action.payload[0] && Array.isArray(action.payload[0].tags))
          ? action.payload[0].tags
          : [],
      };
    case HOME_PAGE_UNLOADED:
      return {};
    default:
      return state;
  }
};
