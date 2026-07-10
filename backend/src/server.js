import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import extractRoute from "./routes/extract.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Frontend (localhost:3000) se requests allow karne ke liye
app.use(cors());

// Incoming JSON body ko parse karne ke liye (CSV rows JSON format mein aayenge)
app.use(express.json({ limit: "10mb" }));

// Health check route — sirf ye test karne ke liye ki server chal raha hai
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GrowEasy CSV Importer backend chal raha hai" });
});

// AI extraction route — /api/extract
app.use("/api", extractRoute);

app.listen(PORT, () => {
  console.log(`Server chalu ho gaya: http://localhost:${PORT}`);
});
