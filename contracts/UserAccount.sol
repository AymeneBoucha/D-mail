// SPDX-License-Identifier: UNLICENSED0
pragma solidity ^0.8.0;

contract UserAccount {
    struct Account {
        string username;
        string email;
        bool active;
    }

    mapping (address => Account) accounts;

    function createAccount(string memory _username, string memory _email) public {
        accounts[msg.sender] = Account(_username, _email, true);
    }

    function updateAccount(string memory _username, string memory _email) public {
        require(accounts[msg.sender].active == true, "Account does not exist");
        accounts[msg.sender].username = _username;
        accounts[msg.sender].email = _email;
    }

    function deleteAccount() public {
        require(accounts[msg.sender].active == true, "Account does not exist");
        accounts[msg.sender].active = false;
    }

    function getAccount() public view returns (string memory, string memory, bool) {
        return (accounts[msg.sender].username, accounts[msg.sender].email, accounts[msg.sender].active);
    }
}
