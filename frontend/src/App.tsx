import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import { ErrorBoundary } from './components/common';
import { ProtectedRoute, AdminRoute } from './components/auth';
import { UnauthorizedPage } from './components/pages';

// Lazy loaded pages
import { 
  LazyAdminLinks,
  LazyUserLinks, 
  LazyAdminDashboard,
  LazyHomePage,
  LazyLoginPage,
  LazyRegisterPage
} from './components/lazy/LazyComponents';

// Regular imports for critical pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Admin from './pages/Admin';
import AdminCategories from './pages/AdminCategories';
import AdminColors from './pages/AdminColors';
import AdminUsers from './pages/AdminUsers';
import AdminDashboard from './pages/AdminDashboard';
import AdminFiles from './pages/AdminFiles';
import UserLinkCreate from './pages/UserLinkCreate';

export default function App() {
  return (
    <ErrorBoundary level="app">
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <AppProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LazyLoginPage />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                
                {/* Protected user routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <LazyUserLinks />
                  </ProtectedRoute>
                } />
                
                <Route path="/change-password" element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                } />
                
                <Route path="/user/links" element={
                  <ProtectedRoute>
                    <LazyUserLinks />
                  </ProtectedRoute>
                } />
                
                <Route path="/user/links/new" element={
                  <ProtectedRoute>
                    <UserLinkCreate />
                  </ProtectedRoute>
                } />
                
                <Route path="/user/links/edit/:id" element={
                  <ProtectedRoute>
                    <UserLinkCreate />
                  </ProtectedRoute>
                } />
                
                {/* Protected admin routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  
                  <Route path="links" element={<LazyAdminLinks />}>
                    <Route path=":id" element={<LazyAdminLinks />} />
                  </Route>
                  
                  <Route path="files" element={<AdminFiles />}>
                    <Route path=":id" element={<AdminFiles />} />
                  </Route>
                  
                  <Route path="categories" element={<AdminCategories />}>
                    <Route path=":id" element={<AdminCategories />} />
                  </Route>
                  
                  <Route path="colors" element={<AdminColors />} />
                  
                  <Route path="users" element={<AdminUsers />}>
                    <Route path=":id" element={<AdminUsers />} />
                  </Route>
                </Route>
              </Routes>
              
              <Toaster 
                position="bottom-center"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)'
                  }
                }}
              />
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
