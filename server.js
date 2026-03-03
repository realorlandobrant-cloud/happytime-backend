const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ MIDDLEWARE
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

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

// ✅ STORAGE (VIDEOS → CLOUDINARY)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "video",
    folder: "happytime",
  },
});

const upload = multer({ storage });

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ GET VIDEOS (FROM DATABASE)
app.get("/videos", async (req, res) => {
  const videos = await Video.find().sort({ _id: -1 });
  res.json(videos);
});

// ✅ POST VIDEO VIA URL
app.post("/videos", async (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  const newVideo = new Video({ title, url });
  await newVideo.save();

  res.json({ success: true });
});

// ✅ DRAG & DROP UPLOAD (TO CLOUDINARY)
app.post("/videos/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const newVideo = new Video({
    title: req.file.originalname,
    url: req.file.path, // cloudinary url
  });

  await newVideo.save();

  res.json({ success: true, url: req.file.path });
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
