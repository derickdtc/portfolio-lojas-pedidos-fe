import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';

const ImportPage = lazy(() => import('../pages/ImportPage').then(({ ImportPage }) => ({ default: ImportPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then(({ LoginPage }) => ({ default: LoginPage })));
const OrdersPage = lazy(() => import('../pages/OrdersPage').then(({ OrdersPage }) => ({ default: OrdersPage })));
const ProductsPage = lazy(() => import('../pages/ProductsPage').then(({ ProductsPage }) => ({ default: ProductsPage })));
const StockPage = lazy(() => import('../pages/StockPage').then(({ StockPage }) => ({ default: StockPage })));

function RouteLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <EmptyState isLoading message="Carregando" />
    </div>
  );
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoadingState />}>{children}</Suspense>;
}

function ProtectedRoute() {
  const { isLoading, token } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <RouteLoadingState />;
  }

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <AppShell />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return <RouteLoadingState />;
  }

  return token ? <Navigate replace to="/" /> : children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        element={
          <PublicRoute>
            <LazyPage>
              <LoginPage />
            </LazyPage>
          </PublicRoute>
        }
        path="/login"
      />
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <LazyPage>
              <StockPage />
            </LazyPage>
          }
          index
        />
        <Route
          element={
            <LazyPage>
              <ProductsPage />
            </LazyPage>
          }
          path="/produtos"
        />
        <Route
          element={
            <LazyPage>
              <OrdersPage />
            </LazyPage>
          }
          path="/pedidos"
        />
        <Route
          element={
            <LazyPage>
              <ImportPage />
            </LazyPage>
          }
          path="/importar"
        />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
