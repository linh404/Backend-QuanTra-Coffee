export enum PaymentMethod {
  COD = 'COD',
  VNPAY = 'VNPAY',
}

export interface PaymentResult {
  success: boolean;
  message: string;
  orderId?: number;
  transactionId?: string;
}