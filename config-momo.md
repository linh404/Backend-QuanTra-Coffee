# Hướng dẫn tích hợp thanh toán MoMo (Flask)

Hướng dẫn này có thể áp dụng cho bất kỳ project Flask nào.

---

## Mục lục

1. [Đăng ký Sandbox](#1-đăng-ký-sandbox)
2. [Cấu hình Environment](#2-cấu-hình-environment)
3. [Config Class](#3-config-class)
4. [MoMo Service](#4-momo-service)
5. [Routes](#5-routes)
6. [Database Migration](#6-database-migration)
7. [Sử dụng trong Checkout](#7-sử-dụng-trong-checkout)
8. [Frontend Integration](#8-frontend-integration)
9. [Query Transaction Status](#9-query-transaction-status)
10. [Lên Production](#10-lên-production)
11. [Mã lỗi MoMo](#11-mã-lỗi-momo)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Đăng ký Sandbox

MoMo cung cấp **sandbox credentials công khai** để test mà không cần đăng ký:

| Thông tin | Giá trị |
|-----------|---------|
| Partner Code | `MOMONPMB20210629` |
| Access Key | `Q2XhhSdgpKUlQ4Ky` |
| Secret Key | `k6B53GQKSjktZGJBK2MyrDa7w9S6RyCf` |
| Endpoint | `https://test-payment.momo.vn/v2/gateway/api/create` |
| Query Endpoint | `https://test-payment.momo.vn/v2/gateway/api/query` |

Tài liệu chính thức: https://developers.momo.vn/v3/vi/docs/payment/api/wallet/onetime

---

## 2. Cấu hình Environment

Thêm vào file `.env`:

```bash
# MoMo Payment - Sandbox (Test)
MOMO_PARTNER_CODE=MOMONPMB20210629
MOMO_ACCESS_KEY=Q2XhhSdgpKUlQ4Ky
MOMO_SECRET_KEY=k6B53GQKSjktZGJBK2MyrDa7w9S6RyCf
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_QUERY_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/query
```

> [!WARNING]
> Đây là credentials **sandbox công khai** dùng để test.
> Khi lên Production, đăng ký với MoMo để nhận credentials riêng.
> KHÔNG commit `.env` vào git.

---

## 3. Config Class

Thêm vào `config.py`:

```python
import os

class Config:
    # MoMo Payment Configuration
    MOMO_PARTNER_CODE = os.environ.get('MOMO_PARTNER_CODE', 'MOMONPMB20210629')
    MOMO_ACCESS_KEY = os.environ.get('MOMO_ACCESS_KEY', 'Q2XhhSdgpKUlQ4Ky')
    MOMO_SECRET_KEY = os.environ.get('MOMO_SECRET_KEY', 'k6B53GQKSjktZGJBK2MyrDa7w9S6RyCf')
    MOMO_ENDPOINT = os.environ.get('MOMO_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/create')
    MOMO_QUERY_ENDPOINT = os.environ.get('MOMO_QUERY_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/query')
```

---

## 4. MoMo Service

Tạo file `services/momo_service.py`:

```python
"""MoMo Payment Service"""

import hashlib
import hmac
import uuid
import requests
from flask import current_app, url_for


class MoMoService:
    """Service for MoMo payment integration"""

    @staticmethod
    def get_config():
        """Get MoMo configuration from app config"""
        return {
            'partner_code': current_app.config.get('MOMO_PARTNER_CODE', ''),
            'access_key': current_app.config.get('MOMO_ACCESS_KEY', ''),
            'secret_key': current_app.config.get('MOMO_SECRET_KEY', ''),
            'endpoint': current_app.config.get('MOMO_ENDPOINT'),
            'query_endpoint': current_app.config.get('MOMO_QUERY_ENDPOINT')
        }

    @staticmethod
    def generate_signature(raw_signature: str, secret_key: str) -> str:
        """Generate HMAC-SHA256 signature"""
        return hmac.new(
            secret_key.encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    def create_payment_request(order_id: str, amount: int, order_info: str,
                                return_url: str = None,
                                notify_url: str = None) -> dict:
        """
        Create MoMo payment request.

        Args:
            order_id: Unique order ID (phải unique mỗi lần gọi)
            amount: Payment amount in VND (integer, KHÔNG nhân 100)
            order_info: Order description
            return_url: URL redirect sau thanh toán
            notify_url: IPN callback URL

        Returns:
            dict with 'success', 'pay_url', 'qr_code_url', 'request_id', 'error'
        """
        config = MoMoService.get_config()
        request_id = str(uuid.uuid4())

        # Build URLs - thay đổi theo route/blueprint của bạn
        if return_url is None:
            return_url = url_for('payment.momo_return', _external=True)
        if notify_url is None:
            notify_url = url_for('payment.momo_ipn', _external=True)

        request_type = "captureWallet"
        extra_data = ""

        # QUAN TRỌNG: Raw signature PHẢI theo thứ tự alphabetical
        raw_signature = (
            f"accessKey={config['access_key']}"
            f"&amount={amount}"
            f"&extraData={extra_data}"
            f"&ipnUrl={notify_url}"
            f"&orderId={order_id}"
            f"&orderInfo={order_info}"
            f"&partnerCode={config['partner_code']}"
            f"&redirectUrl={return_url}"
            f"&requestId={request_id}"
            f"&requestType={request_type}"
        )

        signature = MoMoService.generate_signature(
            raw_signature, config['secret_key']
        )

        request_body = {
            "partnerCode": config['partner_code'],
            "accessKey": config['access_key'],
            "requestId": request_id,
            "amount": str(amount),
            "orderId": order_id,
            "orderInfo": order_info,
            "redirectUrl": return_url,
            "ipnUrl": notify_url,
            "extraData": extra_data,
            "requestType": request_type,
            "signature": signature,
            "lang": "vi"
        }

        try:
            response = requests.post(
                config['endpoint'],
                json=request_body,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            result = response.json()

            if result.get('resultCode') == 0:
                return {
                    'success': True,
                    'pay_url': result.get('payUrl'),
                    'qr_code_url': result.get('qrCodeUrl'),
                    'deeplink': result.get('deeplink'),
                    'request_id': request_id,
                    'error': None
                }
            else:
                return {
                    'success': False,
                    'pay_url': None,
                    'request_id': request_id,
                    'error': result.get('message', 'Unknown error'),
                    'result_code': result.get('resultCode')
                }
        except requests.RequestException as e:
            current_app.logger.error(f"MoMo API request failed: {e}")
            return {
                'success': False,
                'pay_url': None,
                'request_id': request_id,
                'error': str(e)
            }

    @staticmethod
    def verify_ipn_signature(data: dict) -> bool:
        """
        Verify IPN callback signature from MoMo.

        Args:
            data: IPN callback data (JSON body)

        Returns:
            True if signature is valid
        """
        config = MoMoService.get_config()
        received_signature = data.get('signature', '')

        # QUAN TRỌNG: Thứ tự alphabetical, khác với create request
        raw_signature = (
            f"accessKey={config['access_key']}"
            f"&amount={data.get('amount', '')}"
            f"&extraData={data.get('extraData', '')}"
            f"&message={data.get('message', '')}"
            f"&orderId={data.get('orderId', '')}"
            f"&orderInfo={data.get('orderInfo', '')}"
            f"&orderType={data.get('orderType', '')}"
            f"&partnerCode={data.get('partnerCode', '')}"
            f"&payType={data.get('payType', '')}"
            f"&requestId={data.get('requestId', '')}"
            f"&responseTime={data.get('responseTime', '')}"
            f"&resultCode={data.get('resultCode', '')}"
            f"&transId={data.get('transId', '')}"
        )

        expected_signature = MoMoService.generate_signature(
            raw_signature, config['secret_key']
        )
        return hmac.compare_digest(received_signature, expected_signature)

    @staticmethod
    def query_transaction_status(order_id: str, request_id: str) -> dict:
        """
        Query transaction status from MoMo.

        Args:
            order_id: Order ID used in payment request
            request_id: Request ID used in payment request

        Returns:
            dict with transaction status details
        """
        config = MoMoService.get_config()

        raw_signature = (
            f"accessKey={config['access_key']}"
            f"&orderId={order_id}"
            f"&partnerCode={config['partner_code']}"
            f"&requestId={request_id}"
        )

        signature = MoMoService.generate_signature(
            raw_signature, config['secret_key']
        )

        request_body = {
            "partnerCode": config['partner_code'],
            "accessKey": config['access_key'],
            "requestId": request_id,
            "orderId": order_id,
            "signature": signature,
            "lang": "vi"
        }

        try:
            response = requests.post(
                config['query_endpoint'],
                json=request_body,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            return response.json()
        except requests.RequestException as e:
            current_app.logger.error(f"MoMo query failed: {e}")
            return {'error': str(e)}

    @staticmethod
    def is_payment_successful(result_code: int) -> bool:
        """Check if payment successful (code 0)"""
        return result_code == 0
```

> [!IMPORTANT]
> **Thuật toán chữ ký:** MoMo sử dụng **HMAC-SHA256** (khác với VNPay dùng HMAC-SHA512).
> **Amount:** MoMo nhận amount nguyên (VND), **KHÔNG nhân 100**.
> **Raw signature:** Các trường PHẢI theo **thứ tự alphabetical** và nối bằng `&`.

---

## 5. Routes

Tạo routes cho MoMo callback:

```python
from flask import Blueprint, request, jsonify, redirect, url_for, flash
from services.momo_service import MoMoService

payment_bp = Blueprint('payment', __name__)


@payment_bp.route('/momo/ipn', methods=['POST'])
def momo_ipn():
    """MoMo IPN callback - server to server (POST request)"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'message': 'Invalid data'}), 400

        # Verify chữ ký
        if not MoMoService.verify_ipn_signature(data):
            return jsonify({'message': 'Invalid signature'}), 400

        order_id = data.get('orderId')
        result_code = data.get('resultCode')
        trans_id = data.get('transId')

        if MoMoService.is_payment_successful(result_code):
            # TODO: Cập nhật order trong database
            # order = Order.query.filter_by(order_code=order_id).first()
            # order.payment_status = 'paid'
            # order.momo_trans_id = str(trans_id)
            # db.session.commit()
            pass

        # MoMo yêu cầu trả về HTTP 204 hoặc 200
        return jsonify({'message': 'Success'}), 200

    except Exception as e:
        current_app.logger.error(f"MoMo IPN error: {e}")
        return jsonify({'message': 'Internal error'}), 500


@payment_bp.route('/momo/return')
def momo_return():
    """MoMo return URL - user redirect after payment"""
    order_id = request.args.get('orderId')
    result_code = request.args.get('resultCode')

    if result_code and int(result_code) == 0:
        flash('Thanh toán MoMo thành công!', 'success')
    else:
        flash('Thanh toán chưa thành công. Vui lòng thử lại.', 'warning')

    return redirect(url_for('order.detail', order_code=order_id))
```

> [!NOTE]
> **MoMo IPN là POST request** (khác với VNPay IPN là GET request).
> MoMo gửi JSON body, bạn cần verify signature và trả HTTP 200/204.

---

## 6. Database Migration

Thêm cột theo dõi MoMo vào bảng orders:

```sql
-- Thêm cột momo_request_id
ALTER TABLE orders ADD COLUMN momo_request_id VARCHAR(50) NULL;

-- Thêm cột momo_trans_id
ALTER TABLE orders ADD COLUMN momo_trans_id VARCHAR(50) NULL;

-- Nếu dùng ENUM cho payment_method, thêm MOMO:
-- ALTER TABLE orders MODIFY COLUMN payment_method
--   ENUM('COD', 'MOMO', 'VNPAY', 'MOCK_TRANSFER') NOT NULL DEFAULT 'COD';

-- Nếu dùng ENUM cho payment_status, thêm paid:
-- ALTER TABLE orders MODIFY COLUMN payment_status
--   ENUM('unpaid', 'paid', 'mock_paid') NOT NULL DEFAULT 'unpaid';

-- Nếu dùng ENUM cho event_type, thêm momo_paid:
-- ALTER TABLE order_events MODIFY COLUMN event_type
--   ENUM('placed','paid','momo_paid','confirmed','fulfilled',
--        'completed','cancelled','restocked') NOT NULL;

-- Verify
DESCRIBE orders;
```

---

## 7. Sử dụng trong Checkout

```python
from services.momo_service import MoMoService

# Trong checkout view
if payment_method == 'MOMO':
    result = MoMoService.create_payment_request(
        order_id=order.order_code,   # Phải unique mỗi lần gọi
        amount=int(total_amount),    # VND, số nguyên (KHÔNG nhân 100)
        order_info=f'Thanh toán đơn hàng {order.order_code}'
    )

    if result['success']:
        order.momo_request_id = result['request_id']
        db.session.commit()
        return redirect(result['pay_url'])
    else:
        flash(f'Lỗi MoMo: {result["error"]}', 'error')
```

---

## 8. Frontend Integration

Thêm MoMo vào form checkout:

```html
<!-- Payment Method Radio -->
<div class="form-check mb-2">
    <input class="form-check-input" type="radio"
           name="payment_method" value="MOMO" id="payment_MOMO">
    <label class="form-check-label" for="payment_MOMO">
        <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Circle.png"
             alt="MoMo" style="width: 20px; height: 20px; vertical-align: middle;">
        Thanh toán qua MoMo
    </label>
</div>

<!-- MoMo Info Panel (ẩn mặc định) -->
<div id="momo-info" class="mt-3 p-3 border rounded" style="display: none;
    background: linear-gradient(135deg, #af1f6b 0%, #d82d7e 100%);">
    <div class="text-white">
        <h6 class="mb-2">
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Circle.png"
                 alt="MoMo" style="width: 24px; height: 24px; vertical-align: middle;">
            Thanh toán qua MoMo
        </h6>
        <p class="mb-2"><small>Bạn sẽ được chuyển đến trang thanh toán MoMo.</small></p>
        <ul class="list-unstyled mb-0" style="font-size: 0.85rem;">
            <li>• Quét mã QR bằng app MoMo</li>
            <li>• Thanh toán an toàn, nhanh chóng</li>
            <li>• Đơn hàng được xác nhận ngay sau khi thanh toán</li>
        </ul>
    </div>
</div>
```

```javascript
// Xử lý hiển thị MoMo info khi chọn
document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const momoInfo  = document.getElementById('momo-info');
        const submitText = document.getElementById('submit-text');
        const submitBtn  = document.getElementById('submit-btn');

        if (this.value === 'MOMO') {
            momoInfo.style.display = 'block';
            submitText.textContent = 'Thanh toán với MoMo';
            submitBtn.style.background = 'linear-gradient(135deg, #af1f6b 0%, #d82d7e 100%)';
            submitBtn.style.border = 'none';
        } else {
            momoInfo.style.display = 'none';
        }
    });
});
```

---

## 9. Query Transaction Status

Kiểm tra trạng thái giao dịch (dùng khi cần verify thủ công):

```python
# Trong admin view hoặc cron job
result = MoMoService.query_transaction_status(
    order_id=order.order_code,
    request_id=order.momo_request_id
)

if result.get('resultCode') == 0:
    print(f"Giao dịch thành công, transId: {result.get('transId')}")
elif result.get('resultCode') == 1000:
    print("Giao dịch đang chờ xử lý")
else:
    print(f"Lỗi: {result.get('message')}")
```

---

## 10. Lên Production

Khi lên production:

1. Đăng ký tài khoản Business với MoMo tại: https://business.momo.vn
2. Nhận credentials production (partnerCode, accessKey, secretKey)
3. Đổi `.env`:
   ```bash
   MOMO_PARTNER_CODE=YOUR_PRODUCTION_PARTNER_CODE
   MOMO_ACCESS_KEY=YOUR_PRODUCTION_ACCESS_KEY
   MOMO_SECRET_KEY=YOUR_PRODUCTION_SECRET_KEY
   MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
   MOMO_QUERY_ENDPOINT=https://payment.momo.vn/v2/gateway/api/query
   ```
4. Đảm bảo IPN URL có **HTTPS** và accessible từ internet
5. Cấu hình domain whitelist trên MoMo Business portal

---

## 11. Mã lỗi MoMo

| Code | Mô tả |
|------|-------|
| `0` | Thành công |
| `9000` | Giao dịch được khởi tạo, chờ user xác nhận |
| `1000` | Giao dịch đang chờ xử lý |
| `1001` | Giao dịch thất bại do không đủ tiền |
| `1002` | Giao dịch bị từ chối bởi MoMo |
| `1003` | Giao dịch bị đảo ngược (reversed) |
| `1004` | Giao dịch thất bại do hết hạn thanh toán |
| `1005` | Giao dịch thất bại do OTP không hợp lệ |
| `1006` | Giao dịch thất bại do lỗi hệ thống MoMo |
| `1007` | Giao dịch bị từ chối vì tài khoản không đủ thông tin |
| `1026` | Giao dịch bị giới hạn theo quy định của MoMo |
| `1080` | Giao dịch bị hoàn tiền (refund) |
| `1081` | Giao dịch hoàn tiền bị từ chối |
| `2019` | orderId không hợp lệ hoặc trùng |

---

## 12. Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|--------|-------------|-----------|
| Signature mismatch | Sai thứ tự fields trong raw signature | Kiểm tra thứ tự alphabetical chính xác |
| `orderId` trùng | MoMo yêu cầu orderId unique | Thêm timestamp hoặc UUID vào order code |
| IPN không nhận | Server không public | Dùng ngrok: `ngrok http 5000` |
| `resultCode: 41` | Amount không hợp lệ | Amount phải là số nguyên dương, ≥ 1000 VND |
| Timeout | MoMo API chậm | Tăng timeout lên 30-60s |
| `requests` import error | Chưa cài package | `pip install requests` |

---

## Dependency cần thiết

```bash
pip install requests
```

Thêm vào `requirements.txt`:

```
requests>=2.28.0
```

---

## So sánh nhanh MoMo vs VNPay

| Tiêu chí | MoMo | VNPay |
|----------|------|-------|
| Thuật toán chữ ký | HMAC-SHA256 | HMAC-SHA512 |
| Amount | `amount` (nguyên) | `amount * 100` |
| API Type | REST API (POST) | Redirect (GET) |
| IPN Method | POST (JSON body) | GET (query params) |
| Return | Query params | Query params |
| Thanh toán | Ví MoMo / QR | ATM / Visa / QR |
| Sandbox | Credentials công khai | Cần đăng ký |
| Query API | Có | Không có sẵn |
