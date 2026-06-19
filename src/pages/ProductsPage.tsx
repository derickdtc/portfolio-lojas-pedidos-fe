import { Edit3, Plus, RefreshCw, Save, Search, Trash2, X } from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ProductImageSlot } from '../components/products/ProductImageSlot';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { IconButton } from '../components/ui/IconButton';
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_ALLOWED_MIME_TYPES,
  PRODUCT_IMAGE_MAX_SIZE_BYTES,
  PLANNED_PRODUCT_IMAGE_FORMATS,
  PLANNED_PRODUCT_IMAGE_MAX_SIZE_MB
} from '../constants/productImages';
import { getApiErrorMessage } from '../services/api';
import {
  createProduct,
  deleteProductImage,
  getProduct,
  getProducts,
  type ProductImageMutationResponse,
  type ProductImageSlot as ProductImageSlotNumber,
  updateProduct,
  uploadProductImage
} from '../services/productService';
import type { ProductRequest, StockProduct } from '../types/api';
import { formatCurrency } from '../utils/formatters';
import { normalizeSearch } from '../utils/stock';

type ProductFormDraft = {
  itemCode: string;
  description: string;
  purchasePrice: string;
  salePrice: string;
  stockBalance: string;
  cfop: string;
  csosn: string;
  ncm: string;
  cst: string;
  reference: string;
  imageUrl1: string;
  imageKey1: string;
  imageUrl2: string;
  imageKey2: string;
};

const emptyDraft: ProductFormDraft = {
  itemCode: '',
  description: '',
  purchasePrice: '0',
  salePrice: '0',
  stockBalance: '0',
  cfop: '',
  csosn: '',
  ncm: '',
  cst: '',
  reference: '',
  imageUrl1: '',
  imageKey1: '',
  imageUrl2: '',
  imageKey2: ''
};

function toDraft(product: StockProduct): ProductFormDraft {
  return {
    itemCode: product.itemCode ?? '',
    description: product.description ?? '',
    purchasePrice: String(product.purchasePrice ?? 0),
    salePrice: String(product.salePrice ?? 0),
    stockBalance: String(product.stockBalance ?? 0),
    cfop: product.cfop ?? '',
    csosn: product.csosn ?? '',
    ncm: product.ncm ?? '',
    cst: product.cst ?? '',
    reference: product.reference ?? '',
    imageUrl1: product.imageUrl1 ?? '',
    imageKey1: product.imageKey1 ?? '',
    imageUrl2: product.imageUrl2 ?? '',
    imageKey2: product.imageKey2 ?? ''
  };
}

function normalizeDecimal(value: string) {
  const numberValue = Number(value.replace(',', '.'));
  return Number.isFinite(numberValue) && numberValue >= 0 ? Math.round(numberValue * 100) / 100 : 0;
}

function normalizeInteger(value: string) {
  const numberValue = Number(value.replace(',', '.'));
  return Number.isFinite(numberValue) && numberValue >= 0 ? Math.floor(numberValue) : 0;
}

function emptyToNull(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function toRequest(draft: ProductFormDraft): ProductRequest {
  return {
    itemCode: draft.itemCode.trim(),
    description: draft.description.trim(),
    purchasePrice: normalizeDecimal(draft.purchasePrice),
    salePrice: normalizeDecimal(draft.salePrice),
    stockBalance: normalizeInteger(draft.stockBalance),
    cfop: draft.cfop.trim(),
    csosn: draft.csosn.trim(),
    ncm: draft.ncm.trim(),
    cst: draft.cst.trim(),
    reference: draft.reference.trim(),
    imageUrl1: emptyToNull(draft.imageUrl1),
    imageKey1: emptyToNull(draft.imageKey1),
    imageUrl2: emptyToNull(draft.imageUrl2),
    imageKey2: emptyToNull(draft.imageKey2)
  };
}

function isProductImageMutationResponse(value: unknown): value is ProductImageMutationResponse {
  return Boolean(value && typeof value === 'object');
}

function getImageUrlField(slot: ProductImageSlotNumber) {
  return `imageUrl${slot}` as 'imageUrl1' | 'imageUrl2';
}

function getImageKeyField(slot: ProductImageSlotNumber) {
  return `imageKey${slot}` as 'imageKey1' | 'imageKey2';
}

function getProductImageValidationError(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const hasAllowedExtension = PLANNED_PRODUCT_IMAGE_FORMATS.some((format) => format === extension);
  const hasAllowedMimeType = PRODUCT_IMAGE_ALLOWED_MIME_TYPES.some((mimeType) => mimeType === file.type);

  if (!hasAllowedMimeType && !hasAllowedExtension) {
    return `Use uma imagem ${PLANNED_PRODUCT_IMAGE_FORMATS.join(', ')}.`;
  }

  if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) {
    return `A imagem deve ter no máximo ${PLANNED_PRODUCT_IMAGE_MAX_SIZE_MB} MB.`;
  }

  return '';
}

