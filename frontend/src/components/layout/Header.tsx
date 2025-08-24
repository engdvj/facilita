import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isAdminArea = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    <header className="relative z-50">
      {/* Glassmorphism header */}
      <div className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <Link 
              to="/"
              className="flex items-center space-x-3 text-white hover:text-white/90 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Home size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold">
                FACILITA <span className="text-blue-300">CHVC</span>
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {!isAdminArea && (
                <Link
                  to="/"
                  className={`
                    text-white/80 hover:text-white transition-colors
                    ${isHomePage ? 'text-white font-medium' : ''}
                  `}
                >
                  Início
                </Link>
              )}

              {isAuthenticated && !isAdminArea && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/user/links"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Meus Links
                  </Link>
                </>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="
                  p-2 rounded-lg
                  text-white/60 hover:text-white
                  hover:bg-white/10
                  transition-all duration-200
                "
                aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* User Menu */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-white/90 font-medium">
                      {user?.name || user?.username}
                    </span>
                  </div>

                  {/* Admin Link */}
                  {user?.is_admin && !isAdminArea && (
                    <Link to="/admin">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Settings size={16} />}
                      >
                        Admin
                      </Button>
                    </Link>
                  )}

                  {/* Logout */}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<LogOut size={16} />}
                    onClick={logout}
                  >
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<User size={16} />}
                  >
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Bar */}
      {isAdminArea && isAuthenticated && user?.is_admin && (
        <div className="bg-white/5 border-b border-white/10">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-6 h-12 overflow-x-auto">
              <Link
                to="/admin"
                className={`
                  whitespace-nowrap py-2 text-sm font-medium transition-colors
                  ${location.pathname === '/admin' ? 'text-white border-b-2 border-blue-400' : 'text-white/70 hover:text-white'}
                `}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/links"
                className={`
                  whitespace-nowrap py-2 text-sm font-medium transition-colors
                  ${location.pathname.startsWith('/admin/links') ? 'text-white border-b-2 border-blue-400' : 'text-white/70 hover:text-white'}
                `}
              >
                Links
              </Link>
              <Link
                to="/admin/categories"
                className={`
                  whitespace-nowrap py-2 text-sm font-medium transition-colors
                  ${location.pathname.startsWith('/admin/categories') ? 'text-white border-b-2 border-blue-400' : 'text-white/70 hover:text-white'}
                `}
              >
                Categorias
              </Link>
              <Link
                to="/admin/colors"
                className={`
                  whitespace-nowrap py-2 text-sm font-medium transition-colors
                  ${location.pathname.startsWith('/admin/colors') ? 'text-white border-b-2 border-blue-400' : 'text-white/70 hover:text-white'}
                `}
              >
                Cores
              </Link>
              <Link
                to="/admin/users"
                className={`
                  whitespace-nowrap py-2 text-sm font-medium transition-colors
                  ${location.pathname.startsWith('/admin/users') ? 'text-white border-b-2 border-blue-400' : 'text-white/70 hover:text-white'}
                `}
              >
                Usuários
              </Link>
              <Link
                to="/admin/files"
                className={`
                  whitespace-nowrap py-2 text-sm font-medium transition-colors
                  ${location.pathname.startsWith('/admin/files') ? 'text-white border-b-2 border-blue-400' : 'text-white/70 hover:text-white'}
                `}
              >
                Arquivos
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}