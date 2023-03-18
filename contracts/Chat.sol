// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Chat {
    struct User {
        string name;
        address walletAddress;
    }
    
    mapping (address => User) public users;
    address[] public userAddresses;
    address public admin;
    
    constructor() {
        admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    function createUser(string memory name, address walletAddress) public onlyAdmin {
        User memory user = User(name, walletAddress);
        users[walletAddress] = user;
        userAddresses.push(walletAddress);
    }
}
