import { api } from './api';
import type {
  CreateOrderRequest,
  DeleteOrdersRequest,
  OrderResponse,
  OrderSummary,
  UpdateOrderRequest
} from '../types/api';

export async function getOrders() {
  const { data } = await api.get<OrderSummary[]>('/api/orders');
  return data;
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
