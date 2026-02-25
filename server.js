const cors = require("cors");

app.use(cors({
  origin: "*"
}));
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 📁 serve uploaded videos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🧠 in-memory storage (or replace with DB later)
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

// ✅ POST video via URL (your existing system)
app.post("/videos", (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  videos.push({ title, url });
  res.json({ success: true });
});

// ✅ 🚀 DRAG & DROP UPLOAD ROUTE
app.post("/videos/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const videoUrl = `http://localhost:5000/uploads/${req.file.filename}`;

  videos.push({
    title: req.file.originalname,
    url: videoUrl,
  });

  res.json({ success: true, url: videoUrl });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});