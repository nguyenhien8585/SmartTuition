# Thư mục Dữ liệu / Data Directory

Thư mục này chứa các file dữ liệu backup cho ứng dụng SmartTuition.

## File trong thư mục

### `tuition_backup.json`
File dữ liệu mẫu/backup chứa:
- Danh sách học sinh
- Lịch sử thanh toán
- Cấu hình ngân hàng
- Hồ sơ giáo viên

## Cách sử dụng GitHub Sync

### Bước 1: Tạo GitHub Repository
1. Đăng nhập vào GitHub
2. Tạo repository mới (khuyến nghị: **Private Repository**)
3. Đặt tên, ví dụ: `tuition-data` hoặc `smarttuition-backup`

### Bước 2: Tạo Personal Access Token
1. Vào GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Chọn scope: `repo` (Full control of private repositories)
4. Copy token được tạo (bắt đầu bằng `ghp_...`)

### Bước 3: Cấu hình trong SmartTuition
1. Mở ứng dụng, vào tab **Cấu Hình**
2. Kéo xuống phần **Đồng bộ GitHub (Cloud)**
3. Điền thông tin:
   - **Personal Access Token**: Paste token vừa tạo
   - **GitHub Username**: Tên đăng nhập GitHub của bạn
   - **Repository Name**: Tên repo vừa tạo
   - **File Path**: `data/tuition_backup.json` (mặc định)

### Bước 4: Đồng bộ dữ liệu
- **Lưu lên GitHub**: Click nút "Lưu lên GitHub" để đẩy dữ liệu từ máy lên cloud
- **Tải về máy**: Click nút "Tải về máy" để kéo dữ liệu từ GitHub về

## Cấu trúc dữ liệu

```json
{
  "version": 1,
  "timestamp": "2025-12-14T00:00:00.000Z",
  "students": [...],
  "payments": [...],
  "bankConfig": {...},
  "profiles": [...]
}
```

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**:
- Luôn sử dụng **Private Repository** cho dữ liệu cá nhân
- Không chia sẻ Personal Access Token với ai
- Token được lưu trong localStorage của trình duyệt, không gửi đi đâu khác
- Xóa token khỏi GitHub nếu không còn sử dụng

## Backup định kỳ

Khuyến nghị:
- Backup dữ liệu lên GitHub sau mỗi buổi thu học phí
- Tải về file .JSON thủ công vào máy tính định kỳ (từ tab Cấu Hình)
- Giữ ít nhất 2 bản backup ở các nơi khác nhau
