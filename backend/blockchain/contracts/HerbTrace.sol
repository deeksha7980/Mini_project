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
