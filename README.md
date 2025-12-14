<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SmartTuition - Ứng dụng Thu Học Phí Thông Minh 📚💰

Ứng dụng chuyên nghiệp giúp giáo viên quản lý học phí, tạo phiếu thu tự động với mã QR VietQR, và đồng bộ dữ liệu lên GitHub.

## ✨ Tính năng chính

- 📝 **Nhập liệu thông minh**: Nhập Excel hoặc nhập thủ công với AI hỗ trợ
- 💳 **Tạo QR tự động**: Tích hợp VietQR cho tất cả ngân hàng Việt Nam
- 📊 **Quản lý điểm danh**: Theo dõi buổi học, tính toán khấu trừ tự động
- 💰 **Theo dõi thanh toán**: Ghi nhận tiền mặt và chuyển khoản
- 👥 **Đa hồ sơ**: Hỗ trợ nhiều giáo viên trên cùng thiết bị
- ☁️ **Đồng bộ GitHub**: Lưu trữ dữ liệu an toàn trên cloud
- 🔄 **Auto-Sync**: Tự động đồng bộ dữ liệu khi mở app ⚡ MỚI
- 📤 **Xuất báo cáo**: Excel và PDF chỉ trong 1 click

## 🚀 Hướng dẫn chạy ứng dụng

### Yêu cầu hệ thống
- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn

### Cài đặt và chạy

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Thiết lập Gemini API Key (tùy chọn):**
   - Tạo file `.env.local` trong thư mục gốc
   - Thêm dòng: `GEMINI_API_KEY=your_api_key_here`
   - API key này dùng cho tính năng nhập liệu thông minh với AI

3. **Chạy ứng dụng:**
   ```bash
   npm run dev
   ```

4. **Mở trình duyệt:**
   - Truy cập: `http://localhost:5173`
   - Mã đăng nhập mặc định: `123456789@2025@`

## 🔐 Bảo mật

- Mã đăng nhập bảo vệ ứng dụng
- Dữ liệu lưu trong localStorage của trình duyệt
- Đồng bộ GitHub sử dụng Personal Access Token (được mã hóa)
- Khuyến nghị sử dụng Private Repository trên GitHub

## ☁️ Đồng bộ GitHub

### 🚀 Quick Start
→ Đọc **[QUICKSTART.md](./QUICKSTART.md)** - Setup trong 5 phút!

### 📖 Chi tiết
→ Xem **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - Hướng dẫn đầy đủ

### 📚 Tất cả tài liệu
→ Xem **[INDEX.md](./INDEX.md)** - Chỉ mục đầy đủ

### Tóm tắt:
1. Tạo GitHub Private Repository
2. Tạo Personal Access Token với scope `repo`
3. Cấu hình trong tab **Cấu Hình** của ứng dụng
4. Click "Lưu lên GitHub" để backup
5. Click "Tải về máy" để restore

## 📁 Cấu trúc thư mục

```
/workspace
├── components/          # Các React components
├── services/           # Services (storage, API)
├── data/              # Dữ liệu backup mẫu
├── App.tsx            # Component chính
├── types.ts           # TypeScript types
└── constants.ts       # Hằng số (danh sách ngân hàng, v.v.)
```

## 🛠️ Công nghệ sử dụng

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **VietQR** - Tạo mã QR thanh toán
- **Gemini AI** - Hỗ trợ nhập liệu thông minh
- **GitHub API** - Đồng bộ dữ liệu

## 📱 Demo

View your app in AI Studio: https://ai.studio/apps/drive/1KUTYXK1p9RcFvIFq4uX-NWdf2oGiEvFE

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại

---

Made with ❤️ for Vietnamese Teachers
