const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

/* =========================
   ✅ MONGODB CONNECTION
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error(err));

/* =========================
   ✅ SCHEMA
========================= */
const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model("Video", videoSchema);

/* =========================
   ✅ CLOUDINARY CONFIG
========================= */
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

/* =========================
   ✅ ROUTES
========================= */

// root
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// get all videos
app.get("/videos", async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

// add video by URL
app.post("/videos", async (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  const newVideo = new Video({ title, url });
  await newVideo.save();

  res.json({ success: true });
});

// upload video file
app.post("/videos/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const newVideo = new Video({
    title: req.file.originalname,
    url: req.file.path, // Cloudinary URL
  });

  await newVideo.save();

  res.json({ success: true, url: req.file.path });
});

/* =========================
   ✅ START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
