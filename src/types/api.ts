export type AuthUser = {
  id: number;
  username: string;
  storeName?: string | null;
  store?: {
    name?: string | null;
    displayName?: string | null;
  } | null;
};

export type LoginRequest = {
  username: string;
  password: string;
  rememberMe: boolean;
};

export type AuthResponse = {
  token: string;
  expiresAtUtc: string;
  user: AuthUser;
};

export type StockProduct = {
  id: number;
  itemCode: string;
  description: string;
  purchasePrice: number;
  salePrice: number;
  stockBalance: number;
  cfop: string;
  csosn: string;
  ncm: string;
  cst: string;
  reference: string;
  imageUrl1?: string | null;
  imageKey1?: string | null;
  imageUrl2?: string | null;
  imageKey2?: string | null;
};

export type ProductImageFields = Pick<StockProduct, 'imageUrl1' | 'imageKey1' | 'imageUrl2' | 'imageKey2'>;

export type ProductRequest = Omit<StockProduct, 'id'>;

export type ProductImportResponse = {
  imported: number;
  replaced: number;
  skipped: number;
  warnings: string[];
};

export type CreateOrderItemRequest = {
  productId: number;
  quantity: number;
  salePrice?: number;
};

export type CreateOrderRequest = {
  customerName?: string;
  observations?: string;
  items: CreateOrderItemRequest[];
};

export type UpdateOrderRequest = CreateOrderRequest;

export type DeleteOrdersRequest = {
  orderIds: number[];
};

export type OrderItem = {
  productId: number | null;
  productItemCode: string;
  productDescription: string;
  productReference: string;
  cfop: string;
  csosn: string;
  ncm: string;
  cst: string;
  quantity: number;
  salePrice: number;
  lineTotal: number;
};

export type OrderSummary = {
  id: number;
  createdAtUtc: string;
  createdByUsername: string;
  customerName?: string | null;
  observations?: string | null;
  status: string;
  totalAmount: number;
  itemsCount: number;
  items: OrderItem[];
};

export type OrderResponse = Omit<OrderSummary, 'itemsCount'>;
