const express = require("express");
const cors = require("cors");

const app = express();

// 🔥 VERY IMPORTANT
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ TEST ROUTE (THIS FIXES "OFFLINE")
app.get("/api/status", (req, res) => {
  res.json({ status: "online" });
});

// 🧠 TEMP STORAGE (replace with DB later if needed)
let videos = [];

// ✅ GET VIDEOS
app.get("/videos", (req, res) => {
  res.json(videos);
});

// ✅ ADD VIDEO (URL)
app.post("/videos", (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  videos.push({ title, url });

  res.json({ success: true });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
