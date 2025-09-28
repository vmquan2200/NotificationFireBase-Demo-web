import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // serve index.html & sw

// Khởi tạo Admin SDK từ service-account.json (đặt cùng thư mục với server.js)
const serviceAccount = JSON.parse(await fs.readFile(path.join(__dirname, "service-account.json"), "utf8"));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const messaging = admin.messaging();

// Trạng thái bật/tắt và danh sách token được bật
let ENABLED = false;
let TOKENS = new Set(); // cho phép nhiều thiết bị nếu cần
let lastSentAt = null;

// Lưu/đọc trạng thái để không mất khi restart
const stateFile = path.join(__dirname, ".state.json");
async function saveState() {
  const data = { ENABLED, TOKENS: Array.from(TOKENS), lastSentAt };
  await fs.writeFile(stateFile, JSON.stringify(data, null, 2));
}
async function loadState() {
  try {
    const s = JSON.parse(await fs.readFile(stateFile, "utf8"));
    ENABLED = !!s.ENABLED;
    TOKENS = new Set(s.TOKENS || []);
    lastSentAt = s.lastSentAt || null;
  } catch {}
}
await loadState();

// Cron mỗi phút: gửi tới tất cả token đã enable
cron.schedule("* * * * *", async () => {
  if (!ENABLED || TOKENS.size === 0) return;
  try {
    const now = new Date();
    const message = {
      notification: {
        title: "⏰ Ping mỗi phút",
        body: "Bây giờ là " + now.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      }
    };
    const results = [];
    for (const t of TOKENS) {
      try {
        const id = await messaging.send({ ...message, token: t });
        results.push({ token: t.slice(0,16) + "...", id });
      } catch (e) {
        results.push({ token: t.slice(0,16) + "...", error: String(e) });
      }
    }
    lastSentAt = now.toISOString();
    console.log("[cron] sent", results.map(r => r.id || r.error));
    await saveState();
  } catch (e) { console.error("[cron error]", e); }
});

// API đơn giản
app.post("/enable", async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Missing token" });
  TOKENS.add(token);
  ENABLED = true;
  await saveState();
  res.json({ ok: true, enabled: ENABLED, tokens: TOKENS.size });
});

app.post("/disable", async (req, res) => {
  ENABLED = false;
  await saveState();
  res.json({ ok: true, enabled: ENABLED });
});

app.post("/status", (req, res) => {
  res.json({ enabled: ENABLED, tokens: TOKENS.size, lastSentAt, nextRun: ENABLED ? "mỗi phút" : null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
