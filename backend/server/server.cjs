// -------------------- Imports --------------------
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "80mb" }));

// -------------------- Paths --------------------
const ROOT = __dirname;
const UPLOADS_DIR = path.join(ROOT, "uploads");
const DATA_FILE = path.join(ROOT, "farmerData.json");
const FRONTEND_DIR = path.join(__dirname, "../../frontend");

// Ensure folders/files exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");

// -------------------- Blockchain Setup --------------------
let contract;

try {
  const contractJsonPath = path.join(__dirname, "../blockchain/artifacts/contracts/AyurTrace.sol/AyurTrace.json");
  const contractJson = require(contractJsonPath);

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractJson.abi, wallet);

  console.log("✅ Blockchain contract connected successfully!");
} catch (err) {
  console.error("❌ Blockchain setup failed:", err.message);
  process.exit(1);
}

// -------------------- Utility Functions --------------------
function safeReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeWriteJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf8");
}

function saveBase64Image(base64Data, herbName = "herb") {
  const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");

  const ext = match[1].split("/")[1];
  const filename = `${herbName}_${Date.now()}.${ext}`;

  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));

  // LOCALHOST VERSION (works inside your lan)
  return `http://localhost:${process.env.PORT || 5000}/uploads/${filename}`;
}

// -------------------- Routes --------------------
app.get("/", (_, res) => res.send("Backend running with blockchain enabled!"));

// 🧑‍🌾 Farmer Route
app.post("/api/farmer", async (req, res) => {
  try {
    const { farmerName, herbName, latitude, longitude, timestamp, image } = req.body;

    if (!farmerName || !herbName || !image)
      return res.status(400).json({ error: "Missing required fields" });

    const photoUrl = saveBase64Image(image, herbName);
    const data = safeReadJson(DATA_FILE);

    const herbId = `${herbName.toLowerCase()}${data.length + 1}`;

    const entry = {
      farmerName,
      herbName,
      herbId,
      latitude,
      longitude,
      timestamp: timestamp || new Date().toLocaleString(),
      photoUrl,
      status: "pending",
    };

    // Store on blockchain
    const tx = await contract.addFarmerData(farmerName, herbName, photoUrl);
    await tx.wait();

    console.log(`🔗 Added to blockchain: ${tx.hash}`);

    data.push(entry);
    safeWriteJson(DATA_FILE, data);

    res.json({ message: "Farmer data stored!", entry });
  } catch (err) {
    console.error("❌ /api/farmer error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔬 Lab Approval / Rejection
app.post("/api/lab", async (req, res) => {
  try {
    const { herbId, labName, certificate, decision } = req.body;  
    // decision = "approved" | "rejected"

    console.log("📩 Lab Decision:", { herbId, labName, certificate, decision });

    // Load local data
    const data = safeReadJson(DATA_FILE);
    const herb = data.find(h => h.herbId === herbId);

    if (!herb) {
      return res.status(404).json({ error: "Herb not found" });
    }

    const batchId = parseInt(herbId.match(/\d+$/)?.[0]);
    if (isNaN(batchId)) return res.status(400).json({ error: "Invalid herbId format" });

    const timestamp = new Date().toISOString();

    // ⭐ IMPORTANT FIX — store correct status
    herb.status = decision;   
    herb.labName = labName;
    herb.certificate = certificate;
    herb.labTimestamp = timestamp;

    // ⭐ Blockchain only for approved herbs
    if (decision === "approved") {
      try {
        if (contract && typeof contract.approveHerbData === "function") {
          console.log("⛓ Blockchain approval...");
          const tx = await contract.approveHerbData(
            batchId,
            labName,
            certificate,
            timestamp
          );
          await tx.wait();
          console.log("🔗 Blockchain TX:", tx.hash);
        } else {
          console.warn("approveHerbData() not found in contract");
        }
      } catch (err) {
        console.error("❌ Blockchain error:", err.message);
      }
    } else {
      console.log("❌ Herb rejected — skipping blockchain write");
    }

    safeWriteJson(DATA_FILE, data);

    res.json({ message: "Saved successfully!", herb });

  } catch (err) {
    console.error("❌ /api/lab error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📦 Approved Herbs Only
app.get("/api/approved-herbs", (_, res) => {
  res.json(safeReadJson(DATA_FILE).filter(h => h.status === "approved"));
});

// 📂 All Farmer Data
app.get("/api/farmers-local", (_, res) => {
  res.json(safeReadJson(DATA_FILE));
});

// -------------------- Static Files --------------------
app.use("/uploads", express.static(UPLOADS_DIR));

if (fs.existsSync(FRONTEND_DIR)) {
  app.use("/frontend", express.static(FRONTEND_DIR));

  app.get(/^\/frontend\/([^\/]+)$/, (req, res) => {
    const filePath = path.join(FRONTEND_DIR, req.params[0]);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).send("Page not found");
  });

  app.get(/^\/(frontend\/)?consumer\.html/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "consumer.html"));
  });

  app.get(/^\/frontend.*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });

  console.log("🧩 Serving frontend from:", FRONTEND_DIR);
}

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 AyurTrace backend running at: http://localhost:${PORT}`);
  console.log("📁 farmerData.json:", DATA_FILE);
  console.log("📂 uploads folder:", UPLOADS_DIR);
});
