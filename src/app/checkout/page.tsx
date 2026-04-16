'use client';
import { useState, useEffect } from 'react';
import OrderSummary from '@/components/OrderSummary';
import { useRouter } from 'next/navigation';
import { PaymentMethod } from '@/types/payment';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, calculateTotal } = useCart();
  const { token } = useAuth();
  
  // Tính toán các giá trị
  const cartTotal = calculateTotal();
  const hasItems = cart?.items && cart.items.length > 0;
  const shippingFee = hasItems ? 30000 : 0; // Phí ship cố định 30k nếu có hàng
  
  // Redirect nếu giỏ hàng trống
  useEffect(() => {
    if (!hasItems) {
      router.push('/cart');
    }
  }, [hasItems, router]);

  const handlePayment = async (paymentMethod: PaymentMethod) => {
    setIsProcessing(true);
    try {
      if (!token) throw new Error('Authentication required');

      // 1. Tạo đơn hàng
      // Lấy thông tin từ form
      const form = document.querySelector('form');
      const formData = new FormData(form as HTMLFormElement);
      
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart?.items,
          shipping: {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            note: formData.get('note')
          },
          paymentMethod,
          total: cartTotal + shippingFee
        }),
      });

      if (!orderRes.ok) throw new Error('Could not create order');
      const { orderId, total } = await orderRes.json();

      // 2. Xử lý theo phương thức thanh toán
      if (paymentMethod === PaymentMethod.VNPAY) {
        // Tạo URL thanh toán VNPay
        const vnpayRes = await fetch('/api/payment/vnpay/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId,
            amount: total,
            orderInfo: `Thanh toan don hang #${orderId}`,
          }),
        });

        if (!vnpayRes.ok) throw new Error('Could not create payment URL');
        const { paymentUrl } = await vnpayRes.json();
        
        // Chuyển hướng đến trang thanh toán VNPay
        window.location.href = paymentUrl;
      } else {
        // COD: Chuyển đến trang xác nhận đơn hàng
        router.push(`/orders/${orderId}/confirmation`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Hiển thị thông báo lỗi
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form thông tin giao hàng bên trái */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <textarea
                name="address"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <textarea
                name="note"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
              />
            </div>
          </form>
        </div>

        {/* Order summary bên phải */}
        <div>
          <OrderSummary
            subtotal={cartTotal}
            shipping={shippingFee}
            total={cartTotal + shippingFee}
            onSubmit={handlePayment}
          />
        </div>
      </div>
    </div>
  );
}
