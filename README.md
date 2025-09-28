# 🚀 Notification Firebase Demo (Web + Node.js)

Dự án demo gửi **Firebase Cloud Messaging (FCM)** tự động mỗi **30 giây** qua cron job.  
Hỗ trợ cả **foreground notification** (toast trong web) và **background notification** (OS notification do Service Worker hiển thị).

---

## 📂 Cấu trúc thư mục

.
├── index.html # Giao diện web client, Start/Stop + form nhập nội dung thông báo
├── firebase-messaging-sw.js # Service Worker, nhận thông báo khi web tắt (background)
├── server.js # Server Node.js (Express + Firebase Admin + cron 30s)
├── package.json # Thông tin project & dependencies
├── package-lock.json # Lock file cho npm
├── .state.json # Lưu trạng thái (enable/disable, token, message, lastSentAt)
├── .gitignore # Bỏ qua service-account.json, node_modules, log...
└── service-account.json # 🔐 Admin SDK key (LOCAL ONLY, KHÔNG commit)

less
Sao chép mã

---

## 🔄 Sơ đồ luồng xử lý (Mermaid)

```mermaid
flowchart LR
    subgraph Client[Client (Browser)]
      A[Người dùng mở web] --> B[Get Token -> FCM Token]
      B --> C[Start -> gửi token lên /enable]
      C --> D[Update message -> /setMessage]
      E[Web mở] --> F[onMessage (foreground) -> Toast UI]
    end

    subgraph Server[Server (Node.js)]
      G[Express API: /enable,/disable,/status,/setMessage]
      H[Cron job mỗi 30s]
      I[.state.json lưu token, message, enabled]
    end

    subgraph FCM[Firebase Cloud Messaging]
      J[Đẩy notification]
    end

    C -->|token| G
    D -->|title, body| G
    G -->|lưu| I
    H -->|gửi data-only| J
    J -->|push| Client
    Client -. nếu web đóng .-> K[Service Worker onBackgroundMessage -> OS Notification]
⚙️ Cách cài đặt & chạy
1) Clone & cài dependencies
bash
Sao chép mã
git clone https://github.com/<your-username>/NotificationFireBase-Demo-web.git
cd NotificationFireBase-Demo-web
npm install
2) Thêm service-account.json (KHÔNG commit)
Firebase Console → Project settings → Service accounts → Generate new private key

Tải file .json, đặt vào thư mục gốc của dự án

Đã có .gitignore bỏ qua file này

3) Chạy server
bash
Sao chép mã
npm start
Mở trình duyệt: http://localhost:3000

4) Sử dụng
Get Token: cấp quyền Notification và lấy FCM token

Nhập tiêu đề & nội dung → bấm Update message

Start: bật cron gửi mỗi 30s (có thể đổi trong server.js)

Stop: tắt cron

Khi web đang mở → thông báo foreground hiển thị dạng toast trong trang.
Khi web đóng/ẩn → Service Worker hiển thị OS Notification (nếu trình duyệt còn chạy nền).

🔧 API server (Express)
POST /enable { token } → thêm token & bật gửi định kỳ

POST /disable → tắt gửi định kỳ

POST /status → xem trạng thái: enabled, số token, lastSentAt, message hiện tại

POST /setMessage { title, body } → cập nhật nội dung thông báo

🕒 Đổi chu kỳ gửi (30s → giá trị khác)
Trong server.js, tìm dòng cron:

js
Sao chép mã
cron.schedule("*/30 * * * * *", async () => {
  // gửi mỗi 30 giây
});
Ví dụ gửi mỗi 10 giây: "*/10 * * * * *"

Mỗi 1 phút: "* * * * *"

Lưu ý: Trường “giây” là phần đầu tiên trong biểu thức cron của node-cron.

🔐 Bảo mật
KHÔNG commit service-account.json lên GitHub

Nếu đã lỡ commit: Revoke/Rotate key trên Firebase Console và làm sạch lịch sử git (BFG hoặc git filter-repo), sau đó force-push

service-account.json chỉ để local hoặc server (qua biến môi trường)

❗ Lỗi thường gặp & cách xử lý nhanh
invalid_grant (Invalid JWT Signature) khi gửi FCM
Đồng bộ thời gian hệ thống (Windows: Settings → Time & Language → Sync now)

Dùng đúng service-account.json (không bị hỏng newline/format) và đúng project

Key có thể đã bị revoke → tạo key mới

Không thấy thông báo khi đóng web
Bật Run in background cho trình duyệt (Chrome: chrome://settings/system)

Tắt Do Not Disturb/Focus Assist của hệ điều hành

Đảm bảo server Node đang chạy

📜 License
MIT – sử dụng cho mục đích học tập & demo.
