const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ STORAGE (uploads go to Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "video",
    folder: "happytime",
  },
});

const upload = multer({ storage });

// ✅ FILE STORAGE (videos.json)
const dataFile = path.join(__dirname, "videos.json");

const getVideos = () => {
  try {
    const data = fs.readFileSync(dataFile);
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveVideos = (videos) => {
  fs.writeFileSync(dataFile, JSON.stringify(videos, null, 2));
};

// ✅ ROOT ROUTE (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ GET VIDEOS
app.get("/videos", (req, res) => {
  const videos = getVideos();
  res.json(videos);
});

// ✅ POST VIDEO (URL)
app.post("/videos", (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  const videos = getVideos();
  videos.push({ title, url });

  saveVideos(videos);

  res.json({ success: true });
});

// ✅ UPLOAD VIDEO (DRAG & DROP)
app.post("/videos/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const videoUrl = req.file.path; // Cloudinary URL

  const videos = getVideos();

  videos.push({
    title: req.file.originalname,
    url: videoUrl,
  });

  saveVideos(videos);

  res.json({ success: true, url: videoUrl });
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
