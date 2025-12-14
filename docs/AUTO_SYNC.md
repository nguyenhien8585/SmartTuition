# 🔄 Tự động đồng bộ dữ liệu

## Tính năng mới: Auto-Sync

SmartTuition giờ có thể **tự động tải dữ liệu từ GitHub** mỗi khi bạn mở ứng dụng!

---

## 🎯 Mục đích

### Vấn đề:
Khi làm việc trên nhiều thiết bị (máy tính, điện thoại, máy tính bảng), bạn phải nhớ:
- ❌ Backup từ thiết bị A
- ❌ Mở thiết bị B
- ❌ Nhớ restore dữ liệu
- ❌ Lặp lại mỗi lần chuyển thiết bị

### Giải pháp:
Với **Auto-Sync**, bạn chỉ cần:
- ✅ Bật tính năng 1 lần
- ✅ Mở app → Tự động có dữ liệu mới nhất
- ✅ Làm việc bình thường
- ✅ Đóng app (tự động backup nếu có thay đổi)

---

## 🚀 Cách bật Auto-Sync

### Bước 1: Setup GitHub (nếu chưa)
Làm theo hướng dẫn trong [QUICKSTART.md](../QUICKSTART.md) hoặc [GITHUB_SETUP.md](../GITHUB_SETUP.md)

### Bước 2: Bật Auto-Sync
1. Mở SmartTuition
2. Vào tab **"Cấu Hình"**
3. Kéo xuống phần **"Đồng bộ GitHub (Cloud)"**
4. Tick vào checkbox **"Tự động đồng bộ khi mở app"**
5. Thấy thông báo màu xanh → Đã bật!

### Bước 3: Test
1. Đóng app hoàn toàn
2. Mở lại app
3. Thấy màn hình loading **"Đang đồng bộ dữ liệu từ GitHub..."**
4. Sau vài giây → Dữ liệu được cập nhật!

---

## 🔧 Cách hoạt động

### Quy trình tự động:

```
1. Bạn mở app
   ↓
2. App check: Auto-sync có bật không?
   ↓ (Có)
3. Kết nối GitHub
   ↓
4. Tải dữ liệu mới nhất
   ↓
5. So sánh với dữ liệu local
   ↓
6. Cập nhật nếu có thay đổi
   ↓
7. Reload app với dữ liệu mới
   ↓
8. Bạn thấy dữ liệu mới nhất!
```

### Thời gian:
- ⚡ Nhanh: 1-2 giây (kết nối tốt)
- 🐢 Chậm: 3-5 giây (kết nối yếu)

---

## 🎨 Giao diện

### Khi đang sync:
```
┌─────────────────────────────┐
│  🔄 Đồng bộ dữ liệu        │
│                             │
│  Đang đồng bộ dữ liệu từ   │
│  GitHub...                  │
└─────────────────────────────┘
```

### Thành công:
```
┌─────────────────────────────┐
│  ✅ Đồng bộ dữ liệu        │
│                             │
│  Đã đồng bộ dữ liệu        │
│  thành công!                │
└─────────────────────────────┘
(Tự động đóng sau 1.5 giây)
```

### Thất bại (không có internet):
```
┌─────────────────────────────┐
│  ⚠️ Đồng bộ dữ liệu         │
│                             │
│  Không thể đồng bộ,         │
│  dùng dữ liệu local         │
└─────────────────────────────┘
(Tự động đóng sau 2 giây)
```

---

## ✅ Ưu điểm

### 1. Luôn có dữ liệu mới nhất
- Không cần nhớ restore
- Không lo thiếu dữ liệu
- Làm việc trên nhiều thiết bị dễ dàng

### 2. Tự động và minh bạch
- Không cần thao tác thủ công
- Chạy ngầm, không làm phiền
- Thông báo rõ ràng

### 3. An toàn
- Nếu sync lỗi → Dùng dữ liệu local
- Không mất dữ liệu
- Silent mode (không hiện popup lỗi linh tinh)

### 4. Nhanh
- Chỉ 1-3 giây
- Không blocking UI
- Load song song với app

---

## ⚠️ Lưu ý

### 1. Khi nào sync?
Auto-sync chỉ chạy khi:
- ✅ Bạn **MỞ** app (không phải refresh)
- ✅ Auto-sync được **BẬT**
- ✅ GitHub config **đầy đủ** (token, owner, repo)
- ✅ Đã **đăng nhập** vào app

