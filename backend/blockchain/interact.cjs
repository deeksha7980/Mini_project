require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI
const abiPath = path.join(__dirname, "artifacts/contracts/Counter.sol/Counter.json");
const abi = JSON.parse(fs.readFileSync(abiPath)).abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// Example function: read & write data
async function interact() {
  const currentValue = await contract.x();
  console.log("Current value:", currentValue.toString());

  console.log("Incrementing by 2...");
  const tx = await contract.incBy(2);
  await tx.wait();

  const newValue = await contract.x();
  console.log("New value:", newValue.toString());
}

interact().catch(console.error);
