# Hướng dẫn sử dụng SmartTuition

## Mục lục
1. [Đăng nhập](#đăng-nhập)
2. [Nhập dữ liệu học sinh](#nhập-dữ-liệu-học-sinh)
3. [Quản lý danh sách](#quản-lý-danh-sách)
4. [Điểm danh](#điểm-danh)
5. [Thu học phí](#thu-học-phí)
6. [Tạo phiếu thu và QR](#tạo-phiếu-thu-và-qr)
7. [Đồng bộ GitHub](#đồng-bộ-github)
8. [Xuất báo cáo](#xuất-báo-cáo)

---

## Đăng nhập

1. Mở ứng dụng trong trình duyệt
2. Nhập mã bí mật (mặc định: `123456789@2025@`)
3. Click "Truy cập hệ thống"

💡 **Mẹo**: Mã này chỉ lưu trong trình duyệt, không gửi đi đâu cả.

---

## Nhập dữ liệu học sinh

### Cách 1: Nhập từ Excel
1. Vào tab **"Nhập Liệu"**
2. Chuẩn bị file Excel với các cột:
   - Họ tên
   - Lớp
   - Học phí
   - Tên phụ huynh
   - Số điện thoại
3. Click **"Chọn file Excel"**
4. Chọn file → Xem trước → Xác nhận

### Cách 2: Nhập thủ công
1. Vào tab **"Nhập Liệu"**
2. Điền thông tin học sinh
3. Nhập nội dung điều chỉnh (nếu có):
   - Ví dụ: "Nghỉ 2 buổi, giảm 100k"
4. Click **"Thêm học sinh"**

### Cách 3: Nhập bằng AI (nâng cao)
1. Cần có Gemini API Key
2. Paste đoạn text bất kỳ
3. AI sẽ tự động phân tích và tạo phiếu

---

## Quản lý danh sách

### Xem danh sách
1. Vào tab **"Danh Sách"**
2. Xem tổng quan:
   - Tổng dự thu
   - Đã thu thực tế
   - Còn lại chưa thu

### Lọc dữ liệu
- **Tìm kiếm**: Gõ tên học sinh
- **Lọc theo lớp**: Chọn dropdown
- **Lọc theo tháng**: Chọn tháng thu

### Thao tác với học sinh

Mỗi dòng học sinh có các nút:

| Biểu tượng | Chức năng |
|------------|-----------|
| 👁️ | Xem phiếu thu chi tiết |
| ✏️ | Sửa thông tin |
| 💬 | Thêm ghi chú |
| 🗑️ | Xóa học sinh |

---

## Điểm danh

1. Vào tab **"Điểm danh"**
2. Chọn ngày điểm danh (mặc định: hôm nay)
3. Tick vào tên học sinh có mặt
4. Hoặc dùng **"Điểm danh tất cả"** cho nhanh
5. Lịch sử điểm danh được lưu tự động

---

## Thu học phí

### Đánh dấu đã thu
1. Vào tab **"Danh Sách"**
2. Tick vào checkbox **"Đã nộp"** ở dòng học sinh
3. Hộp thoại xuất hiện:
   - **Số tiền thực thu**: Nhập số tiền (mặc định là tổng phải thu)
   - **Ngày thu**: Chọn ngày (mặc định: hôm nay)
   - **Hình thức**: Chọn Chuyển khoản hoặc Tiền mặt
4. Click **"Xác nhận"**

### Hủy trạng thái đã thu
- Bỏ tick checkbox **"Đã nộp"**
- Xác nhận → Trạng thái được reset

---

## Tạo phiếu thu và QR

### Cấu hình ngân hàng (lần đầu)
1. Vào tab **"Cấu Hình"**
2. Nhập thông tin:
   - Tên giáo viên
   - Ngân hàng
   - Số tài khoản
   - Tên chủ tài khoản (VIẾT HOA KHÔNG DẤU)
3. Click **"Lưu cấu hình"**

### Xem phiếu thu
1. Vào tab **"Danh Sách"**
2. Click biểu tượng **👁️** ở học sinh
3. Phiếu thu hiển thị với:
   - Thông tin học sinh
   - Chi tiết học phí
   - Mã QR chuyển khoản VietQR
   - Thông tin ngân hàng

### Gửi phiếu thu
1. Click nút **"Chụp & Gửi Zalo/Messenger"**
2. Hình ảnh được tải xuống tự động
3. Gửi cho phụ huynh qua Zalo hoặc Messenger

### Đánh dấu đã gửi
- Click nút **"Đã gửi"** để đánh dấu
- Trạng thái hiển thị trong danh sách

---

## Đồng bộ GitHub

### Thiết lập lần đầu

Xem hướng dẫn chi tiết: [GITHUB_SETUP.md](../GITHUB_SETUP.md)

**Tóm tắt:**
1. Tạo Private Repository trên GitHub
2. Tạo Personal Access Token
3. Vào tab **"Cấu Hình"** → Kéo xuống **"Đồng bộ GitHub"**
4. Nhập Token, Username, Repo name
5. Click **"Test kết nối"** để kiểm tra
6. Click **"Lưu lên GitHub"**

### Sao lưu dữ liệu
- Vào **Cấu Hình** → **Đồng bộ GitHub**
- Click **"Lưu lên GitHub"**
- Chờ thông báo thành công

### Khôi phục dữ liệu
- Vào **Cấu Hình** → **Đồng bộ GitHub**
- Click **"Tải về máy"**
- Xác nhận → Trang tự động tải lại

⚠️ **Lưu ý**: Tải về sẽ ghi đè dữ liệu hiện tại!

---

## Xuất báo cáo

### Xuất Excel
1. Vào tab **"Danh Sách"**
2. Lọc dữ liệu cần xuất (nếu cần)
3. Click nút **"Xuất Excel"**
4. File `.xlsx` được tải về máy

### In/Lưu PDF
1. Vào tab **"Danh Sách"**
2. Click nút **"In / Lưu PDF"**
3. Cửa sổ in xuất hiện:
   - Chọn **"Save as PDF"** để lưu PDF
   - Hoặc chọn máy in để in trực tiếp

---

## Mẹo và thủ thuật

### 🎯 Quản lý nhiều giáo viên
- Sử dụng tính năng **Hồ sơ** trong Cấu Hình
- Mỗi giáo viên 1 hồ sơ riêng
- Chuyển đổi nhanh bằng dropdown

### 💾 Backup thường xuyên
- Backup lên GitHub sau mỗi buổi thu học phí
- Hoặc dùng **"Sao lưu (Backup)"** để tải file JSON về máy
- Giữ ít nhất 2 bản backup

### 📱 Sử dụng trên điện thoại
- Ứng dụng hoạt động tốt trên mobile
- Giao diện tự động điều chỉnh
- Có thể quét QR trực tiếp

### 🔒 Bảo mật
- Đổi mã đăng nhập trong file `App.tsx` (dòng 16)
- Không chia sẻ Personal Access Token
- Sử dụng Private Repository

---

## Xử lý sự cố

### Không tạo được QR
- Kiểm tra đã cấu hình ngân hàng chưa
- Đảm bảo số tài khoản và BIN code đúng

### Mất dữ liệu
- Nếu đã backup GitHub: Dùng **"Tải về máy"**
- Nếu có file JSON: Dùng **"Khôi phục (Restore)"**

### Lỗi đồng bộ GitHub
- Kiểm tra kết nối internet
- Click **"Test kết nối"** để chẩn đoán
- Xem thông báo lỗi chi tiết

---

## Liên hệ hỗ trợ

Nếu cần hỗ trợ:
1. Đọc lại hướng dẫn này
2. Xem [GITHUB_SETUP.md](../GITHUB_SETUP.md) cho GitHub
3. Tạo Issue trên GitHub repository

---

**Chúc bạn sử dụng hiệu quả! 🎉**
