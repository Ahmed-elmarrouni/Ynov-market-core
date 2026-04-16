import { Profile, mapStateToProps } from './Profile';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
} from '../constants/actionTypes';

const mapDispatchToProps = dispatch => ({
  onLoad: (pager, payload) =>
    dispatch({ type: PROFILE_PAGE_LOADED, pager, payload }),
  onUnload: () => dispatch({ type: PROFILE_PAGE_UNLOADED }),
});

class ProfileFavoritesInner extends Profile {
  componentDidMount() {
    this.props.onLoad(
      page => agent.Articles.favoritedBy(this.props.username, page),
      Promise.all([
        agent.Profile.get(this.props.username),
        agent.Articles.favoritedBy(this.props.username),
      ])
    );
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  renderTabs() {
    return (
      <ul className="nav nav-pills outline-active">
        <li className="nav-item">
          <Link
            className="nav-link"
            to={`/@${this.props.profile.username}`}
          >
            My Articles
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="nav-link active"
            to={`/@${this.props.profile.username}/favorites`}
          >
            Favorited Articles
          </Link>
        </li>
      </ul>
    );
  }
}

function ProfileFavorites(props) {
  const { username } = useParams();
  return <ProfileFavoritesInner {...props} username={username} />;
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileFavorites);
