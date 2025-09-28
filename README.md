FCM Foreground + Background Split Demo
Demo ứng dụng web sử dụng Firebase Cloud Messaging (FCM) để gửi thông báo tự động mỗi 30 giây, với sự phân biệt rõ ràng giữa xử lý thông báo ở foreground và background.

🚀 Tính năng chính
Gửi thông báo tự động: Cron job chạy mỗi 30 giây

Phân biệt Foreground/Background:

Foreground: Hiển thị toast notification trong trang

Background: Hiển thị native browser notification

Quản lý đa thiết bị: Hỗ trợ nhiều token FCM cùng lúc

Tùy chỉnh nội dung: Cập nhật tiêu đề và nội dung thông báo trực tiếp

Trạng thái persistent: Lưu trạng thái vào file JSON

🛠 Cài đặt
1. Clone và cài dependencies
bash
git clone <repository-url>
cd fcm-every-minute-demo
npm install
2. Cấu hình Firebase
Bước 1: Tải service account key

Vào Firebase Console → Project Settings → Service Accounts

Generate new private key

Đổi tên file thành service-account.json và đặt trong thư mục gốc

Bước 2: Cấu hình Web App

Firebase Console → Project Settings → General

Thêm web app và copy config

Cập nhật config trong index.html và firebase-messaging-sw.js

3. Khởi chạy
bash
npm start
Truy cập: http://localhost:3000

📁 Cấu trúc project
text
fcm-every-minute-demo/
├── index.html              # Frontend chính
├── firebase-messaging-sw.js # Service Worker xử lý background
├── server.js               # Backend Express + cron
├── service-account.json    # Firebase Admin SDK key
├── .state.json             # Trạng thái persistent
├── package.json
└── README.md
🔧 Cách sử dụng
1. Lấy FCM Token
Mở http://localhost:3000

Nhấn "Get Token" và cho phép thông báo

Token sẽ hiển thị trong khung log

2. Bật/tắt thông báo
Nhấn "Start" để bắt đầu nhận thông báo mỗi 30s

Nhấn "Stop" để dừng

3. Tùy chỉnh nội dung
Nhập tiêu đề và nội dung vào ô input

Nhấn "Update message" để áp dụng

🔄 Luồng hoạt động
Foreground (Khi tab đang mở)
FCM message được nhận qua onMessage

Hiển thị toast notification trong trang

Không hiển thị native notification

Background (Khi tab đóng/không active)
Service Worker nhận message qua onBackgroundMessage

Hiển thị native browser notification

Click notification sẽ mở/focus tab

Cron Job
Chạy mỗi 30 giây khi enabled

Gửi data-only message đến tất cả registered tokens

Lưu log và cập nhật trạng thái

⚙️ API Endpoints
POST /enable - Bật thông báo và thêm token

POST /disable - Tắt thông báo

POST /status - Lấy trạng thái hiện tại

POST /setMessage - Cập nhật nội dung thông báo

🔒 Bảo mật
service-account.json được gitignore

CORS enabled cho development

Validate input trên server

🐛 Xử lý lỗi thường gặp
Token không hoạt động
Kiểm tra Firebase project configuration

Đảm bảo service worker được register đúng

Kiểm tra console log trong browser

Thông báo không hiển thị
Kiểm tra browser notification permissions

Verify service worker installation

Kiểm tra FCM message format

Cron không chạy
Kiểm tra server log

Verify ENABLED state trong .state.json

Kiểm tra Firebase Admin SDK configuration

📝 Ghi chú
Demo sử dụng data-only messages để tránh trùng lặp thông báo

Service worker phải được host cùng origin với web app

HTTPS required cho production deployment

🛠 Tech Stack
Frontend: Vanilla JS + Firebase JS SDK

Backend: Node.js + Express

Scheduling: node-cron

Push Notifications: Firebase Cloud Messaging

Persistence: JSON file
