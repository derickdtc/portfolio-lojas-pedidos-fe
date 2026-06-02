export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency'
});

export const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short'
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value || 0);
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : dateTimeFormatter.format(date);
}

export function getProtocol(id: number) {
  return `PED-${String(id).padStart(6, '0')}`;
}
