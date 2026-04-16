'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

enum PaymentMethod {
  COD = 'COD',
  VNPAY = 'VNPAY',
}

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  onSubmit: (paymentMethod: PaymentMethod) => Promise<void>;
}

export default function OrderSummary({ subtotal, shipping, total, onSubmit }: OrderSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(paymentMethod);
    } catch (error) {
      console.error('Checkout error:', error);
      // Hiện thông báo lỗi
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
      
      {/* Chi tiết đơn hàng */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping)}</span>
        </div>
        <div className="border-t pt-3 flex justify-between font-semibold">
          <span>Tổng cộng:</span>
          <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Phương thức thanh toán</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="payment"
              value={PaymentMethod.COD}
              checked={paymentMethod === PaymentMethod.COD}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="form-radio text-green-600"
            />
            <span>Thanh toán khi nhận hàng (COD)</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="payment"
              value={PaymentMethod.VNPAY}
              checked={paymentMethod === PaymentMethod.VNPAY}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="form-radio text-green-600"
            />
            <span>Thanh toán qua VNPay</span>
          </label>
        </div>
      </div>

      {/* Nút thanh toán */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Thanh toán'}
      </button>
    </div>
  );
}