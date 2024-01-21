import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthenticatedRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};
export default AuthenticatedRoute;
