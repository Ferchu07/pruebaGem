import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ErrorPageComponent from '../components/error/ErrorPage';
import { isUser, PrivilegeContext } from '../components/priviledge/PriviledgeProvider';
import { logout } from '../redux/authSlice';
import { KEY } from '../redux/browser-storage';
import { RootState } from '../redux/store';

interface ProtectedRouteProps {
  component: React.ReactNode;
  access: any | undefined;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component, access }) => {

  const dispatch = useDispatch();
  const { isAuthenticated, user, hasToken } = useSelector((state: RootState) => state.auth);
  const { userCan } = useContext(PrivilegeContext);

  const isTokenExpired = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const exp = typeof payload?.exp === 'number' ? payload.exp : undefined;
      if (!exp) return false;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  };

  if (hasToken && user && isUser(user) && isTokenExpired(user.token)) {
    localStorage.removeItem(KEY);
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && !hasToken) {
    return <Navigate to="/grant-access" replace />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (access !== undefined && !userCan(access.action, access.group)) {
    return <ErrorPageComponent />;
  }

  return <>{component}</>;
};

export default ProtectedRoute;
