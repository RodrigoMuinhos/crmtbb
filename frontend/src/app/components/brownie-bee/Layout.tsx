import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router';
import { Home, ShoppingCart, Package, Box, FileText, ShoppingBag, Menu, X, CircleHelp, ChevronLeft, ChevronRight, Sparkles, ArrowLeft, ArrowRight, MousePointer2 } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFocusTour, setIsFocusTour] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

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
      targetSelector: '[data-tour="dashboard-primary-action"], [data-tour="dashboard-empty-products"]',
      buttonLabel: 'Botão principal da tela inicial',
      description: 'Esta é a tela principal para acompanhar o dia da loja. Aqui você vê o resumo rápido do que está acontecendo.',
      actions: ['Confira faturamento, gastos e resultado do dia', 'Use os botões de atalho para cadastrar rápido', 'Volte aqui ao longo do dia para monitorar a operação'],
    },
    {
      title: 'Produtos',
      path: '/produtos',
      targetSelector: '[data-tour="produtos-primary-action"]',
      buttonLabel: 'Botão “Novo Produto”',
      description: 'Cadastre, edite e organize os produtos que serão vendidos.',
      actions: ['Adicione nome, preço, categoria e imagem', 'Edite qualquer produto quando necessário', 'Desative ou exclua produtos que saíram de linha'],
    },
    {
      title: 'Compras',
      path: '/compras',
      targetSelector: '[data-tour="compras-primary-action"]',
      buttonLabel: 'Botão “Nova Compra”',
      description: 'Registre compras de insumos e matérias-primas para manter o histórico financeiro e de estoque atualizado.',
      actions: ['Cadastre a compra com data, mercado e itens', 'Edite compras para corrigir lançamentos', 'Exclua compras indevidas ou duplicadas'],
    },
    {
      title: 'Gastos',
      path: '/gastos',
      targetSelector: '[data-tour="gastos-primary-action"]',
      buttonLabel: 'Botão “Novo Gasto”',
      description: 'Controle os gastos da operação para entender melhor os custos da loja.',
      actions: ['Registre gastos por categoria', 'Edite valores e observações quando precisar', 'Exclua lançamentos incorretos'],
    },
    {
      title: 'Estoque',
      path: '/estoque',
      targetSelector: '[data-tour="estoque-primary-action"]',
      buttonLabel: 'Botão “Adicionar Item”',
      description: 'Gerencie ingredientes e produtos prontos nas áreas de produção, armazenado e vitrine.',
      actions: ['Ajuste quantidades quando houver perda ou reposição', 'Envie itens para vitrine com solicitações de transferência', 'Exclua itens antigos ou cadastrados por engano'],
    },
    {
      title: 'Relatórios',
      path: '/relatorios',
      targetSelector: '[data-tour="relatorios-primary-action"]',
      buttonLabel: 'Botão “Exportar PDF”',
      description: 'Acompanhe desempenho e resultados para tomar decisões com mais confiança.',
      actions: ['Analise evolução de vendas e gastos', 'Observe tendências do negócio', 'Use os dados para planejar próximos passos'],
    },
  ];

  const currentGuide = guideTour[guideStep];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    if (!isGuideOpen && !isFocusTour) {
      setHighlightRect(null);
      return;
    }

    if (location.pathname !== currentGuide.path) {
      navigate(currentGuide.path);
      return;
    }

    const updateHighlight = () => {
      const target = document.querySelector(currentGuide.targetSelector) as HTMLElement | null;
      if (!target) {
        setHighlightRect(null);
        return;
      }

      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      const rect = target.getBoundingClientRect();
      setHighlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    const timer = window.setTimeout(updateHighlight, 180);
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [isGuideOpen, isFocusTour, guideStep, currentGuide.path, currentGuide.targetSelector, location.pathname, navigate]);

  const goToCurrentGuide = () => {
    navigate(currentGuide.path);
  };

  const closeGuideAll = () => {
    setIsGuideOpen(false);
    setIsFocusTour(false);
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
                data-tour={
                  item.path === '/'
                    ? 'nav-home'
                    : item.path === '/produtos'
                    ? 'nav-produtos'
                    : item.path === '/compras'
                    ? 'nav-compras'
                    : item.path === '/gastos'
                    ? 'nav-gastos'
                    : item.path === '/estoque'
                    ? 'nav-estoque'
                    : 'nav-relatorios'
                }
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

      {(isGuideOpen || isFocusTour) && highlightRect && (
        <div className="fixed inset-0 pointer-events-none z-[55]">
          <div
            className="absolute rounded-xl border-2 border-[var(--brand-primary)] shadow-[0_0_0_9999px_rgba(0,0,0,0.08)]"
            style={{
              top: `${highlightRect.top - 6}px`,
              left: `${highlightRect.left - 6}px`,
              width: `${highlightRect.width + 12}px`,
              height: `${highlightRect.height + 12}px`,
            }}
          />

          <div
            className="absolute flex items-center gap-2 text-[var(--brand-primary)] bg-[var(--brand-surface)]/90 px-2 py-1 rounded-lg border border-[var(--brand-primary)]/30"
            style={{
              top: `${Math.max(12, highlightRect.top - 36)}px`,
              left: `${highlightRect.left}px`,
            }}
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Elemento destacado do tour</span>
          </div>

          <div
            className="absolute text-[var(--brand-primary)]"
            style={{
              top: `${highlightRect.top + highlightRect.height / 2 - 12}px`,
              left: `${Math.max(8, highlightRect.left - 30)}px`,
            }}
          >
            <ArrowRight className="w-6 h-6" />
          </div>
          <div
            className="absolute text-[var(--brand-primary)]"
            style={{
              top: `${highlightRect.top + highlightRect.height / 2 - 12}px`,
              left: `${highlightRect.left + highlightRect.width + 8}px`,
            }}
          >
            <ArrowLeft className="w-6 h-6" />
          </div>
        </div>
      )}

      {isFocusTour && highlightRect && (
        <>
          <div className="fixed inset-0 z-[54] bg-black/20 backdrop-blur-[0.5px]" />
          <div
            className="fixed z-[56] rounded-xl border-2 border-[var(--brand-primary)] shadow-[0_0_0_9999px_rgba(0,0,0,0.18)] pointer-events-none"
            style={{
              top: `${highlightRect.top - 6}px`,
              left: `${highlightRect.left - 6}px`,
              width: `${highlightRect.width + 12}px`,
              height: `${highlightRect.height + 12}px`,
            }}
          />

          <div className="fixed z-[57] right-4 bottom-4 md:right-7 md:bottom-7 w-[min(92vw,420px)] bg-[var(--brand-surface)] rounded-2xl border border-[var(--brand-primary)]/25 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[var(--brand-text-primary)]">Modo Foco • Tour guiado</p>
              <button onClick={closeGuideAll} className="text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--brand-text-secondary)] mb-2">Etapa {guideStep + 1} de {guideTour.length}</p>
            <h3 className="text-base font-semibold text-[var(--brand-text-primary)] mb-1">{currentGuide.title}</h3>
            <p className="text-sm text-[var(--brand-text-secondary)] mb-3">{currentGuide.description}</p>

            <div className="bg-[var(--brand-bg)] rounded-xl p-3 mb-3">
              <p className="text-xs font-medium text-[var(--brand-text-primary)] mb-1">Botão em foco</p>
              <p className="text-xs text-[var(--brand-text-secondary)] mb-2">{currentGuide.buttonLabel}</p>
              <p className="text-xs font-medium text-[var(--brand-text-primary)] mb-1">O que fazer aqui agora</p>
              <p className="text-xs text-[var(--brand-text-secondary)]">Esse botão é o atalho principal desta tela. Use-o para iniciar a ação mais importante do módulo e depois siga os passos do guia para praticar no fluxo real.</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setGuideStep(prev => Math.max(prev - 1, 0))} disabled={guideStep === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button variant="secondary" size="sm" onClick={goToCurrentGuide}>Ir para esta tela</Button>
              <Button variant="primary" size="sm" onClick={() => setGuideStep(prev => Math.min(prev + 1, guideTour.length - 1))} disabled={guideStep === guideTour.length - 1}>
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={isGuideOpen}
        onClose={closeGuideAll}
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
                goToCurrentGuide();
                setIsGuideOpen(false);
              }}
            >
              Ir para esta tela
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsGuideOpen(false);
                setIsFocusTour(true);
              }}
            >
              Modo foco
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
            <p className="text-xs text-[var(--brand-primary)] mb-3">↳ O item correspondente está destacado na interface com setas.</p>
            <div className="bg-[var(--brand-surface)] rounded-xl border border-[var(--brand-text-secondary)]/10 p-3 mb-3">
              <p className="text-xs font-medium text-[var(--brand-text-primary)] mb-1">Botão em foco</p>
              <p className="text-xs text-[var(--brand-text-secondary)]">{currentGuide.buttonLabel} — este é o comando principal desta tela para começar a ação mais importante do módulo.</p>
            </div>
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