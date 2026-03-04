# Kế Hoạch Phát Triển Hệ Thống WMS Đa Kênh

**Mục tiêu:** Xây dựng backend quản lý kho đồng bộ dữ liệu giữa hệ thống nội bộ với Shopee & TikTok Shop.
**Công nghệ:** NestJS, PostgreSQL (Supabase), TypeORM.
**Thời gian dự kiến:** 5 Tuần

---

## Tuần 1: Khởi tạo Hạ tầng & Database (Phase 1)

_Mục tiêu: Dựng xong khung kiến trúc NestJS và chốt hạ toàn bộ thiết kế Database trên Supabase._

- [x] Khởi tạo project NestJS (`nest new wms-backend`).
- [x] Cài đặt các thư viện lõi: `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/config`.
- [x] Thiết lập file `.env` và cấu hình kết nối Supabase trong `app.module.ts` (nhớ bật `autoLoadEntities: true`).
- [x] **Code Entity Khu Vực 1:** Tạo `Account`, `ConnectedShop` (Nhớ thiết lập quan hệ 1-N).
- [x] **Code Entity Khu Vực 2:** Tạo `Product`, `ProductVariant`, `Inventory`.
- [x] **Code Entity Khu Vực 3 & 4:** Tạo `ChannelMapping`, `Order`, `OrderItem`.
- [x] Khởi động project (`npm run start:dev`) kiểm tra Supabase xem các bảng đã được TypeORM tự động tạo chuẩn xác chưa.

## Tuần 2: Xây dựng Lõi Nội Bộ (Phase 2)

_Mục tiêu: Quản lý độc lập được danh mục hàng hóa (như các sản phẩm bỉm, sữa, quần áo trẻ em) và tồn kho._

- [x] Cài đặt `bcrypt` và code API Đăng ký / Đăng nhập cho chủ shop.
- [x] Setup `JwtModule` và viết `AuthGuard` để bảo vệ các API hệ thống.
- [x] Viết API thêm mới Sản phẩm cha kèm các SKUs con (áp dụng thuộc tính `cascade: true`).
- [x] Viết `InventoryService`: Code các hàm `lockStock`, `releaseStock`, `deductStock`.
- [x] Áp dụng khóa bi quan (`lock: { mode: 'pessimistic_write' }`) vào hàm `lockStock`.
- [x] Dùng Postman test thử luồng tạo sản phẩm và trừ kho thủ công.

## Tuần 3: Xây dựng "Cây Cầu Nối" (Phase 3)

_Mục tiêu: Thiết lập bảng ánh xạ, chuẩn bị sẵn sàng ghép nối mã SKU nội bộ với mã trên sàn._

- [x] Code API thêm thông tin cấu hình gian hàng vào bảng `CONNECTED_SHOPS` (chuẩn bị sẵn các trường lưu access/refresh token).
- [ ] Code API CRUD cho bảng `CHANNEL_MAPPINGS` (Thêm, sửa, xóa mapping).
- [ ] Viết API cho phép map thủ công: `Variant_ID_Nội_Bộ` <---> `Platform_SKU_ID`.
- [ ] Đánh `@Index` kết hợp cho 2 cột `shop_id` và `platform_sku_id` để tối ưu tốc độ truy vấn sau này.

## Tuần 4: Xử lý Đơn Hàng & Sự Kiện (Phase 4)

_Mục tiêu: Đảm bảo giao dịch đơn hàng diễn ra an toàn, tính toán kho không bao giờ bị âm._

- [ ] Code logic `createOrder` sử dụng `QueryRunner` và `EntityManager` để bọc Transaction.
- [ ] Gọi hàm `lockStock` (từ `InventoryService`) vào bên trong Transaction của `createOrder`.
- [ ] Cài đặt thư viện `@nestjs/event-emitter`.
- [ ] Bắn event `inventory.stock_changed` ngay sau khi chốt Transaction (`commitTransaction()`) thành công.
- [ ] Viết một Event Listener hứng event trên và in ra `console.log` để xác nhận luồng sự kiện đã thông.

## Tuần 5: Tích hợp API Sàn & Webhook (Phase 5)

_Mục tiêu: Tự động hóa hoàn toàn với thế giới bên ngoài, đồng bộ dữ liệu thực tế cho gian hàng._

- [ ] Đăng ký ứng dụng trên Developer Portal của Shopee và TikTok Shop lấy App Key/Secret.
- [ ] Viết API xử lý luồng OAuth2: Chuyển hướng lấy code -> Đổi lấy `access_token` -> Lưu vào DB.
- [ ] Cài đặt Background Job (`@nestjs/schedule`) để tự động làm mới (refresh) token trước khi hết hạn.
- [ ] Viết API Endpoint Public mở webhook hứng dữ liệu đơn hàng từ Shopee/TikTok.
- [ ] Trong controller hứng webhook: Code logic tra cứu `CHANNEL_MAPPINGS` -> Lấy `variant_id` -> Gọi hàm tạo đơn ở Tuần 4.
- [ ] Cập nhật Listener ở Tuần 4: Gọi trực tiếp API `update_stock` của sàn để đồng bộ lại số tồn kho hiển thị thay vì in log.
- [ ] Thực hiện test End-to-End với một đơn hàng nháp.
