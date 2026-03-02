const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(uploadDir));

// 🧠 memory storage
let videos = [];

// multer
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "video",
    folder: "happytime",
  },
});

const upload = multer({ storage });

// ✅ ROOT ROUTE (THIS FIXES YOUR ISSUE)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// GET videos
app.get("/videos", (req, res) => {
  res.json(videos);
});

// POST URL video
app.post("/videos", (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  videos.push({ title, url });
  res.json({ success: true });
});

// UPLOAD video
app.post("/videos/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const baseUrl = req.protocol + "://" + req.get("host");
  const videoUrl = req.file.path;

  videos.push({
    title: req.file.originalname,
    url: videoUrl,
  });

  res.json({ success: true, url: videoUrl });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
