// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HerbTrace {
    struct Product {
        uint id;
        string name;
        string origin;
        string processStage;
        string timestamp;
    }

    mapping(uint => Product) public products;
    uint public productCount = 0;

    event ProductAdded(uint id, string name, string origin, string processStage, string timestamp);

    function addProduct(
        string memory _name,
        string memory _origin,
        string memory _processStage,
        string memory _timestamp
    ) public {
        productCount++;
        products[productCount] = Product(productCount, _name, _origin, _processStage, _timestamp);
        emit ProductAdded(productCount, _name, _origin, _processStage, _timestamp);
    }
    struct LabApproval {
    string labName;
    string certificate;
    string timestamp;
}

mapping(uint => LabApproval) public approvals;

event HerbApproved(uint id, string labName, string certificate, string timestamp);

    function approveHerbData(
    uint _id,
    string memory _labName,
    string memory _certificate,
    string memory _timestamp
    ) public {
    approvals[_id] = LabApproval(_labName, _certificate, _timestamp);
    emit HerbApproved(_id, _labName, _certificate, _timestamp);
    }

    function getProduct(uint _id) public view returns (
        uint,
        string memory,
        string memory,
        string memory,
        string memory
    ) {
        Product memory p = products[_id];
        return (p.id, p.name, p.origin, p.processStage, p.timestamp);
    }
}
