import React, { lazy, Suspense } from 'react';
import { Skeleton, SkeletonCard } from '../ui';

// Lazy load pages and components
export const AdminLinks = lazy(() => import('../../pages/AdminLinks'));
export const UserLinks = lazy(() => import('../../pages/UserLinks'));
export const AdminDashboard = lazy(() => import('../../pages/AdminDashboard'));
export const HomePage = lazy(() => import('../../pages/HomePage'));
export const LoginPage = lazy(() => import('../../pages/Login'));
export const RegisterPage = lazy(() => import('../../pages/Register'));

// Loading fallback components
export const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="container mx-auto p-4">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton height="2rem" width="200px" className="mb-2" />
        <Skeleton height="1rem" width="300px" />
      </div>
      
      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="max-w-md mx-auto p-6">
    <Skeleton height="2rem" className="mb-6" />
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index}>
          <Skeleton height="1rem" width="100px" className="mb-2" />
          <Skeleton height="2.5rem" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton height="2.5rem" width="6rem" />
        <Skeleton height="2.5rem" width="6rem" />
      </div>
    </div>
  </div>
);

// HOC for lazy loading with fallback
export function withLazyLoading<T extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<T>>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: T) {
    return (
      <Suspense fallback={fallback || <PageSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Pre-wrapped components with loading states
export const LazyAdminLinks = withLazyLoading(AdminLinks);
export const LazyUserLinks = withLazyLoading(UserLinks);
export const LazyAdminDashboard = withLazyLoading(AdminDashboard);
export const LazyHomePage = withLazyLoading(HomePage);
export const LazyLoginPage = withLazyLoading(LoginPage, <FormSkeleton />);
export const LazyRegisterPage = withLazyLoading(RegisterPage, <FormSkeleton />);