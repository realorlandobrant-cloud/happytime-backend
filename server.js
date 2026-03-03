const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error("Mongo error ❌", err));

// ✅ VIDEO MODEL
const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model("Video", videoSchema);

// ✅ CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ STORAGE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "video",
    folder: "happytime",
  },
});

const upload = multer({ storage });

// ✅ ROOT (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ GET VIDEOS (FROM MONGO)
app.get("/videos", async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

// ✅ POST URL VIDEO
app.post("/videos", async (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  const newVideo = await Video.create({ title, url });
  res.json(newVideo);
});

// ✅ UPLOAD VIDEO (CLOUDINARY + MONGO)
app.post("/videos/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const newVideo = await Video.create({
    title: req.file.originalname,
    url: req.file.path,
  });

  res.json(newVideo);
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
