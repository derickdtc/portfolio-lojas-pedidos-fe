import { api, normalizeApiArray } from './api';
import type { ProductImportResponse, StockProduct } from '../types/api';

export async function getProducts() {
  const { data } = await api.get<unknown>('/api/products');
  return normalizeApiArray<StockProduct>(data, ['products']);
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
