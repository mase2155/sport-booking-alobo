# Kiểm tra local trước khi làm staging

Chạy trên máy cá nhân khi đã có `backend/.env`, CSDL `npm run db:migrate` + `npm run db:seed`.

## Lệnh bắt buộc (phải pass)

```powershell
cd backend
npm run lint
npm test

cd ../frontend
npm run build
```

## Chạy tay (2 terminal)

Phải vào đúng thư mục (`backend` / `frontend` — **không** có `package.json` ở thư mục gốc repo).

```powershell
# Terminal 1 — backend TRƯỚC
cd D:\HTH_211211680_UTC\backend
npm run dev
```

Đợi thấy log: `Đã kết nối SQL Server` và `API đang chạy tại http://localhost:5000/api/v1`.

```powershell
# Terminal 2 — frontend
cd D:\HTH_211211680_UTC\frontend
npm run dev
```

- API: http://localhost:5000/api/v1/health → `success: true`, `database: up`
- FE: http://localhost:5173 (proxy `/api` → `:5000`)

### Backend “không chạy” / chỉ thấy FE

| Triệu chứng | Cách xử lý |
|-------------|------------|
| `EADDRINUSE` / cổng 5000 đã dùng | `Get-NetTCPConnection -LocalPort 5000` → tắt PID cũ, hoặc `taskkill /PID <id> /F` (chỉ tiến trình node backend thừa) |
| Lỗi kết nối SQL | Bật SQL Server; kiểm tra `backend/.env` (`DB_*`) |
| `npm run dev` ở thư mục sai | Chỉ chạy trong `backend` hoặc `frontend` |
| Terminal backend trống, không log | Mở http://localhost:5000/api/v1/health — nếu OK thì backend vẫn chạy (log pino, khác banner Vite) |

**Lưu ý:** `npm run preview` không proxy API — chỉ dùng xem giao diện build, không thay dev.

## Smoke API tuỳ chọn

```powershell
cd backend
node scripts/run-smoke-report.js
```

## Kịch bản UI tối thiểu

Xem `docs/test-cases.md`. Ưu tiên: `/search`, `/booking`, đăng ký/đăng nhập, đặt + thanh toán, Admin login.
