import { api } from './api';
import type { CreateOrderRequest, OrderResponse, OrderSummary } from '../types/api';

export async function getOrders() {
  const { data } = await api.get<OrderSummary[]>('/api/orders');
  return data;
}

export async function createOrder(request: CreateOrderRequest) {
  const { data } = await api.post<OrderResponse>('/api/orders', request);
  return data;
}