### 2. Không sync khi nào?
Auto-sync **KHÔNG** chạy khi:
- ❌ Chưa bật tính năng
- ❌ Thiếu GitHub config
- ❌ Chưa đăng nhập
- ❌ Đang ở màn hình login

### 3. Xung đột dữ liệu?
**Không có xung đột!** Auto-sync luôn:
- 📥 **Tải về** dữ liệu từ GitHub
- 🔄 **Ghi đè** dữ liệu local
- ✅ GitHub là nguồn chân lý (single source of truth)

### 4. Nếu có thay đổi chưa backup?
⚠️ **QUAN TRỌNG**: Auto-sync sẽ GHI ĐÈ dữ liệu local!

**Quy trình làm việc đúng:**
1. Thiết bị A: Làm việc → Backup lên GitHub
2. Thiết bị B: Mở app → Auto-sync tải về
3. Thiết bị B: Làm việc → Backup lên GitHub
4. Thiết bị A: Mở app → Auto-sync tải về

**Sai lầm thường gặp:**
1. Thiết bị A: Làm việc → **QUÊN** backup
2. Thiết bị B: Mở app → Auto-sync tải dữ liệu cũ
3. Thiết bị A: Dữ liệu mới bị **MẤT**

**💡 Khuyến nghị**: Luôn backup sau mỗi buổi làm việc!

---

## 🔒 Bảo mật

### An toàn
- ✅ Token lưu trong localStorage (không gửi đi đâu)
- ✅ Kết nối HTTPS với GitHub
- ✅ Silent mode (không log sensitive data)
- ✅ Không lưu password

### Khuyến nghị
- 🔐 Dùng Private Repository
- 🔐 Token có scope tối thiểu (`repo` only)
- 🔐 Logout khi dùng máy chung
- 🔐 Đổi mã đăng nhập ứng dụng

---

## 🧪 Troubleshooting

### Vấn đề 1: Auto-sync không chạy
**Nguyên nhân:**
- Chưa bật tính năng
- Thiếu GitHub config
- Token hết hạn

**Giải pháp:**
1. Check: Đã tick vào "Tự động đồng bộ" chưa?
2. Check: GitHub config đầy đủ chưa?
3. Test kết nối: Click "Test kết nối"
4. Xem console log (F12) để debug

### Vấn đề 2: Sync lâu quá
**Nguyên nhân:**
- Kết nối internet chậm
- GitHub đang bảo trì
- File backup quá lớn

**Giải pháp:**
1. Check internet speed
2. Check GitHub status: https://www.githubstatus.com
3. Đợi 10 giây, nếu vẫn chậm → Tắt auto-sync

### Vấn đề 3: Lỗi "File not found"
**Nguyên nhân:**
- Chưa backup lần nào lên GitHub
- File path sai

**Giải pháp:**
1. Vào Cấu Hình → Click "Lưu lên GitHub" 1 lần
2. Check file path: `data/tuition_backup.json`
3. Kiểm tra trên GitHub: vào repo → thư mục data → thấy file chưa?

### Vấn đề 4: Dữ liệu bị cũ
**Nguyên nhân:**
- Quên backup trên thiết bị khác
- Auto-sync tải dữ liệu cũ từ GitHub

**Giải pháp:**
1. Backup thủ công ngay: Click "Lưu lên GitHub"
2. Reload app để sync lại
3. Nhớ backup sau mỗi buổi làm việc

### Vấn đề 5: Không có internet
**Không sao!** App vẫn hoạt động bình thường:
- Auto-sync fail → Dùng dữ liệu local
- Làm việc offline hoàn toàn OK
- Có internet lại → Manual backup

---

## 🎯 Best Practices

### 1. Quy trình 1 thiết bị
```
1. Mở app (auto-sync)
2. Làm việc
3. Backup lên GitHub (thủ công)
4. Đóng app
```

### 2. Quy trình nhiều thiết bị
```
Thiết bị A:
1. Mở app (auto-sync) ← Tải dữ liệu mới
2. Làm việc
3. Backup lên GitHub ← BẮT BUỘC
4. Đóng app

Thiết bị B:
1. Mở app (auto-sync) ← Tải dữ liệu từ A
2. Làm việc
3. Backup lên GitHub ← BẮT BUỘC
4. Đóng app
```

