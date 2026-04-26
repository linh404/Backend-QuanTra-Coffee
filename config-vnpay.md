# Hướng dẫn tích hợp thanh toán VNPay (Flask)

Hướng dẫn này có thể áp dụng cho bất kỳ project Flask nào.

---

## Mục lục

1. [Đăng ký Sandbox](#1-đăng-ký-sandbox)
2. [Cấu hình Environment](#2-cấu-hình-environment)
3. [Config Class](#3-config-class)
4. [VNPay Service](#4-vnpay-service)
5. [Routes](#5-routes)
6. [Database Migration](#6-database-migration)
7. [Sử dụng trong Checkout](#7-sử-dụng-trong-checkout)
8. [Frontend Integration](#8-frontend-integration)
9. [Lên Production](#9-lên-production)
10. [Mã lỗi VNPay](#10-mã-lỗi-vnpay)
11. [Thẻ Test](#11-thẻ-test)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Đăng ký Sandbox

1. Truy cập: https://sandbox.vnpayment.vn/devreg
2. Đăng ký tài khoản merchant test
3. Sau khi đăng ký, bạn sẽ nhận được:
   - **Terminal ID (vnp_TmnCode)**: Mã website
   - **Hash Secret (vnp_HashSecret)**: Chuỗi bí mật tạo checksum
4. Quản lý giao dịch tại: https://sandbox.vnpayment.vn/merchantv2/
5. Test IPN tại: https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login
6. Tài liệu chính thức: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
7. Code demo: https://sandbox.vnpayment.vn/apis/vnpay-demo/

---

## 2. Cấu hình Environment

Thêm vào file `.env`:

```bash
# VNPay Payment - Sandbox (Test)
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

> [!WARNING]
> Khi lên Production, thay `VNPAY_URL` bằng URL production do VNPay cung cấp.
> KHÔNG commit credentials vào git. Thêm `.env` vào `.gitignore`.

---

## 3. Config Class

Thêm vào `config.py`:

```python
import os

class Config:
    # VNPay Payment Configuration (Sandbox)
    VNPAY_TMN_CODE = os.environ.get('VNPAY_TMN_CODE', '')
    VNPAY_HASH_SECRET = os.environ.get('VNPAY_HASH_SECRET', '')
    VNPAY_URL = os.environ.get('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')
```

---

## 4. VNPay Service

Tạo file `services/vnpay_service.py`:

```python
"""VNPay Payment Service"""

import hashlib
import hmac
import urllib.parse
from datetime import datetime
from flask import current_app, url_for


class VNPayService:
    """Service for VNPay payment integration"""

    @staticmethod
    def get_config():
        """Get VNPay configuration from app config"""
        return {
            'tmn_code': current_app.config.get('VNPAY_TMN_CODE', ''),
            'hash_secret': current_app.config.get('VNPAY_HASH_SECRET', ''),
            'vnpay_url': current_app.config.get(
                'VNPAY_URL',
                'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
            )
        }

    @staticmethod
    def generate_signature(data: dict, secret_key: str) -> str:
        """
        Generate HMAC-SHA512 signature for VNPay API.

        Args:
            data: Dictionary of parameters to sign (will be sorted alphabetically)
            secret_key: VNPay hash secret key

        Returns:
            Hex-encoded signature string
        """
        sorted_data = sorted(data.items())
        query_string = '&'.join(
            [f"{k}={urllib.parse.quote_plus(str(v))}" for k, v in sorted_data]
        )
        signature = hmac.new(
            secret_key.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        return signature

    @staticmethod
    def create_payment_url(order_code: str, amount: int, order_info: str,
                           return_url: str = None,
                           client_ip: str = '127.0.0.1') -> dict:
        """
        Create a VNPay payment URL.

        Args:
            order_code: Unique order code (vnp_TxnRef)
            amount: Payment amount in VND (integer, e.g. 100000)
            order_info: Order description
            return_url: URL to redirect after payment (optional)
            client_ip: Client IP address

        Returns:
            dict with 'success', 'payment_url', 'txn_ref', 'error'
        """
        config = VNPayService.get_config()

        if not config['tmn_code'] or not config['hash_secret']:
            return {
                'success': False,
                'payment_url': None,
                'error': 'VNPay configuration is missing'
            }

        # Build return URL - thay 'site.vnpay_return' theo blueprint của bạn
        if return_url is None:
            return_url = url_for('site.vnpay_return', _external=True)

        create_date = datetime.now().strftime('%Y%m%d%H%M%S')

        # QUAN TRỌNG: VNPay yêu cầu amount * 100
        vnp_amount = amount * 100

        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': config['tmn_code'],
            'vnp_Amount': str(vnp_amount),
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': order_code,
            'vnp_OrderInfo': order_info,
            'vnp_OrderType': 'other',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': return_url,
            'vnp_IpAddr': client_ip,
            'vnp_CreateDate': create_date,
        }

        try:
            signature = VNPayService.generate_signature(
                vnp_params, config['hash_secret']
            )
            vnp_params['vnp_SecureHash'] = signature

            query_string = '&'.join(
                [f"{k}={urllib.parse.quote_plus(str(v))}"
                 for k, v in sorted(vnp_params.items())]
            )
            payment_url = f"{config['vnpay_url']}?{query_string}"

            return {
                'success': True,
                'payment_url': payment_url,
                'txn_ref': order_code,
                'error': None
            }
        except Exception as e:
            current_app.logger.error(f"VNPay create payment URL failed: {e}")
            return {
                'success': False,
                'payment_url': None,
                'error': str(e)
            }

    @staticmethod
    def verify_return_signature(query_params: dict) -> bool:
        """
        Verify VNPay return URL signature.

        Args:
            query_params: Query parameters from VNPay redirect

        Returns:
            True if signature is valid
        """
        config = VNPayService.get_config()
        received_signature = query_params.get('vnp_SecureHash', '')

        # Loại bỏ signature fields khỏi params để verify
        verify_params = {
            k: v for k, v in query_params.items()
            if k not in ['vnp_SecureHash', 'vnp_SecureHashType']
        }

        expected_signature = VNPayService.generate_signature(
            verify_params, config['hash_secret']
        )
        return hmac.compare_digest(
            received_signature.lower(), expected_signature.lower()
        )

    @staticmethod
    def is_payment_successful(response_code: str) -> bool:
        """Check if payment successful (code '00')"""
        return response_code == '00'

    @staticmethod
    def get_response_message(response_code: str) -> str:
        """Get Vietnamese message for VNPay response code"""
        messages = {
            '00': 'Giao dịch thành công',
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo)',
            '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
            '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Đã hết hạn chờ thanh toán',
            '12': 'Thẻ/Tài khoản bị khóa',
            '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP)',
            '24': 'Khách hàng hủy giao dịch',
            '51': 'Tài khoản không đủ số dư',
            '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
            '75': 'Ngân hàng thanh toán đang bảo trì',
            '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định',
            '99': 'Các lỗi khác',
        }
        return messages.get(
            response_code, f'Lỗi không xác định (Mã: {response_code})'
        )
```

> [!IMPORTANT]
> **Thuật toán chữ ký:** VNPay sử dụng **HMAC-SHA512** (khác với MoMo dùng HMAC-SHA256).
> **Amount:** VNPay yêu cầu nhân `amount * 100` trước khi gửi.

---

## 5. Routes

Tạo routes cho VNPay callback:

```python
from flask import Blueprint, request, redirect, url_for, flash
from services.vnpay_service import VNPayService

# Hoặc thêm vào blueprint có sẵn
payment_bp = Blueprint('payment', __name__)


@payment_bp.route('/vnpay/return')
def vnpay_return():
    """VNPay return URL - user redirect after payment"""
    query_params = dict(request.args)

    # Verify chữ ký
    if not VNPayService.verify_return_signature(query_params):
        flash('Chữ ký không hợp lệ. Vui lòng liên hệ hỗ trợ.', 'danger')
        return redirect(url_for('site.home'))

    response_code = query_params.get('vnp_ResponseCode', '')
    txn_ref = query_params.get('vnp_TxnRef', '')

    if VNPayService.is_payment_successful(response_code):
        # TODO: Cập nhật order trong database
        # order = Order.query.filter_by(order_code=txn_ref).first()
        # order.payment_status = 'paid'
        # order.vnpay_txn_ref = txn_ref
        # db.session.commit()
        flash('Thanh toán VNPay thành công!', 'success')
    else:
        message = VNPayService.get_response_message(response_code)
        flash(f'Thanh toán chưa thành công: {message}', 'warning')

    return redirect(url_for('order.detail', order_code=txn_ref))


@payment_bp.route('/vnpay/ipn', methods=['GET'])
def vnpay_ipn():
    """VNPay IPN callback - server to server (GET request)"""
    query_params = dict(request.args)

    if not VNPayService.verify_return_signature(query_params):
        return {'RspCode': '97', 'Message': 'Invalid Checksum'}

    txn_ref = query_params.get('vnp_TxnRef', '')
    response_code = query_params.get('vnp_ResponseCode', '')

    # TODO: Tìm order và cập nhật
    # order = Order.query.filter_by(order_code=txn_ref).first()
    # if not order:
    #     return {'RspCode': '01', 'Message': 'Order not found'}
    # if order.payment_status == 'paid':
    #     return {'RspCode': '02', 'Message': 'Already paid'}

    if VNPayService.is_payment_successful(response_code):
        # order.payment_status = 'paid'
        # db.session.commit()
        return {'RspCode': '00', 'Message': 'Confirm Success'}
    else:
        return {'RspCode': '00', 'Message': 'Confirm Success'}
```

> [!NOTE]
> **VNPay IPN là GET request**, khác với MoMo IPN là POST request.
> VNPay sẽ gọi IPN URL với các query params, bạn cần verify signature và trả về JSON `{RspCode, Message}`.

---

## 6. Database Migration

Thêm cột theo dõi VNPay vào bảng orders:

```sql
-- Thêm cột vnpay_txn_ref
ALTER TABLE orders ADD COLUMN vnpay_txn_ref VARCHAR(50) NULL;

-- Thêm index cho tìm kiếm nhanh
CREATE INDEX idx_orders_vnpay_txn_ref ON orders(vnpay_txn_ref);

-- Nếu dùng ENUM cho payment_method, thêm VNPAY:
-- ALTER TABLE orders MODIFY COLUMN payment_method
--   ENUM('COD', 'MOMO', 'VNPAY', 'MOCK_TRANSFER') NOT NULL DEFAULT 'COD';

-- Nếu dùng ENUM cho event_type, thêm vnpay_paid:
-- ALTER TABLE order_events MODIFY COLUMN event_type
--   ENUM('placed','paid','vnpay_paid','confirmed','fulfilled',
--        'completed','cancelled','restocked') NOT NULL;
```

---

## 7. Sử dụng trong Checkout

```python
from services.vnpay_service import VNPayService

# Trong checkout view
if payment_method == 'VNPAY':
    result = VNPayService.create_payment_url(
        order_code=order.order_code,
        amount=int(total_amount),       # VND, số nguyên (KHÔNG nhân 100)
        order_info=f'Thanh toán đơn hàng {order.order_code}',
        client_ip=request.remote_addr or '127.0.0.1'
    )

    if result['success']:
        order.vnpay_txn_ref = result['txn_ref']
        db.session.commit()
        return redirect(result['payment_url'])
    else:
        flash(f'Lỗi VNPay: {result["error"]}', 'error')
```

---

## 8. Frontend Integration

Thêm VNPay vào form checkout:

```html
<!-- Payment Method Radio -->
<div class="form-check mb-2">
    <input class="form-check-input" type="radio"
           name="payment_method" value="VNPAY" id="payment_VNPAY">
    <label class="form-check-label" for="payment_VNPAY">
        <i class="bi bi-credit-card"></i> Thanh toán qua VNPay
    </label>
</div>

<!-- VNPay Info Panel (ẩn mặc định) -->
<div id="vnpay-info" class="mt-3 p-3 border rounded" style="display: none;
    background: linear-gradient(135deg, #0066b3 0%, #004d99 100%);">
    <div class="text-white">
        <h6 class="mb-2">Thanh toán qua VNPay</h6>
        <p class="mb-2"><small>Bạn sẽ được chuyển đến cổng thanh toán VNPay.</small></p>
        <ul class="list-unstyled mb-0" style="font-size: 0.85rem;">
            <li>• Hỗ trợ thẻ ATM/Internet Banking nội địa</li>
            <li>• Hỗ trợ thẻ quốc tế Visa, Master, JCB</li>
            <li>• Quét QR Pay qua app ngân hàng</li>
        </ul>
    </div>
</div>
```

```javascript
// Xử lý hiển thị VNPay info khi chọn
document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const vnpayInfo = document.getElementById('vnpay-info');
        const submitText = document.getElementById('submit-text');
        const submitBtn  = document.getElementById('submit-btn');

        if (this.value === 'VNPAY') {
            vnpayInfo.style.display = 'block';
            submitText.textContent = 'Thanh toán với VNPay';
            submitBtn.style.background = 'linear-gradient(135deg, #0066b3 0%, #004d99 100%)';
            submitBtn.style.border = 'none';
        } else {
            vnpayInfo.style.display = 'none';
        }
    });
});
```

---

## 9. Lên Production

1. Đăng ký tài khoản Merchant với VNPay tại: https://vnpay.vn
2. Nhận credentials production (TmnCode, HashSecret)
3. Đổi `.env`:
   ```bash
   VNPAY_TMN_CODE=PRODUCTION_TMN_CODE
   VNPAY_HASH_SECRET=PRODUCTION_HASH_SECRET
   VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
   ```
4. Cấu hình IPN URL trên Merchant Admin portal
5. Đảm bảo IPN URL có **HTTPS** và accessible từ internet

---

## 10. Mã lỗi VNPay

| Code | Mô tả |
|------|-------|
| `00` | Giao dịch thành công |
| `07` | Trừ tiền thành công, giao dịch bị nghi ngờ |
| `09` | Thẻ/TK chưa đăng ký InternetBanking |
| `10` | Xác thực sai quá 3 lần |
| `11` | Hết hạn chờ thanh toán |
| `12` | Thẻ/Tài khoản bị khóa |
| `13` | Nhập sai OTP |
| `24` | Khách hàng hủy giao dịch |
| `51` | Không đủ số dư |
| `65` | Vượt quá hạn mức giao dịch trong ngày |
| `75` | Ngân hàng đang bảo trì |
| `79` | Nhập sai mật khẩu thanh toán quá số lần |
| `99` | Các lỗi khác |

---

## 11. Thẻ Test

| Thông tin | Giá trị |
|-----------|---------|
| Ngân hàng | NCB |
| Số thẻ | 9704198526191432198 |
| Tên chủ thẻ | NGUYEN VAN A |
| Ngày phát hành | 07/15 |
| Mật khẩu OTP | 123456 |

Demo thử: https://sandbox.vnpayment.vn/apis/vnpay-demo/

---

## 12. Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| Invalid Checksum (97) | Sai hash secret hoặc sai thứ tự params | Kiểm tra VNPAY_HASH_SECRET, đảm bảo sort params alphabetically |
| Amount error | Amount chưa nhân 100 | `vnp_Amount = amount * 100` |
| Return URL 404 | Route chưa đăng ký | Kiểm tra blueprint đã register và route name đúng |
| IPN không nhận | Server không public | Dùng ngrok hoặc deploy lên server có domain |

---

## So sánh nhanh VNPay vs MoMo

| Tiêu chí | VNPay | MoMo |
|----------|-------|------|
| Thuật toán chữ ký | HMAC-SHA512 | HMAC-SHA256 |
| Amount | `amount * 100` | `amount` (nguyên) |
| API Type | Redirect (GET) | REST API (POST) |
| IPN Method | GET | POST |
| Return | Query params | Query params |
| Thanh toán | ATM/Visa/QR | Ví MoMo/QR |