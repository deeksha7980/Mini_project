const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "farmerData.json");

console.log("🔍 __dirname =", __dirname);
console.log("📁 Expected path =", file);
console.log("📄 Exists =", fs.existsSync(file));
