import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  fallback
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full space-y-4">
          <Skeleton height="2rem" />
          <Skeleton height="20rem" />
          <div className="flex gap-2">
            <Skeleton height="2.5rem" width="6rem" />
            <Skeleton height="2.5rem" width="6rem" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !user?.is_admin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Higher-order component for admin routes
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAdmin'>) {
  return (
    <ProtectedRoute requireAdmin {...props}>
      {children}
    </ProtectedRoute>
  );
}