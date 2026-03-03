import express from "express";
import cors from "cors";

const app = express();

// ✅ REQUIRED for Render / Railway / etc
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors({
  origin: "*", // later you can restrict this
}));
app.use(express.json());

// ✅ ROOT ROUTE (IMPORTANT for uptime checks)
app.get("/", (req, res) => {
  res.send("Backend is LIVE");
});

// ✅ HEALTH CHECK (your frontend should call this)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ TEST ROUTE
app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

// ❌ Catch errors cleanly (prevents internal server error crashes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke" });
});

// ✅ START SERVER (CRITICAL LINE)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
