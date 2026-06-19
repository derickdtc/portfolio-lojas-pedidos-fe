import { api, normalizeApiArray } from './api';
import type { ProductImageFields, ProductImportResponse, ProductRequest, StockProduct } from '../types/api';

export type ProductImageSlot = 1 | 2;

export type ProductImageMutationResponse = Partial<ProductImageFields> & {
  imageUrl?: string | null;
  imageKey?: string | null;
  product?: StockProduct | null;
};

export async function getProducts() {
  const { data } = await api.get<unknown>('/api/products');
  return normalizeApiArray<StockProduct>(data, ['products']);
}

export async function getProduct(productId: number) {
  const { data } = await api.get<StockProduct>(`/api/products/${productId}`);
  return data;
}

export async function createProduct(product: ProductRequest) {
  const { data } = await api.post<StockProduct>('/api/products', product);
  return data;
}

export async function updateProduct(productId: number, product: ProductRequest) {
  const { data } = await api.put<StockProduct>(`/api/products/${productId}`, product);
  return data;
}

export async function uploadProductImage(productId: number, slot: ProductImageSlot, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<ProductImageMutationResponse>(
    `/api/products/${productId}/images/${slot}`,
    formData,
  );
  return data;
}

export async function deleteProductImage(productId: number, slot: ProductImageSlot) {
  const { data } = await api.delete<ProductImageMutationResponse>(`/api/products/${productId}/images/${slot}`);
  return data;
}

export async function importProducts(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<ProductImportResponse>('/api/products/import', formData);
  return {
    ...data,
    warnings: normalizeApiArray<string>(data.warnings ?? [], ['warnings'])
  };
}
