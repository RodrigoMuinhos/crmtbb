import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router';
import { Home, ShoppingCart, Package, Box, FileText, ShoppingBag, Menu, X, CircleHelp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

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
    { name: 'Visão do Dia', path: '/', icon: Home },
    { name: 'Gastos', path: '/gastos', icon: ShoppingCart },
    { name: 'Compras', path: '/compras', icon: ShoppingBag },
    { name: 'Estoque', path: '/estoque', icon: Box },
    { name: 'Produtos', path: '/produtos', icon: Package },
    { name: 'Relatórios', path: '/relatorios', icon: FileText }
  ];

  const guideTour = [
    {
      title: 'Boas-vindas ao sistema',
      path: '/',
      description: 'Esta é a tela principal para acompanhar o dia da loja. Aqui você vê o resumo rápido do que está acontecendo.',
      actions: ['Confira faturamento, gastos e resultado do dia', 'Use os botões de atalho para cadastrar rápido', 'Volte aqui ao longo do dia para monitorar a operação'],
    },
    {
      title: 'Produtos',
      path: '/produtos',
      description: 'Cadastre, edite e organize os produtos que serão vendidos.',
      actions: ['Adicione nome, preço, categoria e imagem', 'Edite qualquer produto quando necessário', 'Desative ou exclua produtos que saíram de linha'],
    },
    {
      title: 'Compras',
      path: '/compras',
      description: 'Registre compras de insumos e matérias-primas para manter o histórico financeiro e de estoque atualizado.',
      actions: ['Cadastre a compra com data, mercado e itens', 'Edite compras para corrigir lançamentos', 'Exclua compras indevidas ou duplicadas'],
    },
    {
      title: 'Gastos',
      path: '/gastos',
      description: 'Controle os gastos da operação para entender melhor os custos da loja.',
      actions: ['Registre gastos por categoria', 'Edite valores e observações quando precisar', 'Exclua lançamentos incorretos'],
    },
    {
      title: 'Estoque',
      path: '/estoque',
      description: 'Gerencie ingredientes e produtos prontos nas áreas de produção, armazenado e vitrine.',
      actions: ['Ajuste quantidades quando houver perda ou reposição', 'Envie itens para vitrine com solicitações de transferência', 'Exclua itens antigos ou cadastrados por engano'],
    },
    {
      title: 'Relatórios',
      path: '/relatorios',
      description: 'Acompanhe desempenho e resultados para tomar decisões com mais confiança.',
      actions: ['Analise evolução de vendas e gastos', 'Observe tendências do negócio', 'Use os dados para planejar próximos passos'],
    },
  ];

  const currentGuide = guideTour[guideStep];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
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
            <p className="text-xs text-[var(--brand-text-secondary)] mt-0.5">Gestão</p>
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

      <button
        onClick={() => setIsGuideOpen(true)}
        className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-40 rounded-full p-3 md:p-3.5 border border-[var(--brand-primary)]/25 bg-[var(--brand-surface)]/55 backdrop-blur-sm text-[var(--brand-primary)] hover:bg-[var(--brand-surface)]/80 transition-all shadow-sm"
        aria-label="Abrir Guia Tour"
        title="Guia Tour"
      >
        <CircleHelp className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="Guia Tour • Manual do sistema"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setGuideStep(prev => Math.max(prev - 1, 0))}
              disabled={guideStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                navigate(currentGuide.path);
                setIsGuideOpen(false);
              }}
            >
              Ir para esta tela
            </Button>
            <Button
              variant="primary"
              onClick={() => setGuideStep(prev => Math.min(prev + 1, guideTour.length - 1))}
              disabled={guideStep === guideTour.length - 1}
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-[var(--brand-text-secondary)]">
            <span>Etapa {guideStep + 1} de {guideTour.length}</span>
            <span className="inline-flex items-center gap-1 text-[var(--brand-primary)] font-medium">
              <Sparkles className="w-4 h-4" />
              Guia interativo
            </span>
          </div>

          <div className="bg-[var(--brand-bg)] rounded-[var(--radius-card)] p-4">
            <h3 className="text-lg font-semibold text-[var(--brand-text-primary)] mb-2">{currentGuide.title}</h3>
            <p className="text-sm text-[var(--brand-text-secondary)] leading-relaxed mb-3">{currentGuide.description}</p>
            <p className="text-sm font-medium text-[var(--brand-text-primary)] mb-2">Como usar:</p>
            <ul className="space-y-1.5 text-sm text-[var(--brand-text-secondary)]">
              {currentGuide.actions.map((action, index) => (
                <li key={index}>• {action}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs text-[var(--brand-text-secondary)] mb-2">Atalhos do tour:</p>
            <div className="flex flex-wrap gap-2">
              {guideTour.map((item, index) => (
                <button
                  key={item.path}
                  onClick={() => setGuideStep(index)}
                  className={[
                    'px-3 py-1.5 rounded-full text-xs border transition-colors',
                    guideStep === index
                      ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]'
                      : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] border-[var(--brand-text-secondary)]/20 hover:text-[var(--brand-text-primary)]',
                  ].join(' ')}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}