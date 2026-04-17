import Profile from './Profile';

export default function ProfileFavorites() {
  // The modern Profile component automatically detects the '/favorites' URL 
  // via useLocation() and fetches the correct articles natively!
  return <Profile />;
}