function ProductCard({ onEdit, product }: { product: StockProduct; onEdit: (product: StockProduct) => void }) {
  return (
    <article className="flex items-start gap-3 rounded-lg border border-line bg-white p-3">
      <ProductImageSlot alt={product.description} className="h-20 w-20 shrink-0" src={product.imageUrl1} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold leading-5 text-ink">{product.description}</h2>
            <p className="mt-0.5 text-[11px] font-bold text-[#7d877f]">
              Código {product.itemCode}
              {product.reference ? ` · Ref. ${product.reference}` : ''}
            </p>
          </div>
          <IconButton
            className="!h-9 !w-9"
            icon={<Edit3 size={16} />}
            label={`Editar ${product.description}`}
            onClick={() => onEdit(product)}
            tone="light"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-[#ece6db] bg-cream px-2 py-2">
            <p className="text-[10px] font-extrabold uppercase text-[#738075]">Venda</p>
            <p className="mt-1 text-xs font-black text-forest">{formatCurrency(product.salePrice)}</p>
          </div>
          <div className="rounded-lg border border-[#ece6db] bg-cream px-2 py-2">
            <p className="text-[10px] font-extrabold uppercase text-[#738075]">Estoque</p>
            <p className="mt-1 text-xs font-black text-ink">{product.stockBalance}</p>
          </div>
          <div className="rounded-lg border border-[#ece6db] bg-cream px-2 py-2">
            <p className="text-[10px] font-extrabold uppercase text-[#738075]">NCM</p>
            <p className="mt-1 truncate text-xs font-black text-ink">{product.ncm || '-'}</p>
          </div>
          <div className="rounded-lg border border-[#ece6db] bg-cream px-2 py-2">
            <p className="text-[10px] font-extrabold uppercase text-[#738075]">CFOP</p>
            <p className="mt-1 truncate text-xs font-black text-ink">{product.cfop || '-'}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function EditableProductImageSlot({
  alt,
  isActive,
  onEdit,
  onRemove,
  onToggle,
  src,
  isUploading
}: {
  alt: string;
  src: string;
  isActive: boolean;
  isUploading: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const hasImage = Boolean(src.trim());

  return (
    <div className="relative">
      <button
        className="block w-full rounded-lg text-left outline-none transition focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        disabled={isUploading}
        onClick={onToggle}
        type="button"
      >
        <ProductImageSlot alt={alt} className="aspect-square w-full" src={src} />
      </button>

      {isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-ink/45 text-white">
          <span
            aria-label="Enviando imagem"
            className="h-6 w-6 animate-spin rounded-full border-2 border-current border-r-transparent"
            role="status"
          />
        </div>
      ) : null}

      {isActive ? (
        <div className="absolute left-2 right-2 top-2 z-20 overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <button
            className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm font-black text-moss transition hover:bg-cream"
            onClick={onEdit}
            type="button"
          >
            <Edit3 size={15} />
            Editar
          </button>
          {hasImage ? (
            <button
              className="flex min-h-10 w-full items-center gap-2 border-t border-line px-3 text-left text-sm font-black text-danger transition hover:bg-[#ffe9e5]"
              onClick={onRemove}
              type="button"
            >
              <Trash2 size={15} />
              Remover
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ProductsPage() {
  const imageInput1Ref = useRef<HTMLInputElement | null>(null);
  const imageInput2Ref = useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProductFormDraft>(emptyDraft);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeImageSlot, setActiveImageSlot] = useState<1 | 2 | null>(null);
  const [uploadingImageSlot, setUploadingImageSlot] = useState<ProductImageSlotNumber | null>(null);

  const isEditing = selectedProductId !== null;

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
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os produtos.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = normalizeSearch(search);

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
      ].some((value) => normalizeSearch(value ?? '').includes(term)),
    );
  }, [products, search]);

  function updateDraftField(field: keyof ProductFormDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateProductList(product: StockProduct) {
    setProducts((currentProducts) => {
      const alreadyExists = currentProducts.some((currentProduct) => currentProduct.id === product.id);

      if (alreadyExists) {
        return currentProducts.map((currentProduct) => (currentProduct.id === product.id ? product : currentProduct));
      }

      return [product, ...currentProducts];
    });
  }

  function applyImageMutation(slot: ProductImageSlotNumber, response: unknown, fallbackFields?: Partial<ProductFormDraft>) {
    const imageUrlField = getImageUrlField(slot);
    const imageKeyField = getImageKeyField(slot);

    if (isProductImageMutationResponse(response) && response.product) {
      updateProductList(response.product);
      setDraft(toDraft(response.product));
      setSelectedProductId(response.product.id);
      return;
    }

    const imageUrl = isProductImageMutationResponse(response)
      ? response[imageUrlField] ?? response.imageUrl ?? fallbackFields?.[imageUrlField] ?? ''
      : fallbackFields?.[imageUrlField] ?? '';
    const imageKey = isProductImageMutationResponse(response)
      ? response[imageKeyField] ?? response.imageKey ?? fallbackFields?.[imageKeyField] ?? ''
      : fallbackFields?.[imageKeyField] ?? '';

    setDraft((current) => ({
      ...current,
      [imageUrlField]: imageUrl ?? '',
      [imageKeyField]: imageKey ?? ''
    }));

    if (selectedProductId !== null) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === selectedProductId
            ? {
                ...product,
                [imageUrlField]: imageUrl ?? null,
                [imageKeyField]: imageKey ?? null
              }
            : product,
        ),
      );
    }
  }

  async function clearImage(slot: ProductImageSlotNumber) {
    const imageUrlField = getImageUrlField(slot);
    const imageKeyField = getImageKeyField(slot);

    setActiveImageSlot(null);
    setMessage('');
    setErrorMessage('');

    if (selectedProductId !== null) {
      setUploadingImageSlot(slot);

      try {
        applyImageMutation(slot, await deleteProductImage(selectedProductId, slot), {
          [imageUrlField]: '',
          [imageKeyField]: ''
        });
        setMessage('Imagem removida.');
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, 'Não foi possível remover a imagem.'));
      } finally {
        setUploadingImageSlot(null);
      }

      return;
    }

    setDraft((current) => ({
      ...current,
      [imageUrlField]: '',
      [imageKeyField]: ''
    }));
  }

  function handleEditImage(slot: ProductImageSlotNumber) {
    setActiveImageSlot(null);
    setMessage('');
    setErrorMessage('');

    if (selectedProductId === null) {
      setErrorMessage('Salve o produto antes de enviar imagens.');
      return;
    }

    const input = slot === 1 ? imageInput1Ref.current : imageInput2Ref.current;
    input?.click();
  }

  async function handleImageFileChange(slot: ProductImageSlotNumber, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || selectedProductId === null) {
      return;
    }

    const validationError = getProductImageValidationError(file);

    if (validationError) {
      setMessage('');
      setErrorMessage(validationError);
      return;
    }

    setUploadingImageSlot(slot);
    setMessage('');
    setErrorMessage('');

    try {
      applyImageMutation(slot, await uploadProductImage(selectedProductId, slot, file));
      setMessage('Imagem atualizada.');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível enviar a imagem.'));
    } finally {
      setUploadingImageSlot(null);
    }
  }

  function startCreate() {
    setSelectedProductId(null);
    setDraft(emptyDraft);
    setActiveImageSlot(null);
    setMessage('');
    setErrorMessage('');
  }

  async function startEdit(product: StockProduct) {
    setSelectedProductId(product.id);
    setDraft(toDraft(product));
    setActiveImageSlot(null);
    setMessage('');
    setErrorMessage('');
    setIsLoadingProduct(true);

    try {
      setDraft(toDraft(await getProduct(product.id)));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível carregar os detalhes do produto.'));
    } finally {
      setIsLoadingProduct(false);
    }
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const savedProduct = isEditing
        ? await updateProduct(selectedProductId, toRequest(draft))
        : await createProduct(toRequest(draft));

      updateProductList(savedProduct);
      setSelectedProductId(savedProduct.id);
      setDraft(toDraft(savedProduct));
      setMessage(isEditing ? 'Produto atualizado.' : 'Produto criado.');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar o produto.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase text-clay">Estoque</p>
          <h1 className="text-3xl font-black leading-tight text-ink">Produtos</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            className="w-full sm:w-auto"
            icon={<RefreshCw size={17} />}
            isLoading={isRefreshing}
            onClick={() => loadProducts(true)}
            type="button"
            variant="secondary"
          >
            Atualizar
          </Button>
          <Button className="w-full sm:w-auto" icon={<Plus size={17} />} onClick={startCreate} type="button">
            Novo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="order-2 min-w-0 space-y-4 xl:order-1">
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <FormField
              autoCapitalize="none"
              icon={<Search size={18} />}
              label="Buscar"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Descrição, código, referência ou fiscal"
              value={search}
            />
          </div>

          {errorMessage ? <Alert tone="danger">{errorMessage}</Alert> : null}
          {message ? <Alert>{message}</Alert> : null}

          <div className="grid gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} onEdit={startEdit} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState isLoading={isLoading} message="Nenhum produto encontrado." />
          ) : null}
        </div>

        <aside className="order-1 rounded-lg border border-line bg-white p-4 shadow-soft xl:order-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-clay">{isEditing ? 'Editar' : 'Cadastro'}</p>
              <h2 className="mt-1 text-xl font-black text-ink">Produto</h2>
            </div>
            {isEditing ? (
              <IconButton icon={<X size={18} />} label="Limpar edição" onClick={startCreate} tone="light" />
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <input
              accept={PRODUCT_IMAGE_ACCEPT}
              className="hidden"
              onChange={(event) => handleImageFileChange(1, event)}
              ref={imageInput1Ref}
              type="file"
            />
            <input
              accept={PRODUCT_IMAGE_ACCEPT}
              className="hidden"
              onChange={(event) => handleImageFileChange(2, event)}
              ref={imageInput2Ref}
              type="file"
            />
            <EditableProductImageSlot
              alt="Imagem 1 do produto"
              isActive={activeImageSlot === 1}
              isUploading={uploadingImageSlot === 1}
              onEdit={() => handleEditImage(1)}
              onRemove={() => clearImage(1)}
              onToggle={() => setActiveImageSlot((current) => (current === 1 ? null : 1))}
              src={draft.imageUrl1}
            />
            <EditableProductImageSlot
              alt="Imagem 2 do produto"
              isActive={activeImageSlot === 2}
              isUploading={uploadingImageSlot === 2}
              onEdit={() => handleEditImage(2)}
              onRemove={() => clearImage(2)}
              onToggle={() => setActiveImageSlot((current) => (current === 2 ? null : 2))}
              src={draft.imageUrl2}
            />
          </div>

          <div className="mt-4 space-y-3">
            <FormField
              label="Descrição"
              onChange={(event) => updateDraftField('description', event.target.value)}
              placeholder="Nome do produto"
              value={draft.description}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Código"
                onChange={(event) => updateDraftField('itemCode', event.target.value)}
                value={draft.itemCode}
              />
              <FormField
                label="Referência"
                onChange={(event) => updateDraftField('reference', event.target.value)}
                value={draft.reference}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField
                inputMode="decimal"
                label="Compra"
                onChange={(event) => updateDraftField('purchasePrice', event.target.value)}
                value={draft.purchasePrice}
              />
              <FormField
                inputMode="decimal"
                label="Venda"
                onChange={(event) => updateDraftField('salePrice', event.target.value)}
                value={draft.salePrice}
              />
              <FormField
                inputMode="numeric"
                label="Estoque"
                onChange={(event) => updateDraftField('stockBalance', event.target.value)}
                value={draft.stockBalance}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CFOP" onChange={(event) => updateDraftField('cfop', event.target.value)} value={draft.cfop} />
              <FormField label="CSOSN" onChange={(event) => updateDraftField('csosn', event.target.value)} value={draft.csosn} />
              <FormField label="NCM" onChange={(event) => updateDraftField('ncm', event.target.value)} value={draft.ncm} />
              <FormField label="CST" onChange={(event) => updateDraftField('cst', event.target.value)} value={draft.cst} />
            </div>
            <Button
              className="w-full"
              icon={<Save size={17} />}
              isLoading={isSaving || isLoadingProduct}
              onClick={handleSave}
              type="button"
            >
              {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
