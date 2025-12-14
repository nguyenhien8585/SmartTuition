# Hướng dẫn chi tiết thiết lập GitHub Sync

## Mục đích
Lưu trữ dữ liệu học phí của bạn an toàn trên GitHub, cho phép:
- Đồng bộ giữa nhiều thiết bị
- Backup tự động
- Khôi phục dữ liệu khi cần
- Lịch sử thay đổi (version control)

---

## Bước 1: Tạo GitHub Repository

### 1.1. Đăng nhập GitHub
- Truy cập https://github.com
- Đăng nhập hoặc tạo tài khoản mới (miễn phí)

### 1.2. Tạo Repository mới
1. Click nút **"+"** góc trên bên phải → Chọn **"New repository"**
2. Điền thông tin:
   - **Repository name**: Ví dụ: `tuition-data`, `hocphi-backup`, hoặc `my-tuition-app`
   - **Description** (tùy chọn): "Dữ liệu học phí cá nhân"
   - **Visibility**: ⚠️ **BẮT BUỘC chọn PRIVATE** (để bảo mật dữ liệu)
   - **Không cần** check các option khác
3. Click **"Create repository"**

📝 **Ghi chú lại**:
- Repository name: `________________`
- GitHub Username: `________________`

---

## Bước 2: Tạo Personal Access Token

### 2.1. Vào Settings
1. Click vào avatar góc phải → **Settings**
2. Kéo xuống dưới cùng bên trái → **Developer settings**
3. Chọn **Personal access tokens** → **Tokens (classic)**

### 2.2. Tạo Token mới
1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. Điền thông tin:
   - **Note**: "SmartTuition App" (để nhớ token này dùng làm gì)
   - **Expiration**: Chọn **No expiration** (hoặc 1 năm nếu muốn an toàn hơn)
   - **Select scopes**: ✅ Chỉ cần check **`repo`** (Full control of private repositories)
3. Kéo xuống cuối trang, click **"Generate token"**

### 2.3. Copy và Lưu Token
⚠️ **QUAN TRỌNG**: Token chỉ hiển thị 1 lần duy nhất!

- Token có dạng: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Copy ngay** và lưu vào file text an toàn trên máy
- Không chia sẻ token này với ai

---

## Bước 3: Cấu hình trong SmartTuition

### 3.1. Mở ứng dụng
1. Mở SmartTuition trên trình duyệt
2. Đăng nhập (mã mặc định: `123456789@2025@`)
3. Click tab **"Cấu Hình"** (biểu tượng bánh răng)

### 3.2. Kéo xuống phần "Đồng bộ GitHub (Cloud)"
Điền các thông tin sau:

#### 📌 Personal Access Token
- Paste token bắt đầu bằng `ghp_...` vừa copy
- Ví dụ: `ghp_abc123xyz789...`

#### 📌 GitHub Username
- Tên đăng nhập GitHub của bạn (không phải email)
- Ví dụ: `nguyenvana` hoặc `teacher_lan`

#### 📌 Repository Name
- Tên repo vừa tạo ở Bước 1
- Ví dụ: `tuition-data`

#### 📌 File Path (mặc định: `data/tuition_backup.json`)
- Đường dẫn file trong repo
- Không cần thay đổi nếu không rõ
- Có thể đổi thành: `backup.json`, `data/2025.json`, v.v.

---

## Bước 4: Sử dụng

### 4.1. Lưu dữ liệu lên GitHub (Backup)
1. Nhập xong dữ liệu học phí, điểm danh, thanh toán
2. Vào tab **Cấu Hình**
3. Kéo xuống phần **Đồng bộ GitHub**
4. Click nút **"Lưu lên GitHub"** (màu đen)
5. Chờ thông báo "Đã lưu dữ liệu lên GitHub thành công!"

✅ Dữ liệu của bạn đã được backup an toàn!

### 4.2. Tải dữ liệu về máy (Restore)
**Khi nào cần dùng?**
- Chuyển sang máy tính/điện thoại khác
- Xóa nhầm dữ liệu trên trình duyệt
- Muốn khôi phục về phiên bản cũ

**Cách làm:**
1. Mở SmartTuition trên thiết bị mới
2. Đăng nhập
3. Vào tab **Cấu Hình**
4. Nhập lại thông tin GitHub (Token, Username, Repo name)
5. Click nút **"Tải về máy"** (viền đen)
6. Xác nhận → Chờ trang tự động tải lại
7. Kiểm tra dữ liệu đã về đầy đủ

---

## Xem dữ liệu trên GitHub

1. Truy cập https://github.com/[username]/[repo-name]
2. Vào thư mục `data/` (hoặc xem file `backup.json`)
3. Click vào file → Xem nội dung JSON
4. Click tab **"History"** để xem lịch sử thay đổi

---

## 🛡️ Bảo mật và Lưu ý

### ✅ Nên làm:
- Sử dụng **Private Repository**
- Lưu token ở nơi an toàn (password manager, file mã hóa)
- Backup định kỳ sau mỗi buổi học
- Kiểm tra dữ liệu sau khi restore

### ❌ Không nên:
- Chia sẻ token hoặc repo với người lạ
- Dùng Public Repository (dữ liệu ai cũng thấy được)
- Lưu token trong email hoặc ghi chú online không bảo mật
- Quên backup trước khi xóa cache/trình duyệt

### 🔒 Token bị lộ? Làm gì?
1. Vào GitHub Settings → Developer settings → Tokens
2. Tìm token cũ → Click **"Delete"**
3. Tạo token mới (lặp lại Bước 2)
4. Cập nhật token mới trong SmartTuition

---

## ❓ Xử lý lỗi thường gặp

### Lỗi: "File not found on GitHub"
- **Nguyên nhân**: Chưa có file backup trên GitHub
- **Giải pháp**: Click "Lưu lên GitHub" trước khi "Tải về máy"

### Lỗi: "Unauthorized access"
- **Nguyên nhân**: Token sai hoặc hết hạn
- **Giải pháp**: Kiểm tra lại token, tạo token mới nếu cần

### Lỗi: "Failed to save to GitHub"
- **Nguyên nhân**: 
  - Repo name hoặc username sai
  - Repo là Public nhưng token không đủ quyền
  - Kết nối internet không ổn định
- **Giải pháp**: 
  - Kiểm tra lại username và repo name (phân biệt hoa thường)
  - Đảm bảo token có scope `repo`
  - Kiểm tra kết nối mạng

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Đọc lại hướng dẫn từ đầu
2. Kiểm tra từng bước đã làm đúng chưa
3. Thử tạo token mới và repo mới
4. Liên hệ người phát triển hoặc tạo Issue trên GitHub

---

**Chúc bạn sử dụng SmartTuition hiệu quả! 🎉**
