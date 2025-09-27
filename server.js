import express from "express";
import { GoogleAuth } from "google-auth-library";

const app = express();
app.use(express.json());
app.use(express.static(".")); // phục vụ index.html và firebase-messaging-sw.js ở root

// 🔴 THAY BẰNG PROJECT ID CỦA BẠN
const PROJECT_ID = "notification-537d7";
// 🔴 Hết phần cần thay

const FCM_URL = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: "service-account.json", // service account JSON tải từ Google Cloud (IAM → Service Accounts)
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"]
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Cannot obtain access token");
  return token;
}

app.post("/send", async (req, res) => {
  try {
    const { token, title = "Hi 👋", body = "Simple FCM works!" } = req.body || {};
    if (!token) return res.status(400).send("Missing token");
    const accessToken = await getAccessToken();

    const r = await fetch(FCM_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body }
        }
      })
    });

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.listen(3000, () => console.log("http://localhost:3000"));
