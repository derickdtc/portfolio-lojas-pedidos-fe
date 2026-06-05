import { api, normalizeApiArray } from './api';
import type {
  CreateOrderRequest,
  DeleteOrdersRequest,
  OrderItem,
  OrderResponse,
  OrderSummary,
  UpdateOrderRequest
} from '../types/api';

function normalizeOrderSummary(order: OrderSummary): OrderSummary {
  return {
    ...order,
    items: normalizeApiArray<OrderItem>((order as { items?: unknown }).items ?? [], ['orderItems'])
  };
}

export async function getOrders() {
  const { data } = await api.get<unknown>('/api/orders');
  return normalizeApiArray<OrderSummary>(data, ['orders']).map(normalizeOrderSummary);
}

export async function createOrder(request: CreateOrderRequest) {
  const { data } = await api.post<OrderResponse>('/api/orders', request);
  return data;
}

export async function updateOrder(orderId: number, request: UpdateOrderRequest) {
  const { data } = await api.put<OrderResponse>(`/api/orders/${orderId}`, request);
  return data;
}

export async function deleteOrders(request: DeleteOrdersRequest) {
  await api.delete('/api/orders', { data: request });
}
