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

// ✅ MongoDB connect (NO deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ✅ schema
const Video = mongoose.model("Video", {
  title: String,
  url: String,
});

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

// ✅ ROOT (so your site doesn’t say “cannot get /”)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ GET videos
app.get("/videos", async (req, res) => {
  const vids = await Video.find().sort({ _id: -1 });
  res.json(vids);
});

// ✅ POST URL video
app.post("/videos", async (req, res) => {
  const { title, url } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Missing data" });
  }

  await Video.create({ title, url });

  res.json({ success: true });
});

// ✅ UPLOAD video (drag + drop)
app.post("/videos/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const videoUrl = req.file.path;

  await Video.create({
    title: req.file.originalname,
    url: videoUrl,
  });

  res.json({ success: true, url: videoUrl });
});

// ✅ start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
