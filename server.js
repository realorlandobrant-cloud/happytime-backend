const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ FIX: use environment PORT (REQUIRED for deployment)
const PORT = process.env.PORT || 5000;

// ✅ middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ ensure uploads folder exists (prevents crash)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 📁 serve uploaded videos
app.use("/uploads", express.static(uploadDir));

// 🧠 in-memory storage
let videos = [];

// 📦 multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ GET videos
app.get("/videos", (req, res) => {
  res.json(videos);
});

// ✅ POST video via URL
app.post("/videos", (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  videos.push({ title, url });
  res.json({ success: true });
});

// ✅ 🚀 DRAG & DROP UPLOAD ROUTE (FIXED URL)
app.post("/videos/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // ✅ dynamic base URL (works locally + deployed)
  const baseUrl = req.protocol + "://" + req.get("host");

  const videoUrl = `${baseUrl}/uploads/${req.file.filename}`;

  videos.push({
    title: req.file.originalname,
    url: videoUrl,
  });

  res.json({ success: true, url: videoUrl });
});

// ✅ START SERVER (FIXED)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
