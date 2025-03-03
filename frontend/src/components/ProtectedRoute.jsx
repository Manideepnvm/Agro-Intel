import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Prevent going back to login page if authenticated
    if (user && token) {
      window.history.pushState(null, '', location.pathname);
    }
  }, [location, user, token]);

  if (!user || !token) {
    // Redirect to login with the attempted path
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute; 