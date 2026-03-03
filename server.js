const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ DEBUG: check env
console.log("MONGO_URI =", process.env.MONGO_URI ? "FOUND ✅" : "MISSING ❌");

// ✅ middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ CONNECT TO MONGO WITH FULL ERROR LOGGING
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
  })
  .catch((err) => {
    console.error("MongoDB FAILED ❌");
    console.error(err);
  });

// ✅ schema
const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model("Video", videoSchema);

// ✅ cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ upload
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: "video",
    folder: "happytime",
  },
});

const upload = multer({ storage });

// ✅ root
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ get videos
app.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error("GET /videos error:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// ✅ post url
app.post("/videos", async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: "Missing data" });
    }

    const newVideo = await Video.create({ title, url });
    res.json(newVideo);
  } catch (err) {
    console.error("POST /videos error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ upload file
app.post("/videos/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newVideo = await Video.create({
      title: req.file.originalname,
      url: req.file.path,
    });

    res.json(newVideo);
  } catch (err) {
    console.error("UPLOAD error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
