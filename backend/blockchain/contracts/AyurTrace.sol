// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AyurTrace {
    struct Batch {
        uint256 id;
        string farmerName;
        string cropType;
        string photoUrl;
        string labReport;
        string manufacturerName;
        string finalProduct;
    }

    mapping(uint256 => Batch) public batches;
    uint256 public batchCount = 0;

    // ---- FARMER ----
    function addFarmerData(string memory _farmerName, string memory _cropType, string memory _photoUrl) public {
        batchCount++;
        batches[batchCount] = Batch(batchCount, _farmerName, _cropType, _photoUrl, "", "", "");
    }

    // ---- LAB ----
    function addLabData(uint256 _batchId, string memory _labReport) public {
        batches[_batchId].labReport = _labReport;
    }

    // ---- MANUFACTURER ----
    function addManufacturerData(uint256 _batchId, string memory _manufacturerName, string memory _finalProduct) public {
        batches[_batchId].manufacturerName = _manufacturerName;
        batches[_batchId].finalProduct = _finalProduct;
    }

    // ---- GET DATA ----
    function getBatch(uint256 _batchId) public view returns (Batch memory) {
        return batches[_batchId];
    }
}
