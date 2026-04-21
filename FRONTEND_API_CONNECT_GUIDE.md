# Frontend API Connect Guide

## 1) Backend base URL + port

- Local backend URL: http://localhost:3000
- Port mac dinh: 3000
- Ly do: script dev/start trong package.json dang dung next dev va next start khong override port.
- Neu muon doi port, set env PORT (vi du PORT=3001) khi chay.

## 2) Auth mechanism (quan trong)

Backend ho tro 2 cach gui token:

- Cookie token (token) sau khi login
- Authorization header: Bearer <jwt>

Khuyen nghi cho frontend web:

- Dung credentials: include de gui cookie cho cac API can dang nhap.
- Hoac gui Authorization header neu app tach domain/SSR flow rieng.

Luu y response 401 co the co 2 format:

- { success: false, error: "Authentication required" }
- { error: "Unauthorized" } (middleware chan truoc route)

## 3) Common response shape

Thuong gap:

- Thanh cong: { success: true, data: ... }
- Loi: { success: false, error: "..." }

Nhung khong phai endpoint nao cung dong nhat 100%.
Frontend nen uu tien check HTTP status + success field neu co.

## 4) Endpoint catalog (de frontend connect)

### Public/Auth

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/categories
- GET /api/products
- GET /api/products/[slug]
- GET /api/products/search
- GET /api/products/by-category
- GET /api/products/detail
- GET /api/products/promotions
- GET /api/products/related
- GET /api/products/similar
- GET /api/products/compare
- POST /api/products/reviews
- GET /api/products/[slug]/review-summary
- GET /api/products/[slug]/reviews
- POST /api/contact
- GET /api/search/suggestions
- POST /api/chat
- GET /api/geocode
- GET /api/geocode/suggestions

### User profile/address

- GET /api/me
- PUT /api/me
- GET /api/me/addresses
- POST /api/me/addresses
- PUT /api/me/addresses/[id]
- DELETE /api/me/addresses/[id]

### Cart

- GET /api/cart
- POST /api/cart/items
- DELETE /api/cart/items/[id]

### Checkout/Orders

- POST /api/checkout
- GET /api/orders
- GET /api/orders/[id]
- POST /api/orders/[id]/cancel
- GET /api/orders/[id]/status
- POST /api/orders/[id]/mark-paid
- POST /api/orders/[id]/mark-shipped
- POST /api/orders/[id]/confirm-delivery

### Payment

- POST /api/payment/vnpay/create
- GET /api/payment/vnpay/return

### Admin

- GET /api/admin/all-products
- GET /api/admin/products
- POST /api/admin/products
- PUT /api/admin/products
- DELETE /api/admin/products
- GET /api/admin/products/[id]/images
- POST /api/admin/products/[id]/images
- PUT /api/admin/products/[id]/images
- DELETE /api/admin/products/[id]/images
- GET /api/admin/products/[id]/tags
- POST /api/admin/products/[id]/tags
- DELETE /api/admin/products/[id]/tags
- GET /api/admin/orders
- GET /api/admin/orders/[id]
- PATCH /api/admin/orders/[id]
- GET /api/admin/users
- PUT /api/admin/users
- GET /api/admin/promotions
- POST /api/admin/promotions
- PUT /api/admin/promotions
- GET /api/admin/revenue

## 5) Core request payloads cho frontend

### 5.1 Register

POST /api/auth/register

Body JSON:
{
  "email": "buyer@example.com",
  "password": "secret123",
  "name": "Buyer",
  "role": "buyer",
  "line1": "12 Nguyen Hue",
  "city": "HCM",
  "district": "Quan 1",
  "ward": "Ben Nghe"
}

### 5.2 Login

POST /api/auth/login

Body JSON:
{
  "email": "buyer@example.com",
  "password": "secret123"
}

Ket qua:

- Tra ve user + token
- Set cookie token (httpOnly)

### 5.3 Product list

GET /api/products?page=1&limit=10&q=ca%20phe&category=36&minPrice=100000&maxPrice=300000&sale=true&sortBy=price_asc

sortBy support:

- price_asc
- price_desc
- name_asc
- name_desc
- newest

### 5.4 Add item vao cart

POST /api/cart/items

Body JSON:
{
  "productId": 5456,
  "qty": 2
}

### 5.5 Checkout

POST /api/checkout

Body JSON:
{
  "addressId": 101,
  "paymentMethod": "COD"
}

paymentMethod hop le:

- COD
- VNPAY

## 6) Frontend fetch template

### 6.1 Browser app dung cookie session

const API_BASE = "http://localhost:3000";

export async function api(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

### 6.2 Neu dung Bearer token

const token = "<jwt-token>";

fetch("http://localhost:3000/api/me", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  credentials: "include",
});

## 7) Integration notes cho frontend dev

- /api/me route uu tien Authorization Bearer token.
- Cac route dung auth-utils co the nhan Bearer hoac cookie token.
- Neu bi 401, frontend nen redirect login va clear local session.
- Middleware dang bao ve cac nhom: /api/cart, /api/me, /api/orders, /api/payment, /api/checkout, /api/admin.
- Cac endpoint admin can role admin.

## 8) Known caveats

- Response schema giua cac route chua dong nhat hoan toan.
- Mot so route comment mo ta duong dan co [imageId]/[tagId], nhung endpoint thuc te expose theo file-system route hien tai.
- Frontend nen theo dung endpoint catalog trong tai lieu nay de connect.

## 9) Quick smoke test commands

Login:

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"secret123"}'

Get products:

curl "http://localhost:3000/api/products?page=1&limit=10"

Get cart (can auth):

curl "http://localhost:3000/api/cart"
