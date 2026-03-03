const express = require("express");
const cors = require("cors");
const multer = require("multer");
<<<<<<< HEAD
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
=======
const fs = require("fs");
const path = require("path");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
>>>>>>> 292fbf584639e7e4c63230f62a1a4ab3bef5c50a

const app = express();
const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
// ✅ MIDDLEWARE
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error ❌", err));

// ✅ VIDEO MODEL
const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
});

const Video = mongoose.model("Video", videoSchema);

// ✅ CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ STORAGE
=======
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ STORAGE (uploads go to Cloudinary)
>>>>>>> 292fbf584639e7e4c63230f62a1a4ab3bef5c50a
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "video",
    folder: "happytime",
  },
});

const upload = multer({ storage });

<<<<<<< HEAD
// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ GET VIDEOS (FROM DATABASE)
app.get("/videos", async (req, res) => {
  const videos = await Video.find().sort({ _id: -1 });
  res.json(videos);
});

// ✅ POST VIDEO URL (SAVE TO DATABASE)
app.post("/videos", async (req, res) => {
=======
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
>>>>>>> 292fbf584639e7e4c63230f62a1a4ab3bef5c50a
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

<<<<<<< HEAD
  const newVideo = new Video({ title, url });
  await newVideo.save();
=======
  const videos = getVideos();
  videos.push({ title, url });

  saveVideos(videos);
>>>>>>> 292fbf584639e7e4c63230f62a1a4ab3bef5c50a

  res.json({ success: true });
});

<<<<<<< HEAD
// ✅ UPLOAD VIDEO (CLOUDINARY + DATABASE)
app.post("/videos/upload", upload.single("video"), async (req, res) => {
=======
// ✅ UPLOAD VIDEO (DRAG & DROP)
app.post("/videos/upload", upload.single("video"), (req, res) => {
>>>>>>> 292fbf584639e7e4c63230f62a1a4ab3bef5c50a
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

<<<<<<< HEAD
  const newVideo = new Video({
=======
  const videoUrl = req.file.path; // Cloudinary URL

  const videos = getVideos();

  videos.push({
>>>>>>> 292fbf584639e7e4c63230f62a1a4ab3bef5c50a
    title: req.file.originalname,
    url: req.file.path,
  });

<<<<<<< HEAD
  await newVideo.save();

  res.json({ success: true, url: req.file.path });
=======
  saveVideos(videos);

  res.json({ success: true, url: videoUrl });
>>>>>>> 292fbf584639e7e4c63230f62a1a4ab3bef5c50a
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
