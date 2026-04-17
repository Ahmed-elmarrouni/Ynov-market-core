import React from 'react';
import { connect } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom';
import agent from '../agent';
import { APP_LOAD, REDIRECT } from '../constants/actionTypes';
import Header from './Header';
import Toast from './Toast';
import Article from './Article';
import Editor from './Editor';
import Home from './Home';
import Login from './Login';
import Profile from './Profile';
import ProfileFavorites from './ProfileFavorites';
import Register from './Register';
import Settings from './Settings';

const mapStateToProps = state => ({
  appLoaded: state.common.appLoaded,
  appName: state.common.appName,
  currentUser: state.common.currentUser,
  redirectTo: state.common.redirectTo,
});

const mapDispatchToProps = dispatch => ({
  onLoad: (payload, token) => // <-- ADD token parameter
    dispatch({ type: APP_LOAD, payload, token, skipTracking: true }),
  onRedirect: () => dispatch({ type: REDIRECT }),
});


// Wrapper to provide useNavigate hook to the class component
function AppWrapper(props) {
  const navigate = useNavigate();
  return <AppInner {...props} navigate={navigate} />;
}

class AppInner extends React.Component {
  componentDidMount() {
    const jwt = window.localStorage.getItem('jwt');
    if (jwt) {
      agent.setToken(jwt); // <-- CRITICAL: Tell superagent to use this token immediately
      this.props.onLoad(agent.Auth.current(), jwt); // <-- CRITICAL: Pass jwt to Redux
    } else {
      this.props.onLoad(Promise.resolve(null), null);
    }
  }


  componentDidUpdate(prevProps) {
    if (prevProps.redirectTo !== this.props.redirectTo && this.props.redirectTo) {
      this.props.navigate(this.props.redirectTo);
      this.props.onRedirect();
    }
  }

  render() {
    if (this.props.appLoaded) {
      return (
        <div>
          <Header
            appName={this.props.appName}
            currentUser={this.props.currentUser}
          />
          <Toast />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/editor/:slug" element={<Editor />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/@:username/favorites" element={<ProfileFavorites />} />
            <Route path="/@:username" element={<Profile />} />
          </Routes>
          <Toast />
        </div>
      );
    }
    return (
      <div>
        <Header
          appName={this.props.appName}
          currentUser={this.props.currentUser}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppWrapper);
