# ⚡ Quick Start - SmartTuition GitHub Sync

## 🎯 Mục tiêu
Thiết lập và sử dụng đồng bộ GitHub trong **5 phút**.

---

## 📋 Checklist trước khi bắt đầu

- [ ] Có tài khoản GitHub (free OK)
- [ ] Đã cài Node.js
- [ ] Ứng dụng đang chạy (`npm run dev`)

---

## 🚀 5 bước nhanh

### 1️⃣ Tạo GitHub Repository (2 phút)

1. Vào https://github.com/new
2. Điền:
   - **Repository name**: `tuition-backup` (hoặc tên bạn thích)
   - **Private**: ✅ **BẮT BUỘC TICK**
3. Click **"Create repository"**
4. **GHI LẠI**: Repository name vừa tạo

### 2️⃣ Tạo Token (1 phút)

1. Click link này → [Tạo Token](https://github.com/settings/tokens/new?scopes=repo&description=SmartTuition%20App)
2. Kéo xuống cuối → Click **"Generate token"**
3. **COPY NGAY** token (dạng `ghp_abc123xyz...`)
4. **GHI LẠI**: Token này (sẽ không hiện lại)

### 3️⃣ Nhập vào App (30 giây)

1. Mở SmartTuition
2. Tab **"Cấu Hình"** (biểu tượng bánh răng)
3. Kéo xuống **"Đồng bộ GitHub (Cloud)"**
4. Nhập:
   ```
   Token: [paste token vừa copy]
   Username: [tên GitHub của bạn]
   Repo: tuition-backup
   Path: data/tuition_backup.json
   ```

### 4️⃣ Test kết nối (30 giây)

1. Click nút **"Test kết nối"** (màu xanh dương)
2. Đợi 2-3 giây
3. Nếu thấy:
   - ✅ **"Kết nối thành công!"** → Sang bước 5
   - ❌ **Lỗi** → Xem [Xử lý lỗi](#-xử-lý-lỗi-nhanh) bên dưới

### 5️⃣ Backup ngay! (10 giây)

1. Click nút **"Lưu lên GitHub"** (màu đen)
2. Đợi thông báo **"✅ Đã lưu dữ liệu lên GitHub thành công!"**
3. **XONG!** Dữ liệu đã an toàn trên cloud ☁️

---

## ✅ Kiểm tra thành công

### Cách 1: Xem trên GitHub
1. Vào `https://github.com/[username]/tuition-backup`
2. Click thư mục **`data/`**
3. Thấy file **`tuition_backup.json`** → **THÀNH CÔNG!** 🎉

### Cách 2: Trong App
- Thấy dòng chữ nhỏ: **"Lần backup cuối: [thời gian]"**
- Nút Test màu xanh lá với dấu tích ✅

---

## 🔄 Sử dụng hàng ngày

### Sau mỗi buổi thu học phí:
1. Nhập dữ liệu xong
2. Vào **Cấu Hình**
3. Click **"Lưu lên GitHub"**
4. Đợi thông báo → Xong!

⏱️ **Chỉ 5 giây!**

### Khi chuyển sang máy mới:
1. Cài ứng dụng
2. Vào **Cấu Hình**
3. Nhập lại Token, Username, Repo
4. Click **"Tải về máy"**
5. Xác nhận → Trang tự động reload
6. Dữ liệu về đầy đủ!

---

## 🆘 Xử lý lỗi nhanh

### "Repository không tồn tại"
- ✅ Check: Username đúng chưa? (phân biệt hoa thường)
- ✅ Check: Repo name đúng chưa?
- ✅ Thử: Vào `https://github.com/[username]/[repo]` xem có load không

### "Token không hợp lệ"
- ✅ Check: Copy đủ token chưa? (rất dài)
- ✅ Check: Token đã expire chưa?
- ✅ Tạo token mới: [Link](https://github.com/settings/tokens/new?scopes=repo&description=SmartTuition)

### "File not found"
- ✅ Đây là lần đầu backup → Dùng **"Lưu lên GitHub"** trước
- ✅ Sau đó mới dùng **"Tải về máy"**

### Test không thành công
1. Check internet
2. Chạy script test:
   ```bash
   node scripts/test-github.js
   ```
3. Xem lỗi chi tiết

---

## 📚 Cần thêm thông tin?

| Tình huống | Đọc file này |
|-----------|-------------|
| Hướng dẫn chi tiết từng bước | [GITHUB_SETUP.md](./GITHUB_SETUP.md) |
| Cách dùng tất cả tính năng | [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) |
| Hiểu về dữ liệu backup | [data/README.md](./data/README.md) |
| Có gì mới? | [CHANGELOG.md](./CHANGELOG.md) |
| Tổng quan setup | [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) |

---

## 🎯 Tips hay

### 💡 Backup tự động hàng tuần
- Rename file `.github/workflows/auto-backup.yml.example` → `auto-backup.yml`
- GitHub sẽ tự tạo issue nhắc bạn backup mỗi tuần

### 💡 Test offline
```bash
node scripts/test-github.js
```
Test kết nối mà không cần mở app

### 💡 Backup file local
- Vào **Cấu Hình** → **Sao lưu (Backup)**
- File JSON tải về → Giữ làm backup dự phòng

### 💡 Multiple devices
- Setup GitHub Sync trên tất cả thiết bị
- Backup từ máy A → Tải về máy B → Đồng bộ!

---

## ⏱️ Tóm tắt thời gian

| Bước | Thời gian |
|------|-----------|
| Tạo Repository | 2 phút |
| Tạo Token | 1 phút |
| Nhập vào App | 30 giây |
| Test | 30 giây |
| Backup | 10 giây |
| **TỔNG** | **< 5 phút** |

Sau đó: **5 giây** mỗi lần backup! ⚡

---

## 🎉 Hoàn thành!

Bây giờ bạn có:
- ✅ Backup tự động lên GitHub
- ✅ Dữ liệu an toàn trên cloud
- ✅ Đồng bộ giữa nhiều thiết bị
- ✅ Lịch sử thay đổi (version control)

**Chúc mừng! Giờ bạn có thể yên tâm quản lý học phí! 🎓💰**

---

## 🤔 Câu hỏi thường gặp

**Q: Có mất phí không?**  
A: Không! GitHub free cho Private Repo.

**Q: Dữ liệu có bị lộ không?**  
A: Không, nếu dùng Private Repo và giữ token bí mật.

**Q: Mất bao nhiêu dung lượng?**  
A: Chỉ vài KB mỗi backup. 100 học sinh ≈ 50KB.

**Q: Có giới hạn số lần backup?**  
A: Không. Backup bao nhiêu lần cũng OK.

**Q: Nếu GitHub down thì sao?**  
A: Dùng backup file local (Sao lưu → Tải file JSON).

**Q: Token hết hạn phải làm gì?**  
A: Tạo token mới → Nhập lại trong Cấu Hình.

---

_Có vấn đề? Đọc [GITHUB_SETUP.md](./GITHUB_SETUP.md) hoặc [USER_GUIDE.md](./docs/USER_GUIDE.md)_
