import { SHOW_TOAST, HIDE_TOAST } from '../middleware';

const defaultState = {
  visible: false,
  message: '',
  kind: 'success'
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case SHOW_TOAST:
      return { visible: true, message: action.payload.message, kind: action.payload.kind };
    case HIDE_TOAST:
      return { ...state, visible: false };
    default:
      return state;
  }
};