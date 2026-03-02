const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// 🧠 TEMP memory (resets on restart)
let videos = [];

// ✅ SAFETY CHECK (THIS FIXES DEPLOY CRASH)
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Missing Cloudinary ENV variables");
}

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "video",
    folder: "happytime",
  },
});

const upload = multer({ storage });

// ✅ ROOT ROUTE (prevents "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ GET videos
app.get("/videos", (req, res) => {
  res.json(videos);
});

// ✅ POST URL video
app.post("/videos", (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  videos.push({ title, url });
  res.json({ success: true });
});

// ✅ UPLOAD video (Cloudinary)
app.post("/videos/upload", upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const videoUrl = req.file.path;

    videos.push({
      title: req.file.originalname,
      url: videoUrl,
    });

    res.json({ success: true, url: videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
