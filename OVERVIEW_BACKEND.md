# Tổng quan Backend - Dự án QuanTra-Coffee (Green Store)

Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc, công nghệ và cấu trúc dữ liệu của phần Backend trong dự án QuanTra-Coffee.

## 1. Công nghệ cốt lõi (Technology Stack)

- **Framework**: [Next.js](https://nextjs.org/) (Sử dụng App Router).
- **Ngôn ngữ**: TypeScript.
- **Cơ sở dữ liệu**: MySQL (Sử dụng thư viện `mysql2` cho các truy vấn bất đồng bộ).
- **Xác thực (Authentication)**: [NextAuth.js](https://next-auth.js.org/) kết hợp với `bcrypt` để băm mật khẩu.
- **Thanh toán**: Tích hợp cổng thanh toán VNPay.
- **Trí tuệ nhân tạo (AI)**: Sử dụng Google Generative AI (Gemini) và GROQ để hỗ trợ chatbot và xử lý nội dung.
- **Công cụ kiểm thử**: Vitest.

## 2. Kiến trúc hệ thống

Backend được xây dựng theo mô hình **API Routes** tích hợp sẵn trong Next.js, cho phép triển khai cả server-side logic và API endpoints trong cùng một project.

### Cấu trúc thư mục chính:
- `/src/app/api`: Chứa các API endpoints (Sản phẩm, Đơn hàng, Người dùng, Chat...).
- `/src/lib`: Chứa các hàm tiện ích, kết nối CSDL (`db.ts`), cấu hình thanh toán (`vnpay.ts`), và logic AI (`llm.ts`).
- `/src/types`: Định nghĩa các kiểu dữ liệu TypeScript.
- `schema.sql`: File nguồn chứa toàn bộ cấu trúc bảng và quan hệ cơ sở dữ liệu.

## 3. Mô hình dữ liệu (Database Schema)

Hệ thống sử dụng cơ sở dữ liệu quan hệ MySQL với các bảng chính:

- **Users**: Lưu trữ thông tin người dùng, phân quyền (buyer/admin).
- **Products & Categories**: Quản lý sản phẩm, danh mục, hình ảnh và thuộc tính sản phẩm.
- **Cart & Order**: Quản lý giỏ hàng và quy trình đặt hàng, bao gồm cả trạng thái thanh toán và vận chuyển.
- **User Addresses**: Lưu trữ địa chỉ giao hàng với tích hợp tọa độ (Latitude/Longitude).
- **Tags & Maps**: Hệ thống gắn thẻ sản phẩm và liên kết dữ liệu.

## 4. Các tính năng chính của Backend

1. **Quản lý Sản phẩm**: API hỗ trợ tìm kiếm, lọc theo giá, danh mục, trạng thái khuyến mãi và phân trang.
2. **Quy trình Order & Thanh toán**: Xử lý tạo đơn hàng, tính toán phí ship, và kết nối với VNPay để thực hiện giao dịch online.
3. **Smart Chatbot**: Tích hợp LLM để hỗ trợ khách hàng trả lời các câu hỏi về sản phẩm và dịch vụ.
4. **Xác thực và Phân quyền**: Bảo mật thông tin người dùng bằng JWT thông qua NextAuth.
5. **Hỗ trợ bản đồ**: Cung cấp dữ liệu vị trí và geocoding để phục vụ giao hàng.

## 5. Kết luận

Backend của QuanTra-Coffee là một hệ thống hiện đại, tận dụng sức mạnh của Next.js để tối ưu hóa hiệu suất và khả năng mở rộng. Việc tích hợp sẵn các dịch vụ như VNPay và AI giúp dự án đáp ứng tốt các nhu cầu của một trang thương mại điện tử chuyên nghiệp.
