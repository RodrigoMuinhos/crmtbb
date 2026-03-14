import React from 'react';
import { AppProvider } from '@/app/context/AppContext';
import { Layout } from '@/app/components/brownie-bee/Layout';

export function Root() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}