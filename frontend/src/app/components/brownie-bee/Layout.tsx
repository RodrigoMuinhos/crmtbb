import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router';
import { Home, ShoppingCart, Package, Box, FileText, ShoppingBag, RotateCcw, Menu, X } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clearAllData } = useApp();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const navigation = [
    { name: 'Vis\u00e3o do Dia', path: '/', icon: Home },
    { name: 'Gastos', path: '/gastos', icon: ShoppingCart },
    { name: 'Compras', path: '/compras', icon: ShoppingBag },
    { name: 'Estoque', path: '/estoque', icon: Box },
    { name: 'Produtos', path: '/produtos', icon: Package },
    { name: 'Relat\u00f3rios', path: '/relatorios', icon: FileText }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleReset = () => {
    if (confirm('Deseja limpar todos os dados do sistema? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.')) {
      clearAllData();
    }
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex min-h-screen bg-[var(--brand-bg)]">

      {/* ===== OVERLAY (mobile only) ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[var(--brand-surface)]',
          'border-r border-[var(--brand-text-secondary)]/10',
          'transition-transform duration-300 ease-in-out will-change-transform',
          // Desktop: always visible
          'md:static md:translate-x-0',
          // Mobile: slide in/out
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
        }}
      >
        {/* Logo + close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--brand-text-secondary)]/10">
          <div>
            <p className="text-lg font-semibold leading-tight" style={{ color: 'var(--brand-primary)' }}>
              The Brownie Bee
            </p>
            <p className="text-xs text-[var(--brand-text-secondary)] mt-0.5">Gest\u00e3o</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 -mr-1 rounded-xl text-[var(--brand-text-secondary)] active:bg-[var(--brand-bg)] transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date */}
        <div className="px-5 py-3 border-b border-[var(--brand-text-secondary)]/10">
          <p className="text-xs text-[var(--brand-text-secondary)] capitalize">{today}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)]',
                  'text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'text-[var(--brand-text-secondary)] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-text-primary)] active:bg-[var(--brand-bg)]',
                ].join(' ')}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom action */}
        <div className="px-3 py-4 border-t border-[var(--brand-text-secondary)]/10">
          <button
            onClick={handleReset}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--radius-button)] text-sm text-[var(--brand-text-secondary)] hover:bg-[var(--brand-bg)] hover:text-[var(--status-critical)] active:bg-[var(--brand-bg)] transition-colors"
          >
            <RotateCcw className="w-4 h-4 flex-shrink-0" />
            Limpar dados
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile top bar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 bg-[var(--brand-surface)] border-b border-[var(--brand-text-secondary)]/10 px-4 md:hidden"
          style={{
            paddingTop: 'max(12px, env(safe-area-inset-top))',
            paddingBottom: '12px',
            paddingRight: 'max(16px, env(safe-area-inset-right))',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-[var(--brand-text-secondary)] active:bg-[var(--brand-bg)] transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <p className="text-base font-semibold" style={{ color: 'var(--brand-primary)' }}>
            The Brownie Bee
          </p>
        </header>

        {/* Content */}
        <main
          className="flex-1 px-4 py-6"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-3xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}