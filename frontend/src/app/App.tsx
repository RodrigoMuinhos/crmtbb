import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from '@/app/routes';
import '@/styles/theme.css';

function App() {
  return <RouterProvider router={router} />;
}

export default App;