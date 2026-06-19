import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { ImportPage } from '../pages/ImportPage';
import { LoginPage } from '../pages/LoginPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductsPage } from '../pages/ProductsPage';
import { StockPage } from '../pages/StockPage';

function ProtectedRoute() {
  const { isLoading, token } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <EmptyState isLoading message="Carregando" />
      </div>
    );
  }

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <AppShell />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <EmptyState isLoading message="Carregando" />
      </div>
    );
  }

  return token ? <Navigate replace to="/" /> : children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
        path="/login"
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<StockPage />} index />
        <Route element={<ProductsPage />} path="/produtos" />
        <Route element={<OrdersPage />} path="/pedidos" />
        <Route element={<ImportPage />} path="/importar" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
