const hre = require("hardhat");

async function main() {
  const AyurTrace = await hre.ethers.getContractFactory("AyurTrace");
  const ayurTrace = await AyurTrace.deploy();

  await ayurTrace.waitForDeployment();
  console.log("✅ AyurTrace deployed to:", await ayurTrace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
