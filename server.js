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
app.use(express.static(".")); // phục vụ index.html & sw

// Khởi tạo Admin SDK
const serviceAccount = JSON.parse(await fs.readFile(path.join(__dirname, "service-account.json"), "utf8"));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const messaging = admin.messaging();

// Trạng thái
let ENABLED = false;
let TOKENS = new Set(); // có thể nhiều thiết bị
let lastSentAt = null;
let CURRENT_MESSAGE = {
  title: "⏰ Ping 30s",
  body : "Thông báo mặc định"
};

// Lưu/đọc trạng thái
const stateFile = path.join(__dirname, ".state.json");
async function saveState() {
  const data = { ENABLED, TOKENS: Array.from(TOKENS), lastSentAt, CURRENT_MESSAGE };
  await fs.writeFile(stateFile, JSON.stringify(data, null, 2));
}
async function loadState() {
  try {
    const s = JSON.parse(await fs.readFile(stateFile, "utf8"));
    ENABLED = !!s.ENABLED;
    TOKENS = new Set(s.TOKENS || []);
    lastSentAt = s.lastSentAt || null;
    if (s.CURRENT_MESSAGE) CURRENT_MESSAGE = s.CURRENT_MESSAGE;
  } catch {}
}
await loadState();

// Cron mỗi 30s: GỬI DATA-ONLY (không có 'notification')
cron.schedule("*/30 * * * * *", async () => {
  if (!ENABLED || TOKENS.size === 0) return;
  try {
    const now = new Date();
    const dataPayload = {
      title: String(CURRENT_MESSAGE.title ?? "⏰ Ping 30s"),
      body : String((CURRENT_MESSAGE.body ?? "Thông báo") + " | " + now.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })),
      url  : "/"
    };
    const results = [];
    for (const t of TOKENS) {
      try {
        // data-only: MỌI GIÁ TRỊ PHẢI LÀ STRING
        const id = await messaging.send({ token: t, data: dataPayload });
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

// API
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
  res.json({ enabled: ENABLED, tokens: TOKENS.size, lastSentAt, nextRun: ENABLED ? "30s" : null, CURRENT_MESSAGE });
});

// Cập nhật nội dung thông báo từ client
app.post("/setMessage", async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: "Missing title/body" });
  CURRENT_MESSAGE = { title: String(title), body: String(body) };
  await saveState();
  res.json({ ok: true, CURRENT_MESSAGE });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
