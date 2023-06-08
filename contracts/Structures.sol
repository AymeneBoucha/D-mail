// SPDX-License-Identifier: UNLICENSED0
pragma solidity ^0.8.9;

contract Structures {
    struct User {
        string name;
        string email;
        bool exists;
        address walletAddress;
        bool enabled;
    }
    struct Secure {
        bytes32 seed;
        bytes32 password;
        bytes pubKey;
    }

    struct ID {
        bytes32 ID;
        string email;
    }

    ID[] public IDs;

    //mapping(bytes32 => string) public IDs;
    mapping(address => Secure) public Keys;
    mapping(address => User) public users;
    address[] public userAddresses;
    string[] public userEmails;
    address public admin;

    constructor() {
        admin = 0x7B60eD2A82267aB814256d3aB977ae5434d01d8b;
    }

    event LogString(uint message);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    //makeAdmin : to make someone an admin we change isAdmin=>true
    /*function makeAdmin(address userAddress) public onlyAdmin {
        users[userAddress].isAdmin = true;
    }*/

    function activate(address wallet) public onlyAdmin {
        require(
            wallet != address(0),
            "User with given address does not exist."
        );
        require(
            checkUserExists(wallet) == true,
            "User with given address does not exist"
        );
        users[wallet].enabled = true;
    }

    function desactivate(address wallet) public onlyAdmin {
        require(
            wallet != address(0),
            "User with given address does not exist."
        );
        require(
            checkUserExists(wallet) == true,
            "User with given address does not exist"
        );
        users[wallet].enabled = false;
    }

    function createUserId(string memory email, bytes32 Id) public onlyAdmin {
        for (uint256 i = 0; i < userEmails.length; i++) {
            require(
                !stringsEqual(userEmails[i], email),
                "The given email already exists!"
            );
        }
        ID memory id = ID(Id, email);
        IDs.push(id);
        userEmails.push(email);
    }

    // Define a new role for admins
    mapping(address => bool) private admins;

    function isAdmin(address user) public view returns (bool) {
        return admins[user];
    }

    function addAdmin(address userAddress) public onlyAdmin {
        admins[userAddress] = true;
    }

    /* function removeAdmin(address userAddress) public onlyAdmin {
        admins[userAddress] = false;
        users[userAddress].isAdmin = false;
    }*/
    mapping(string => address) usersByName;
    mapping(string => address) usersByEmail;

    //--------------------------------------------------------------------------------------

    function stringsEqual(
        string memory a,
        string memory b
    ) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function verifyUser(
        uint id,
        string memory email
    ) public view returns (bool) {
        bytes32 idHash = sha256(abi.encode(id));
        for (uint256 i = 0; i < IDs.length; i++) {
            if (IDs[i].ID == idHash && stringsEqual(IDs[i].email, email)) {
                return true;
            }
        }
        revert("You don't have permission to create an account!");
    }

    //Creat user
    function createUser(
        uint Id,
        string memory name,
        string memory email,
        address walletAddress,
        bytes32 seed,
        bytes32 password,
        bytes memory pubKey
    ) public {
        require(bytes(name).length > 0, "You have to specify your name !");  
        User memory user = User(name, email, true, walletAddress, true);
        Secure memory secure = Secure(seed, password, pubKey);
        users[walletAddress] = user;
        userAddresses.push(walletAddress);
        usersByName[name] = walletAddress;
        usersByEmail[email] = walletAddress;
        Keys[walletAddress] = secure;
        bytes32 idHash = sha256(abi.encode(Id));
        for (uint256 i = 0; i < IDs.length; i++) {
            if (IDs[i].ID == idHash) {
                uint256 lastIndex = IDs.length - 1;
                if (i != lastIndex) {
                    IDs[i] = IDs[lastIndex];
                }
                IDs.pop();
                return;
            }
        }
        revert("ID not found");
    }

    function checkUserExists(address user) public view returns (bool) {
        return bytes(users[user].email).length > 0;
    }

    //event MessageSent(address indexed sender, address indexed receiver, bytes32 encryptedMessage);

    function getRecieverPubKey(
        address receiver
    ) public view returns (bytes memory) {
        bytes memory pubKey = Keys[receiver].pubKey;
        return pubKey;
    }

    function verifyPassword(
        address sender,
        bytes32 password
    ) public view returns (bool) {
        require(Keys[sender].password == password, "Invalid Password");
        return true;
    }

    function verifySeed(
        address sender,
        bytes32 seed
    ) public view returns (bool) {
        require(Keys[sender].seed == seed, "Invalid Seed");
        return true;
    }

    function getAddress(string memory email) public view returns (address) {
        return usersByEmail[email];
    }

    function getName(address adresse) external view returns (string memory) {
        require(
            checkUserExists(adresse) == true,
            "User with given address don't exist"
        );
        return users[adresse].name;
    }

    function getEmail(address adresse) external view returns (string memory) {
        require(
            checkUserExists(adresse) == true,
            "User with given address don't exist"
        );
        return users[adresse].email;
    }

function countUsers(bool enabled) public view returns (uint) {
    uint cpt = 0;
    for(uint i = 0; i < userAddresses.length; i++){
        if(users[userAddresses[i]].enabled == enabled){
            cpt++;
        }
    }
    return cpt;
}

function getEmailByAddress(address wallet) public view returns(string memory){
    return users[wallet].email;
}

function getAllUsers() public view returns (User[] memory) {
    uint enabledUsersCount = countUsers(true);
    User[] memory allUsers = new User[](enabledUsersCount);
    uint currentIndex = 0;

    for (uint i = 0; i < userAddresses.length; i++) {
        if (users[userAddresses[i]].enabled == true) {
            allUsers[currentIndex] = users[userAddresses[i]];
            currentIndex++;
        }
    }

    return allUsers;
}

function getAllDesactivatedUsers() public view returns (User[] memory) {
    uint disabledUsersCount = countUsers(false);
    User[] memory allUsers = new User[](disabledUsersCount);
    uint currentIndex = 0;

    for (uint i = 0; i < userAddresses.length; i++) {
        if (users[userAddresses[i]].enabled == false) {
            allUsers[currentIndex] = users[userAddresses[i]];
            currentIndex++;
        }
    }

    return allUsers;
}


    function getAllUsersIDsBackup() public view returns (ID[] memory) {
        ID[] memory IDsBackup = new ID[](IDs.length);
        for (uint i = 0; i < IDs.length; i++) {
            IDsBackup[i] = IDs[i];
        }
        return IDsBackup;
    }

    function getAllUsersIDs() public view returns (ID[] memory) {
        return IDs;
    }

    //Change password
    function changePasswordUser(address walletAddress, bytes32 password) public {
        require(
            walletAddress != address(0),
            "User with given address does not exist."
        );
        Keys[walletAddress].password = password;
    }
}
