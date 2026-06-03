import { Edit3, FileText, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { IconButton } from '../components/ui/IconButton';
import { getApiErrorMessage } from '../services/api';
import { deleteOrders, getOrders } from '../services/orderService';
import type { OrderSummary } from '../types/api';
import { formatCurrency, formatDateTime, getProtocol } from '../utils/formatters';
import { createOrderEditDraft, writeOrderEditDraft } from '../utils/orderEditDraft';
import { normalizeSearch } from '../utils/stock';

type PendingAction = 'pdf' | 'delete';

function parseOrderNumbers(value: string) {
  return value.match(/\d+/g)?.map((number) => Number(number)).filter((number) => Number.isFinite(number)) ?? [];
}

function isOrderInDateRange(order: OrderSummary, startDate: string, endDate: string) {
  const createdAt = new Date(order.createdAtUtc).getTime();

  if (Number.isNaN(createdAt)) {
    return false;
  }

  const startsAt = startDate ? new Date(`${startDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
  const endsAt = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;

  return createdAt >= startsAt && createdAt <= endsAt;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function openOrdersPdf(orders: OrderSummary[]) {
  const printWindow = window.open('', '_blank', 'width=980,height=720');

  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão.');
  }

  const body = orders
    .map(
      (order) => `
        <article class="order">
          <div class="header">
            <div>
              <h2>${escapeHtml(getProtocol(order.id))}</h2>
              <p>${escapeHtml(formatDateTime(order.createdAtUtc))}</p>
            </div>
            <strong>${escapeHtml(order.status)}</strong>
          </div>
          <div class="meta">
            <span>Total: <b>${escapeHtml(formatCurrency(order.totalAmount))}</b></span>
            <span>Itens: <b>${order.itemsCount}</b></span>
            ${order.customerName ? `<span>Cliente: <b>${escapeHtml(order.customerName)}</b></span>` : ''}
            <span>Criado por: <b>${escapeHtml(order.createdByUsername)}</b></span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Código</th>
                <th>Qtd.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                    <tr>
                      <td>${escapeHtml(item.productDescription)}</td>
                      <td>${escapeHtml(item.productItemCode)}</td>
                      <td>${item.quantity}</td>
                      <td>${escapeHtml(formatCurrency(item.lineTotal))}</td>
                    </tr>
                  `,
                )
                .join('')}
            </tbody>
          </table>
        </article>
      `,
    )
    .join('');

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Pedidos selecionados</title>
        <style>
          body { color: #17231c; font-family: Arial, sans-serif; margin: 24px; }
          h1 { font-size: 22px; margin: 0 0 20px; }
          .order { break-inside: avoid; border: 1px solid #dfd8ca; border-radius: 8px; margin-bottom: 18px; padding: 16px; }
          .header { align-items: flex-start; display: flex; gap: 16px; justify-content: space-between; }
          h2 { font-size: 18px; margin: 0; }
          p { color: #5f6b63; font-size: 12px; font-weight: 700; margin: 4px 0 0; }
          strong { background: #e2f2e8; border-radius: 8px; color: #17603b; font-size: 12px; padding: 6px 10px; }
          .meta { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 16px 0; }
          .meta span { border: 1px solid #ece6db; border-radius: 8px; padding: 10px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border-bottom: 1px solid #ece6db; font-size: 12px; padding: 9px 8px; text-align: left; }
          th { color: #355243; font-size: 11px; text-transform: uppercase; }
          @media print { body { margin: 0; } .order { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <h1>Pedidos selecionados</h1>
        ${body}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function OrderCard({ order, onEdit }: { order: OrderSummary; onEdit: (order: OrderSummary) => void }) {
  return (
    <article className="rounded-lg border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-ink">{getProtocol(order.id)}</h2>
          <p className="mt-1 text-xs font-bold text-[#738075]">{formatDateTime(order.createdAtUtc)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-lg bg-[#e2f2e8] px-3 py-1.5 text-xs font-black uppercase text-forest">
            {order.status}
          </span>
          <IconButton
            className="!h-9 !w-9"
            icon={<Edit3 size={16} />}
            label={`Editar ${getProtocol(order.id)}`}
            onClick={() => onEdit(order)}
            tone="light"
          />
        </div>
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

      {order.customerName ? (
        <p className="mt-3 text-m font-black text-ink">Cliente: {order.customerName}</p>
      ) : null}
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
                {item.productReference ? ` - Ref. ${item.productReference}` : ''}
              </p>
              <p className="mt-1 text-xs font-extrabold text-clay">
                CFOP {item.cfop || '-'} - NCM {item.ncm || '-'}
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
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderNumberSearch, setOrderNumberSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage('');
    setMessage('');

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

  const hasActiveSearch = Boolean(customerSearch.trim() || orderNumberSearch.trim() || startDate || endDate);

  const filteredOrders = useMemo(() => {
    if (!hasActiveSearch) {
      return orders;
    }

    const customerTerm = normalizeSearch(customerSearch);
    const orderNumbers = parseOrderNumbers(orderNumberSearch);
    const hasDateSearch = Boolean(startDate || endDate);

    return orders.filter((order) => {
      const matchesCustomer = customerTerm
        ? normalizeSearch(order.customerName ?? '').includes(customerTerm)
        : false;
      const matchesNumber =
        orderNumbers.length > 0 ? orderNumbers.some((orderNumber) => orderNumber === order.id) : false;
      const matchesDate = hasDateSearch ? isOrderInDateRange(order, startDate, endDate) : false;

      return matchesCustomer || matchesNumber || matchesDate;
    });
  }, [customerSearch, endDate, hasActiveSearch, orderNumberSearch, orders, startDate]);

  const selectedOrders = hasActiveSearch ? filteredOrders : [];

  function clearSearch() {
    setCustomerSearch('');
    setOrderNumberSearch('');
    setStartDate('');
    setEndDate('');
    setMessage('');
  }

  function handleEditOrder(order: OrderSummary) {
    const draft = createOrderEditDraft(order);
    writeOrderEditDraft(draft);
    navigate('/', { state: { orderEditDraft: draft } });
  }

  async function handleDeleteSelectedOrders() {
    setIsDeleting(true);
    setErrorMessage('');
    setMessage('');

    try {
      const orderIds = selectedOrders.map((order) => order.id);
      await deleteOrders({ orderIds });
      setOrders((currentOrders) => currentOrders.filter((order) => !orderIds.includes(order.id)));
      setMessage(`${orderIds.length} pedido(s) excluído(s).`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível excluir os pedidos selecionados.'));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleConfirmAction() {
    if (!pendingAction || selectedOrders.length === 0) {
      setPendingAction(null);
      return;
    }

    try {
      if (pendingAction === 'pdf') {
        openOrdersPdf(selectedOrders);
        setMessage(`${selectedOrders.length} pedido(s) enviados para PDF.`);
      } else {
        await handleDeleteSelectedOrders();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível concluir a ação.');
    } finally {
      setPendingAction(null);
    }
  }

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

      <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-black text-ink">Pesquisar pedidos</h2>
          <p className="text-sm font-bold text-[#5f6b63]">
            {hasActiveSearch
              ? `${selectedOrders.length} pedido(s) selecionado(s)`
              : 'Use os filtros para selecionar pedidos'}
          </p>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <FormField
            autoComplete="off"
            icon={<Search size={18} />}
            label="Nome do cliente"
            onChange={(event) => setCustomerSearch(event.target.value)}
            placeholder="Nome do cliente..."
            value={customerSearch}
          />
          <FormField
            autoComplete="off"
            label="Número do pedido"
            onChange={(event) => setOrderNumberSearch(event.target.value)}
            placeholder="12 + 25"
            value={orderNumberSearch}
          />
          <FormField
            label="Data inicial"
            onChange={(event) => setStartDate(event.target.value)}
            type="date"
            value={startDate}
          />
          <FormField
            label="Data final"
            onChange={(event) => setEndDate(event.target.value)}
            type="date"
            value={endDate}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            className="w-full sm:w-auto"
            disabled={selectedOrders.length === 0}
            icon={<FileText size={17} />}
            onClick={() => setPendingAction('pdf')}
            type="button"
            variant="secondary"
          >
            Gerar PDF
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={selectedOrders.length === 0 || isDeleting}
            icon={<Trash2 size={17} />}
            isLoading={isDeleting}
            onClick={() => setPendingAction('delete')}
            type="button"
            variant="danger"
          >
            Excluir
          </Button>
          {hasActiveSearch ? (
            <Button className="col-span-2 w-full sm:w-auto" onClick={clearSearch} type="button" variant="ghost">
              Limpar busca
            </Button>
          ) : null}
        </div>
      </div>

      {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}
      {message ? <Alert>{message}</Alert> : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} onEdit={handleEditOrder} order={order} />
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            isLoading={isLoading}
            message={hasActiveSearch ? 'Nenhum pedido encontrado.' : 'Nenhum pedido criado ainda.'}
          />
        </div>
      ) : null}

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-4 shadow-soft">
            <h2 className="text-lg font-black text-ink">Confirmar ação</h2>
            <p className="mt-2 text-sm font-bold leading-5 text-[#5f6b63]">
              Você tem certeza que quer {pendingAction === 'pdf' ? 'gerar PDF' : 'excluir'}?
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button isLoading={pendingAction === 'delete' && isDeleting} onClick={handleConfirmAction} type="button">
                Sim
              </Button>
              <Button onClick={() => setPendingAction(null)} type="button" variant="secondary">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
