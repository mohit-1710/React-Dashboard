import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();

  // Enhanced logging for debugging
  console.log('[AdminRoute] Current State:', {
    userId: user?.uid,
    email: user?.email,
    authLoading,
    isAdmin,
    adminLoading,
    pathname: location.pathname,
    timestamp: new Date().toISOString()
  });

  // Show loading state while checking auth or admin status
  if (authLoading || adminLoading) {
    console.log('[AdminRoute] Loading state:', { authLoading, adminLoading });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  // If no user, redirect to auth page
  if (!user) {
    console.log('[AdminRoute] No user found, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If user is not admin, redirect to home
  if (!isAdmin) {
    console.log('[AdminRoute] User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('[AdminRoute] Admin access granted');
  return <>{children}</>;
}
