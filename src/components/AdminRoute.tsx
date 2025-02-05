import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const location = useLocation();

  console.log('AdminRoute - Current user:', user?.uid);
  console.log('AdminRoute - isAdmin:', isAdmin);
  console.log('AdminRoute - loading:', loading);
  console.log('AdminRoute - current location:', location.pathname);

  if (!user) {
    console.log('AdminRoute - No user, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (loading) {
    console.log('AdminRoute - Loading admin status...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    console.log('AdminRoute - User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute - Rendering admin content');
  return <>{children}</>;
}
