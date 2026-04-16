import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import ForgotPassword from '../pages/auth/ForgotPassword';
import GrantAccess from "../pages/auth/GrantAccess";
import Login from '../pages/auth/Login';
import Page404 from '../pages/auth/Page404';
import ResetPassword from '../pages/auth/ResetPassword';
import { RootState } from "../redux/store";
import ProtectedRoute from './ProtectedRoute';
import { menuRoutes } from './menu';
import contents from './routes';
import InitialPassword from "../pages/auth/InitialPassword";

const AppRouter = () => {

  const user = useSelector((state: RootState) => state.auth);

  const renderRoute = (page: any, index: number, access: boolean = true) => {
    const { sub, access: pageAccess, element: pageElement, ...routeProps } = page;
    const element = <ProtectedRoute component={pageElement} access={access && pageAccess} />;
    return (
      <Route key={index} {...routeProps} element={element}>
        {sub?.map((subPage: any, subIndex: number) => renderRoute(subPage, subIndex))}
      </Route>
    );
  };

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {contents.map((page, index) => renderRoute(page, index))}
      </Route>

      <Route path={menuRoutes.auth.login} element={<Login />} />
      <Route path={menuRoutes.auth.initialPassword} element={<InitialPassword />} />
      <Route path={menuRoutes.auth.grant_access} element={<GrantAccess />} />
      <Route path={menuRoutes.auth.forgot_password} element={<ForgotPassword />} />
      <Route path={menuRoutes.auth.reset_password} element={<ResetPassword />} />
      {(user.isAuthenticated && !user.hasToken) && <Route path={"/"} element={<Navigate to={menuRoutes.auth.grant_access} replace />} />}
      {(user.isAuthenticated && user.hasToken) && <Route path="/" element={<Navigate to={menuRoutes.dashboard.path} replace />} />}
      {!user.isAuthenticated && <Route path="*" element={<Navigate to={menuRoutes.auth.login} replace />} />}
      {user.isAuthenticated && <Route path="*" element={<Page404 />} />}
    </Routes>
  );
};

export default AppRouter;
