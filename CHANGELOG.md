# Changelog - SmartTuition

## [Cập nhật] - 2025-12-14

### ✨ Tính năng mới

#### Cải thiện Đồng bộ GitHub
- **Test Connection**: Thêm nút kiểm tra kết nối GitHub trước khi sync
- **Trạng thái kết nối**: Hiển thị trực quan (thành công/thất bại)
- **Thông tin sync**: Hiển thị thời gian backup cuối cùng
- **Xử lý lỗi chi tiết**: Thông báo lỗi rõ ràng và hướng dẫn khắc phục

#### Hệ thống tài liệu
- **GITHUB_SETUP.md**: Hướng dẫn chi tiết thiết lập GitHub từng bước
- **USER_GUIDE.md**: Tài liệu hướng dẫn sử dụng đầy đủ
- **data/README.md**: Hướng dẫn về cấu trúc dữ liệu và backup

#### Dữ liệu mẫu
- **data/tuition_backup.json**: File dữ liệu mẫu cho testing và demo
- Giúp người dùng mới dễ dàng bắt đầu

#### Script hỗ trợ
- **scripts/test-github.js**: Script Node.js để test GitHub connection offline
- **GitHub Actions example**: Template tự động nhắc nhở backup

### 🔧 Cải tiến

#### storageService.ts
- Validation đầu vào tốt hơn (token, owner, repo, path)
- Xử lý lỗi chi tiết hơn với thông báo tiếng Việt
- Phát hiện các lỗi phổ biến:
  - 401: Token không hợp lệ
  - 403: Thiếu quyền
  - 404: Repository/file không tồn tại
  - 409: Xung đột dữ liệu
- Thêm metadata vào backup (lastBackup, appVersion)
- Xử lý Unicode an toàn hơn
- Log chi tiết để debug

#### SettingsForm.tsx
- UI/UX được cải thiện:
  - Nút "Test kết nối" với màu sắc trực quan
  - Hiển thị trạng thái kết nối
  - Thông tin backup cuối cùng
  - Hướng dẫn nhanh ngay trong form
- Link trực tiếp tạo GitHub Token
- Layout responsive tốt hơn

#### README.md
- Viết lại hoàn toàn bằng tiếng Việt
- Thêm phần tính năng, hướng dẫn cài đặt
- Badge và icon cho dễ đọc
- Cấu trúc thư mục project
- Thông tin công nghệ sử dụng

### 📚 Tài liệu

#### Tài liệu mới
1. **GITHUB_SETUP.md** (≈1500 từ)
   - Hướng dẫn từng bước tạo repository
   - Hướng dẫn tạo Personal Access Token
   - Cấu hình trong ứng dụng
   - Xử lý sự cố thường gặp
   - Tips bảo mật

2. **docs/USER_GUIDE.md** (≈2000 từ)
   - Hướng dẫn đầy đủ các tính năng
   - Mẹo và thủ thuật
   - Xử lý sự cố
   - Workflow đề xuất

3. **data/README.md**
   - Giải thích cấu trúc dữ liệu
   - Hướng dẫn backup/restore
   - Lưu ý bảo mật

#### Tài liệu kỹ thuật
1. **scripts/test-github.js**
   - Script test kết nối GitHub
   - Kiểm tra repository, file, permissions
   - Chạy độc lập với ứng dụng

2. **.github/workflows/auto-backup.yml.example**
   - Template GitHub Actions
   - Tự động tạo issue nhắc backup
   - Có thể customize lịch

### 🐛 Sửa lỗi
- Fix lỗi Base64 encoding với ký tự Unicode
- Xử lý trường hợp file chưa tồn tại trên GitHub
- Validation SHA khi update file

### 🔒 Bảo mật
- Không log sensitive data (token)
- Khuyến nghị sử dụng Private Repository
- Hướng dẫn xóa token bị lộ

### 📦 Files thay đổi
```
Thêm mới:
+ data/tuition_backup.json
+ data/README.md
+ GITHUB_SETUP.md
+ docs/USER_GUIDE.md
+ scripts/test-github.js
+ .github/workflows/auto-backup.yml.example
+ CHANGELOG.md

Chỉnh sửa:
M README.md
M services/storageService.ts
M components/SettingsForm.tsx
```

### 🎯 Tương thích
- Tương thích ngược 100% với dữ liệu cũ
- Không cần migration
- Tất cả tính năng cũ vẫn hoạt động bình thường

### 💡 Hướng dẫn nâng cấp
1. Pull code mới
2. Chạy `npm install` (nếu có dependencies mới)
3. Chạy `npm run dev`
4. Vào tab **Cấu Hình** → Test kết nối GitHub
5. Đọc [GITHUB_SETUP.md](./GITHUB_SETUP.md) để setup

### 🚀 Coming Soon
- [ ] Tích hợp Google Drive backup
- [ ] Webhook thông báo khi có payment
- [ ] Export PDF template customizable
- [ ] Multi-language support
- [ ] Mobile app (PWA)

---

## [1.0.0] - Initial Release

### Features
- Quản lý học sinh và học phí
- Tạo phiếu thu với VietQR
- Điểm danh
- Đồng bộ GitHub cơ bản
- Xuất Excel/PDF
- Đa hồ sơ giáo viên

---

**Ghi chú**: Mọi thay đổi đều được test kỹ và tương thích với phiên bản cũ.
