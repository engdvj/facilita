import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Heart, Code, Shield } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-50 mt-auto">
      {/* Main Footer */}
      <div className="backdrop-blur-md bg-white/5 border-t border-white/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">
                FACILITA <span className="text-blue-300">CHVC</span>
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Portal centralizado para acesso rápido e organizado aos recursos e 
                sistemas do Centro Hospitalar Virtual Completo.
              </p>
              <div className="flex items-center space-x-2 text-white/60 text-sm">
                <Heart size={16} className="text-red-400" />
                <span>Desenvolvido com carinho pela equipe CHVC</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Links Rápidos</h4>
              <nav className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Página Inicial
                </Link>
                <Link
                  to="/dashboard"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Dashboard
                </Link>
                <a
                  href="/api/ping"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white text-sm transition-colors flex items-center space-x-1"
                >
                  <span>Status da API</span>
                  <ExternalLink size={12} />
                </a>
              </nav>
            </div>

            {/* System Info */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Sistema</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-white/70">
                  <Code size={16} />
                  <span>React + TypeScript</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70">
                  <Shield size={16} />
                  <span>Seguro e Confiável</span>
                </div>
                <div className="text-white/60">
                  Versão: 2.0.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/20 border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-white/60 text-sm">
              © {currentYear} FACILITA CHVC. Todos os direitos reservados.
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                to="/admin/login"
                className="text-white/60 hover:text-white/80 text-sm transition-colors"
              >
                Área Administrativa
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-white/60 hover:text-white/80 text-sm transition-colors"
              >
                Voltar ao topo ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}