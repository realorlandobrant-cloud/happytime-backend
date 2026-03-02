const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ===== CLOUDINARY SETUP =====
const cloudinary = require("cloudinary").v2;

// only configure if env vars exist (prevents crash)
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ===== MULTER (TEMP STORAGE) =====
const upload = multer({ dest: "temp/" });

// ===== MEMORY STORAGE (TEMP DB) =====
let videos = [];

// ===== ROOT ROUTE (IMPORTANT FOR RENDER) =====
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ===== GET VIDEOS =====
app.get("/videos", (req, res) => {
  res.json(videos);
});

// ===== POST VIDEO URL =====
app.post("/videos", (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  videos.push({ title, url });
  res.json({ success: true });
});

// ===== UPLOAD VIDEO (CLOUDINARY) =====
app.post("/videos/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // if cloudinary not configured
    if (!cloudinary.config().cloud_name) {
      return res.status(500).json({
        error: "Cloudinary not configured",
      });
    }

    // upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "happytime",
    });

    const videoUrl = result.secure_url;

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

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
