import type { OrderSummary } from '../types/api';
import { getProtocol } from './formatters';

export const ORDER_EDIT_DRAFT_STORAGE_KEY = 'lojas-pedidos.order-edit-draft';

export type OrderEditDraft = {
  orderId: number;
  protocol: string;
  customerName: string;
  items: {
    productId: number;
    quantity: number;
  }[];
};

export function createOrderEditDraft(order: OrderSummary): OrderEditDraft {
  return {
    orderId: order.id,
    protocol: getProtocol(order.id),
    customerName: order.customerName ?? '',
    items: order.items
      .filter((item) => item.productId !== null)
      .map((item) => ({
        productId: item.productId as number,
        quantity: item.quantity
      }))
  };
}

export function readOrderEditDraft() {
  const rawDraft = window.sessionStorage.getItem(ORDER_EDIT_DRAFT_STORAGE_KEY);

  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft) as OrderEditDraft;
  } catch {
    clearOrderEditDraft();
    return null;
  }
}

export function writeOrderEditDraft(draft: OrderEditDraft) {
  window.sessionStorage.setItem(ORDER_EDIT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearOrderEditDraft() {
  window.sessionStorage.removeItem(ORDER_EDIT_DRAFT_STORAGE_KEY);
}
