// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    struct LabApproval {
        string labName;
        string certificate;
        string timestamp;
    }

    mapping(uint256 => Batch) public batches;
    mapping(uint256 => LabApproval) public approvals;

    uint256 public batchCount = 0;

    event FarmerDataAdded(uint256 batchId, string farmerName, string cropType, string photoUrl);
    event LabDataAdded(uint256 batchId, string labReport);
    event HerbApproved(uint256 batchId, string labName, string certificate, string timestamp);
    event ManufacturerDataAdded(uint256 batchId, string manufacturerName, string finalProduct);

    // ---- FARMER ----
    function addFarmerData(
        string memory _farmerName,
        string memory _cropType,
        string memory _photoUrl
    ) 
        public 
    {
        batchCount++;
        batches[batchCount] = Batch(batchCount, _farmerName, _cropType, _photoUrl, "", "", "");

        emit FarmerDataAdded(batchCount, _farmerName, _cropType, _photoUrl);
    }

    // ---- LAB ----
    function addLabData(uint256 _batchId, string memory _labReport) public {
        batches[_batchId].labReport = _labReport;

        emit LabDataAdded(_batchId, _labReport);
    }

    // ---- LAB APPROVAL ----
    function approveHerbData(
        uint256 _batchId,
        string memory _labName,
        string memory _certificate,
        string memory _timestamp
    ) 
        public 
    {
        approvals[_batchId] = LabApproval(_labName, _certificate, _timestamp);

        emit HerbApproved(_batchId, _labName, _certificate, _timestamp);
    }

    // ---- MANUFACTURER ----
    function addManufacturerData(
        uint256 _batchId, 
        string memory _manufacturerName, 
        string memory _finalProduct
    ) 
        public 
    {
        batches[_batchId].manufacturerName = _manufacturerName;
        batches[_batchId].finalProduct = _finalProduct;

        emit ManufacturerDataAdded(_batchId, _manufacturerName, _finalProduct);
    }

    // ---- GET DATA ----
    function getBatch(uint256 _batchId) public view returns (Batch memory) {
        return batches[_batchId];
    }

    function getApproval(uint256 _batchId) public view returns (LabApproval memory) {
        return approvals[_batchId];
    }
}
