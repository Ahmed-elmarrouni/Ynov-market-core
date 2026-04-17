import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { HIDE_TOAST } from '../middleware';

const mapStateToProps = state => ({
  ...state.toast
});

const mapDispatchToProps = dispatch => ({
  hideToast: () => dispatch({ type: HIDE_TOAST })
});

const Toast = ({ visible, message, kind, hideToast }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => hideToast(), 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, hideToast]);

  if (!visible) return null;

  const bgColor = kind === 'error' ? '#ef4444' : '#4f46e5';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: bgColor,
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      animation: 'slideUp 0.3s ease-out'
    }}>
      {message}
      <button onClick={hideToast} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '16px', fontSize: '20px' }}>&times;</button>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Toast);