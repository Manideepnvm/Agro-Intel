import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Replace with your auth check

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute; 