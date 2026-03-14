import React from 'react';
import { createBrowserRouter } from 'react-router';
import { Root } from '@/app/components/Root';
import DashboardPage from '@/app/pages/Dashboard';
import GastosPage from '@/app/pages/Gastos';
import ComprasPage from '@/app/pages/Compras';
import EstoquePage from '@/app/pages/Estoque';
import ProdutosPage from '@/app/pages/Produtos';
import RelatoriosPage from '@/app/pages/Relatorios';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'gastos',
        element: <GastosPage />
      },
      {
        path: 'compras',
        element: <ComprasPage />
      },
      {
        path: 'estoque',
        element: <EstoquePage />
      },
      {
        path: 'produtos',
        element: <ProdutosPage />
      },
      {
        path: 'relatorios',
        element: <RelatoriosPage />
      }
    ]
  }
]);
