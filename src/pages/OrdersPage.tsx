import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { getApiErrorMessage } from '../services/api';
import { getOrders } from '../services/orderService';
import type { OrderSummary } from '../types/api';
import { formatCurrency, formatDateTime, getProtocol } from '../utils/formatters';

function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <article className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">{getProtocol(order.id)}</h2>
          <p className="mt-1 text-xs font-bold text-[#738075]">{formatDateTime(order.createdAtUtc)}</p>
        </div>
        <span className="rounded-lg bg-[#e2f2e8] px-3 py-1.5 text-xs font-black uppercase text-forest">
          {order.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[#ece6db] bg-cream p-3">
          <p className="text-xs font-bold text-[#738075]">Total</p>
          <p className="mt-1 text-base font-black text-ink">{formatCurrency(order.totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-[#ece6db] bg-cream p-3">
          <p className="text-xs font-bold text-[#738075]">Itens</p>
          <p className="mt-1 text-base font-black text-ink">{order.itemsCount}</p>
        </div>
      </div>

      <p className="mt-3 text-sm font-bold text-[#5f6b63]">Criado por {order.createdByUsername}</p>

      <div className="mt-3 border-t border-[#ece6db]">
        {order.items.map((item) => (
          <div
            className="flex items-start justify-between gap-3 border-b border-[#f0ebe2] py-3"
            key={`${order.id}-${item.productId ?? item.productItemCode}-${item.quantity}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold leading-5 text-ink">{item.productDescription}</p>
              <p className="mt-1 text-xs font-bold text-[#738075]">
                Código {item.productItemCode}
                {item.productReference ? ` · Ref. ${item.productReference}` : ''}
              </p>
              <p className="mt-1 text-xs font-extrabold text-clay">
                CFOP {item.cfop || '-'} · NCM {item.ncm || '-'}
              </p>
            </div>
            <div className="min-w-24 text-right">
              <p className="text-sm font-extrabold text-moss">{item.quantity} un.</p>
              <p className="mt-1 text-sm font-black text-forest">{formatCurrency(item.lineTotal)}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage('');

    try {
      setOrders(await getOrders());
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os pedidos.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase text-clay">Histórico</p>
          <h1 className="text-3xl font-black leading-tight text-ink">Pedidos criados</h1>
        </div>
        {/*
        <Button
          className="w-full sm:w-auto"
          icon={<RefreshCw size={17} />}
          isLoading={isRefreshing}
          onClick={() => loadOrders(true)}
          type="button"
          variant="secondary"
        >
          Atualizar
        </Button>*/}
      </div>

      {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="mt-4">
          <EmptyState isLoading={isLoading} message="Nenhum pedido criado ainda." />
        </div>
      ) : null}
    </section>
  );
}
