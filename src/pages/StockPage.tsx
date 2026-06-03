import { Minus, Plus, RefreshCw, Save, Search, Send, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { IconButton } from '../components/ui/IconButton';
import { FormField } from '../components/ui/FormField';
import { getApiErrorMessage } from '../services/api';
import { createOrder, updateOrder } from '../services/orderService';
import { getProducts } from '../services/productService';
import type { StockProduct } from '../types/api';
import { formatCurrency } from '../utils/formatters';
import {
  clearOrderEditDraft,
  readOrderEditDraft,
  type OrderEditDraft
} from '../utils/orderEditDraft';
import { clampQuantity, getStockTone, normalizeSearch } from '../utils/stock';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

type SelectedItem = {
  product: StockProduct;
  quantity: number;
  lineTotal: number;
};

type StockPageLocationState = {
  orderEditDraft?: OrderEditDraft;
};

const stockToneClasses = {
  high: 'bg-[#e2f2e8]',
  medium: 'bg-[#fff0c7]',
  low: 'bg-[#ffe0dc]'
};

function ProductCard({
  onChangeQuantity,
  product,
  selectedQuantity
}: {
  product: StockProduct;
  selectedQuantity: number;
  onChangeQuantity: (quantity: number) => void;
}) {
  const stockTone = getStockTone(product.stockBalance);

  return (
    <article className="rounded-lg border border-line bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-extrabold leading-5 text-ink">{product.description}</h2>
          <p className="mt-0.5 text-[11px] font-bold text-[#7d877f]">
            Código {product.itemCode}
            {product.reference ? ` · Ref. ${product.reference}` : ''}
          </p>
        </div>
        <p className="shrink-0 text-xs font-black text-forest sm:text-sm">{formatCurrency(product.salePrice)}</p>
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-xs font-extrabold text-moss">NCM {product.ncm || '-'}</p>
        <div className="grid shrink-0 grid-cols-[2rem_3rem_2rem] grid-rows-[1.75rem_2rem] items-center justify-items-center gap-x-1.5 gap-y-2">
          <span
            className={`col-start-2 row-start-1 flex h-7 w-12 items-center justify-center rounded-lg px-2 text-center text-xs font-black text-ink ${stockToneClasses[stockTone]}`}
            title="Saldo atual"
          >
            {product.stockBalance}
          </span>

          <IconButton
            className="!col-start-1 !row-start-2 !h-8 !w-8"
            disabled={selectedQuantity <= 0}
            icon={<Minus size={15} />}
            label={`Diminuir quantidade de ${product.description}`}
            onClick={() => onChangeQuantity(selectedQuantity - 1)}
            tone="dark"
          />
          <input
            aria-label={`Quantidade de ${product.description}`}
            className="col-start-2 row-start-2 h-8 w-12 rounded-lg border border-line bg-cream px-1.5 text-center text-sm font-black text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
            inputMode="numeric"
            min={0}
            onChange={(event) => onChangeQuantity(clampQuantity(Number(event.target.value)))}
            placeholder="0"
            type="number"
            value={selectedQuantity > 0 ? selectedQuantity : ''}
          />
          <IconButton
            className="!col-start-3 !row-start-2 !h-8 !w-8"
            icon={<Plus size={15} />}
            label={`Aumentar quantidade de ${product.description}`}
            onClick={() => onChangeQuantity(selectedQuantity + 1)}
            tone="dark"
          />
        </div>
      </div>

      {false ? (
        <p className="mt-2 text-xs font-black text-forest">
          No pedido: {selectedQuantity} un. · {formatCurrency(selectedQuantity * product.salePrice)}
        </p>
      ) : null}
    </article>
  );
}

export function StockPage() {
  const location = useLocation();
  const hasLoadedEditDraftRef = useRef(false);
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingProtocol, setEditingProtocol] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadProducts = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage('');

    try {
      setProducts(await getProducts());
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar o estoque.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (hasLoadedEditDraftRef.current) {
      return;
    }

    hasLoadedEditDraftRef.current = true;

    const locationState = location.state as StockPageLocationState | null;
    const draft = locationState?.orderEditDraft ?? readOrderEditDraft();

    if (!draft) {
      return;
    }

    setSelectedQuantities(
      draft.items.reduce<Record<number, number>>((next, item) => {
        next[item.productId] = item.quantity;
        return next;
      }, {}),
    );
    setCustomerName(draft.customerName);
    setEditingOrderId(draft.orderId);
    setEditingProtocol(draft.protocol);
    setMessage(`Editando ${draft.protocol}. O protocolo será mantido ao salvar.`);
  }, [location.state]);

  const filteredProducts = useMemo(() => {
    const term = normalizeSearch(debouncedSearch);

    if (!term) {
      return products;
    }

    return products.filter((product) =>
      [
        product.description,
        product.itemCode,
        product.reference,
        product.cfop,
        product.csosn,
        product.ncm,
        product.cst
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [debouncedSearch, products]);

  const selectedItems = useMemo<SelectedItem[]>(() => {
    return products
      .map((product) => {
        const quantity = selectedQuantities[product.id] ?? 0;

        return {
          product,
          quantity,
          lineTotal: quantity * product.salePrice
        };
      })
      .filter((item) => item.quantity > 0);
  }, [products, selectedQuantities]);

  const totalItems = useMemo(
    () => products.reduce((total, product) => total + product.stockBalance, 0),
    [products],
  );
  const selectedUnits = selectedItems.reduce((total, item) => total + item.quantity, 0);
  const selectedTotal = selectedItems.reduce((total, item) => total + item.lineTotal, 0);

  function setProductQuantity(product: StockProduct, quantity: number) {
    const nextQuantity = clampQuantity(quantity);

    setSelectedQuantities((current) => {
      const next = { ...current };

      if (nextQuantity <= 0) {
        delete next[product.id];
      } else {
        next[product.id] = nextQuantity;
      }

      return next;
    });
  }

  function removeSelectedItem(productId: number) {
    setSelectedQuantities((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }

  async function handleSubmitOrder() {
    if (selectedItems.length === 0 || isSubmitting) {
      return;
    }

    setMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    const normalizedCustomerName = customerName.trim();
    const request = {
      ...(normalizedCustomerName ? { customerName: normalizedCustomerName } : {}),
      items: selectedItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const order = editingOrderId ? await updateOrder(editingOrderId, request) : await createOrder(request);
      const successMessage = editingOrderId
        ? `${editingProtocol || `Pedido #${order.id}`} atualizado.`
        : `Pedido #${order.id} criado: ${formatCurrency(order.totalAmount)}.`;

      setSelectedQuantities({});
      setCustomerName('');
      setEditingOrderId(null);
      setEditingProtocol('');
      clearOrderEditDraft();
      setMessage(successMessage);
      await loadProducts(true);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          editingOrderId ? 'Não foi possível salvar as alterações.' : 'Não foi possível criar o pedido.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancelEdit() {
    setSelectedQuantities({});
    setCustomerName('');
    setEditingOrderId(null);
    setEditingProtocol('');
    setMessage('');
    clearOrderEditDraft();
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase text-clay">Estoque da loja</p>
          <h1 className="text-3xl font-black leading-tight text-ink">
            {editingProtocol ? 'Editar pedido' : 'Criar pedido'}
          </h1>
        </div>
        {/*<Button
          className="w-full sm:w-auto"
          icon={<RefreshCw size={17} />}
          isLoading={isRefreshing}
          onClick={() => loadProducts(true)}
          type="button"
          variant="secondary"
        >
          Atualizar
        </Button>*/}
      </div>

      <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-line bg-white p-4">
            <FormField
              autoCapitalize="none"
              icon={<Search size={18} />}
              label="Buscar"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Descrição, código, referência ou fiscal"
              value={search}
            />

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-line bg-cream p-3">
                <p className="text-lg font-black text-ink">{products.length}</p>
                <p className="mt-1 text-xs font-bold text-[#738075]">produtos</p>
              </div>
              <div className="rounded-lg border border-line bg-cream p-3">
                <p className="text-lg font-black text-ink">{totalItems}</p>
                <p className="mt-1 text-xs font-bold text-[#738075]">saldo total</p>
              </div>
              <div className="rounded-lg border border-line bg-cream p-3">
                <p className="text-lg font-black text-ink">{selectedUnits}</p>
                <p className="mt-1 text-xs font-bold text-[#738075]">no pedido</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-ink">Pedido</h2>
                {editingProtocol ? (
                  <p className="mt-1 text-xs font-extrabold uppercase text-clay">{editingProtocol}</p>
                ) : null}
                <p className="mt-1 text-sm font-bold text-[#5f6b63]">
                  {selectedItems.length} itens - {formatCurrency(selectedTotal)}
                </p>
                <div className="mt-3">
                  <FormField
                    autoComplete="organization"
                    //icon={<Store size={18} />}
                    label="Cliente"
                    maxLength={120}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Digite aqui o nome do destinatário"
                    value={customerName}
                  />
                </div>
              </div>
              {selectedItems.length > 0 || editingProtocol ? (
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  {editingProtocol ? (
                    <Button
                      className="!min-h-9 px-3 py-1.5"
                      onClick={handleCancelEdit}
                      type="button"
                      variant="secondary"
                    >
                      Cancelar edição
                    </Button>
                  ) : null}
                  <Button
                    className="!min-h-9 px-3 py-1.5"
                    disabled={selectedItems.length === 0}
                    onClick={() => setSelectedQuantities({})}
                    type="button"
                    variant="secondary"
                  >
                    Limpar
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#ece6db] bg-cream px-3 py-2"
                    key={item.product.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-ink">{item.product.description}</p>
                      <p className="mt-0.5 text-xs font-bold text-[#5f6b63]">
                        {item.quantity} un. - {formatCurrency(item.lineTotal)}
                      </p>
                    </div>
                    <IconButton
                      className="!h-9 !w-9"
                      icon={<Trash2 size={17} />}
                      label={`Remover ${item.product.description} do pedido`}
                      onClick={() => removeSelectedItem(item.product.id)}
                      tone="danger"
                    />
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-line bg-cream p-4 text-sm font-bold text-[#5f6b63]">
                  Os itens escolhidos aparecem aqui.
                </p>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {message ? <Alert>{message}</Alert> : null}
              <Button
                className="w-full"
                disabled={selectedItems.length === 0}
                icon={editingOrderId ? <Save size={17} /> : <Send size={17} />}
                isLoading={isSubmitting}
                onClick={handleSubmitOrder}
                type="button"
              >
                {editingOrderId ? 'Salvar alterações' : 'Criar pedido'}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-ink">
              {search ? `${filteredProducts.length} resultados` : 'Todos os itens em estoque'}
            </h2>
          </div>

          {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}

          <div className="grid gap-3 xl:grid-cols-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                onChangeQuantity={(quantity) => setProductQuantity(product, quantity)}
                product={product}
                selectedQuantity={selectedQuantities[product.id] ?? 0}
              />
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState isLoading={isLoading} message="Nenhum item encontrado." />
          ) : null}

        <aside className="hidden">
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-ink">Pedido atual</h2>
                <p className="mt-1 text-sm font-bold text-[#5f6b63]">
                  {selectedItems.length} itens · {formatCurrency(selectedTotal)}
                </p>
              </div>
              {selectedItems.length > 0 ? (
                <Button onClick={() => setSelectedQuantities({})} type="button" variant="secondary">
                  Limpar
                </Button>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <div
                    className="flex items-center justify-between gap-3 border-t border-[#ece6db] pt-3"
                    key={item.product.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-ink">{item.product.description}</p>
                      <p className="mt-1 text-xs font-bold text-[#5f6b63]">
                        {item.quantity} un. · {formatCurrency(item.lineTotal)}
                      </p>
                    </div>
                    <IconButton
                      icon={<Trash2 size={18} />}
                      label={`Remover ${item.product.description} do pedido`}
                      onClick={() => removeSelectedItem(item.product.id)}
                      tone="danger"
                    />
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-line bg-cream p-4 text-sm font-bold text-[#5f6b63]">
                  Nenhum produto selecionado.
                </p>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {message ? <Alert>{message}</Alert> : null}
              <Button
                className="w-full"
                disabled={selectedItems.length === 0}
                icon={<Send size={17} />}
                isLoading={isSubmitting}
                onClick={handleSubmitOrder}
                type="button"
              >
                Criar pedido
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
