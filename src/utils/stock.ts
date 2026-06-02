export function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(0, Math.trunc(quantity));
}

export function getStockTone(stockBalance: number) {
  if (stockBalance <= 0) {
    return 'low';
  }

  if (stockBalance <= 10) {
    return 'medium';
  }

  return 'high';
}

export function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}
