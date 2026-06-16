export type OrderStatus = 'READY' | 'DONE' | 'FAILED' | 'CANCELED';

export type PaymentOrder = {
  user_id: string;
  order_id: string;
  amount: number;
  status: OrderStatus;
};

export type CreditType = 'charge' | 'spend' | 'refund';

export type CheckoutResponse = {
  orderId: string;
  amount: number;
};

export type ConfirmResponse = {
  balance: number;
  alreadyProcessed?: boolean;
};
