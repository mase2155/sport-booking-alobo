# SportBooking — Website đặt sân thể thao trực tuyến

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-mssql-CC2927?logo=microsoftsqlserver&logoColor=white)

Hệ thống web giúp khách hàng **tìm sân, xem lịch trống, đặt chỗ và thanh toán trực tuyến** (mô phỏng), đồng thời cung cấp **khu vực quản trị** để vận hành sân, đơn đặt, giá thuê, tin tức và thống kê. Dự án giải quyết bài toán đặt sân thủ công (gọi điện, ghi sổ) bằng nền tảng số minh bạch về lịch và giá.

---

## Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| **Frontend** | React 18, Vite, React Router, Axios, TanStack Query, React Hook Form + Zod, Bootstrap 5, HTML5, CSS3 |
| **Backend** | Node.js, Express 5 (CommonJS), JWT, bcrypt, Multer, Zod, Pino |
| **Database & công cụ** | Microsoft SQL Server (`mssql`), Git, Postman, Cursor |

---

## Tính năng chính

### Khách hàng (Customer)

- Đăng ký / đăng nhập (JWT access token + refresh token cookie, mật khẩu bcrypt)
- Xem trang chủ, tin tức, đối tác, liên hệ
- Tìm kiếm và lọc sân theo loại, ngày, khung giờ, mức giá
- Xem chi tiết sân, bảng lịch theo ngày, đặt sân trực tuyến
- Thanh toán Online (mô phỏng) hoặc thanh toán tại sân
- Xem lịch sử đơn đặt, lọc theo ngày, xem chi tiết, hủy đơn theo quy định
- Quản lý hồ sơ cá nhân, đổi mật khẩu

### Quản trị (Admin)

- Dashboard thống kê: doanh thu, hiệu suất sân
- CRUD loại sân, sân, ảnh sân, bảng giá, ngày nghỉ/bảo trì
- Duyệt và cập nhật trạng thái đơn đặt, đối soát thanh toán
- Quản lý người dùng (tìm kiếm, khóa/mở tài khoản)
- CMS tin tức và đối tác hiển thị trên site

---

## Cấu trúc thư mục dự án

```text
📦 HTH_211211680_UTC
 ┣ 📂 database/          # migrations, seeds, SQL_FULL.sql
 ┣ 📂 backend/
 ┃  ┣ 📂 src/
 ┃  ┃  ┣ 📂 API/          # routes + controllers REST /api/v1
 ┃  ┃  ┣ 📂 modules/      # service + repository nghiệp vụ
 ┃  ┃  ┣ 📂 config/       # env, database, logger
 ┃  ┃  ┣ 📂 middlewares/  # auth, validate, upload, ...
 ┃  ┃  ┗ 📜 server.js
 ┃  ┣ 📂 scripts/         # migrate.js, seed.js
 ┃  ┗ 📂 tests/
 ┣ 📂 frontend/
 ┃  ┗ 📂 src/
 ┃     ┣ 📂 app/           # router, providers
 ┃     ┣ 📂 features/      # client + admin theo module
 ┃     ┣ 📂 api/           # Axios client
 ┃     ┗ 📂 styles/
 ┣ 📂 postman/             # collection & environment
 ┣ 📂 docs/                # kiểm thử, hướng dẫn verify
 ┗ 📜 STRUCTURE.md         # chi tiết kiến trúc & API
```

---

## Hướng dẫn cài đặt & chạy dự án

### Yêu cầu

- Node.js LTS (18+ khuyến nghị)
- SQL Server đang chạy (local hoặc remote)
- Git

### 1. Clone repository

```bash
git clone https://github.com/mase2155/HTH_211211680_UTC.git
cd HTH_211211680_UTC
```

### 2. Cài đặt thư viện

**Backend:**

```powershell
cd backend
copy .env.example .env
npm install
```

Chỉnh `backend/.env`: `DB_*`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, ...

**Frontend:**

```powershell
cd ../frontend
copy .env.example .env
npm install
```

### 3. Cấu hình CSDL

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

Script tạo database (nếu chưa có), chạy migration trong `database/migrations/` và seed dữ liệu mẫu. File gộp tham khảo: `database/SQL_FULL.sql`.

### 4. Chạy ứng dụng

**Terminal 1 — API:**

```powershell
cd backend
npm run dev
```

Mặc định: `http://localhost:5000` — API prefix `/api/v1`

**Terminal 2 — Giao diện:**

```powershell
cd frontend
npm run dev
```

Mặc định: `http://localhost:5173` (Vite proxy gọi backend)

- Đăng nhập Admin: tài khoản tạo sau `db:seed` theo `ADMIN_*` trong `.env`, truy cập `/admin`
- Kiểm thử tự động (đã migrate/seed): `cd backend && npm run verify` (chi tiết: `docs/local-verify.md`)
- Postman: import `postman/SportBooking.postman_environment.json` và `postman/SportBooking.postman_collection.json`

Build production frontend: `cd frontend && npm run build`

---

## Tác giả & Liên hệ

**Lê Đình Hùng**

- GitHub: [mase2155](https://github.com/mase2155)
- Email: dev.hung.utc@gmail.com

---

Đồ án liên quan: **Hà Thế Hưng (211211680)** — CNTT5 K62, GVHD: ThS. Đinh Công Tùng. Tài liệu báo cáo: `reportChap2.md`, `reportChap3.md`, `reportChap4.md`.