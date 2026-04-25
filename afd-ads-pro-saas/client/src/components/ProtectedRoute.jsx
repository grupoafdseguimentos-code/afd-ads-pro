import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center font-black">Carregando A.F.D Ads Pro...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