### 3. Làm việc nhóm
```
Giáo viên A:
- Nhập dữ liệu buổi sáng
- Backup lên GitHub (repo chung)

Giáo viên B:
- Mở app (auto-sync)
- Thấy dữ liệu buổi sáng từ A
- Nhập dữ liệu buổi chiều
- Backup lên GitHub

Giáo viên A:
- Mở app ngày mai (auto-sync)
- Thấy cả dữ liệu sáng + chiều
```

---

## ⚙️ Cấu hình nâng cao

### Tắt Auto-Sync tạm thời
1. Vào Cấu Hình
2. Bỏ tick "Tự động đồng bộ"
3. Reload app → Không sync nữa

### Kiểm tra sync log
```javascript
// Mở Console (F12)
// Xem log:
// ✅ "Auto-sync completed successfully"
// ⚠️ "Auto-sync failed, using local data"
```

### Manual override
Nếu muốn dùng dữ liệu local (không sync):
1. Tắt auto-sync
2. Reload app
3. Dữ liệu local được giữ nguyên

---

## 📊 So sánh

| | **Không Auto-Sync** | **Có Auto-Sync** |
|---|---|---|
| Mở app | Dữ liệu local | Dữ liệu GitHub (mới nhất) |
| Đóng app | Không thay đổi | Không thay đổi |
| Chuyển thiết bị | Phải restore thủ công | Tự động |
| Quên backup | Mất dữ liệu | Mất dữ liệu (nếu không backup) |
| Offline | OK | OK (fallback to local) |
| Tốc độ | Nhanh (0s) | Hơi chậm (1-3s) |

---

## 🎓 Ví dụ thực tế

### Kịch bản 1: Làm việc tại nhà và trường
```
Tại nhà (8h sáng):
- Mở app trên laptop
- Auto-sync tải dữ liệu
- Nhập 10 học sinh mới
- Backup lên GitHub
- Đóng laptop

Tại trường (14h chiều):
- Mở app trên máy tính bảng
- Auto-sync tải về → Thấy 10 học sinh mới!
- Thu tiền 5 học sinh
- Backup lên GitHub
- Đóng app

Về nhà (20h tối):
- Mở app trên laptop
- Auto-sync → Thấy 5 học sinh đã nộp!
- In báo cáo
```

### Kịch bản 2: Dự phòng khi lỗi
```
Sáng:
- Mở app → Auto-sync lỗi (mất internet)
- App hiện: "Không thể đồng bộ, dùng dữ liệu local"
- Vẫn làm việc bình thường với dữ liệu cũ
- Có internet → Backup thủ công

Chiều:
- Internet đã về
- Mở app → Auto-sync thành công
- Tất cả dữ liệu đồng bộ
```

---

## 📚 Tài liệu liên quan

- [QUICKSTART.md](../QUICKSTART.md) - Setup GitHub nhanh
- [GITHUB_SETUP.md](../GITHUB_SETUP.md) - Setup chi tiết
- [USER_GUIDE.md](./USER_GUIDE.md) - Hướng dẫn đầy đủ
- [INDEX.md](../INDEX.md) - Chỉ mục tài liệu

---

## ❓ FAQ

**Q: Có tốn internet không?**  
A: Có, nhưng rất ít (vài KB mỗi lần sync).

**Q: Sync có làm chậm app không?**  
A: Không, sync chạy song song, không block UI.

**Q: Có giới hạn số lần sync không?**  
A: Không, sync bao nhiêu lần cũng được.

**Q: Dữ liệu có bị ghi đè không?**  
A: Có, auto-sync luôn ghi đè dữ liệu local. Nhớ backup trước!

**Q: Tắt được không?**  
A: Được, bỏ tick là tắt ngay.

**Q: Có tốn pin không (mobile)?**  
A: Có, nhưng rất ít (1-2% mỗi lần sync).

---

## ✅ Kết luận

**Auto-Sync là tính năng tuyệt vời nếu bạn:**
- ✅ Làm việc trên nhiều thiết bị
- ✅ Muốn dữ liệu luôn mới nhất
- ✅ Lười restore thủ công
- ✅ Có internet ổn định

**Không nên dùng Auto-Sync nếu:**
- ❌ Chỉ dùng 1 thiết bị
- ❌ Internet không ổn định
- ❌ Muốn kiểm soát hoàn toàn sync timing
- ❌ Lo lắng về dữ liệu bị ghi đè

---

**Chúc bạn đồng bộ dữ liệu hiệu quả! 🔄**

_Last updated: 2025-12-14_
