// SPDX-License-Identifier: UNLICENSED0
pragma solidity ^0.8.9;

import "./Structures.sol";
contract Chat {
    Structures structures;
     constructor() {
    structures = Structures(0x6C330e24A6BDfDf8017994C134E20FE35C38D03A);
}
    enum DeletionStatus {
        NotDeleted,
        DeletedBySender,
        DeletedByReceiver,
        DeletedBoth
    }

     struct Message {
        uint256 id;
        address sender;
        address receiver;
        string subject;
        string message;
        uint256 timestamp;
        bool read;
        bool shareable;
        address[] viewedBy;
        uint256 originalMessageId;
        string fileHash;
        string receiversGroup;
        DeletionStatus deleted;
    }
    
    mapping(uint256 => bool) public rep;

    struct Reply {
       Message [] responses;
       bool rep;
    }

    mapping (uint256 => Reply) public replies;
    Message[] public messages;

function getAllArays() public view returns(Message[] memory) {
    return messages;
}

function getReplies(uint256 id) public view returns(Reply memory) {
    return replies[id];
}

    function replyTo(uint256 messageId, string memory response, Message memory messageOriginal, uint256 timestamp) external {
    if (replies[messageId].responses.length == 0) {
        replies[messageId].responses.push(messageOriginal);
        addReply(messageId, response, messageOriginal, true, timestamp);
    } else {
        addReply(messageId, response, messageOriginal, false, timestamp);
    }
}

function addReply(uint256 messageId, string memory response, Message memory messageOriginal, bool setRep, uint256 timestamp) private {
    uint256 messageTimestamp = (timestamp != 0) ? timestamp : block.timestamp;
    Message memory message = Message(
        messageCount,
        msg.sender,
        messageOriginal.sender,
        messageOriginal.subject,
        response,
        messageTimestamp,
        false,
        false,
        new address[](0),
        messageCount,
        messageOriginal.fileHash,
        messageOriginal.receiversGroup,
        DeletionStatus.NotDeleted
    );
    rep[messageCount] = true;
    messages.push(message);
    replies[messageId].responses.push(message);

    if (setRep) {
        replies[messageId].rep = true;
    }

    messageCount++;
}

    


    uint256 messageCount;
    uint256 shareCount;

      struct Share {
        uint256 messageId;
        uint256 timestamp;
        address sender;
        address receiver;
    }
    

     Share[] public shares;
    event MessageShared(
        uint256 shareId,
        uint256 messageId,
        address sender,
        address[] receivers
    );
     

      function sendMessage(
        address receiver,
        string calldata subject,
        string memory message,
        bool isShareable,
        string memory fileHash,
        string memory receiverGroup,
        uint256 timestamp
    ) external {
        require(
            structures.checkUserExists(msg.sender) == true,
            "You must have an account"
        );
        require(structures.checkUserExists(receiver) == true, "Recipient does not exist");

        uint256 messageTimestamp = (timestamp != 0) ? timestamp : block.timestamp;

        Message memory message = Message(
            messageCount,
            msg.sender,
            receiver,
            subject,
            message,
            messageTimestamp,
            false,
            isShareable,
                new address[](0),
                messageCount,
            fileHash,
            receiverGroup,
            DeletionStatus.NotDeleted
        );
        rep[messageCount] = false;
        messages.push(message);
        messageCount++;
    }

   function sendMessageToGroup(address[] memory receiver, string calldata subject, string []memory message, string []memory cciMessages,bool isShareble, string memory fileHash, string memory emailGroup, address[] memory cciReceivers, uint256 timestamp) external {
        require(
            structures.checkUserExists(msg.sender) == true,
            "You must have an account"
        );

        uint256 messageTimestamp = (timestamp != 0) ? timestamp : block.timestamp;

        for(uint i = 0; i<receiver.length; i++){
            require(structures.checkUserExists(receiver[i]) == true, "Recipient does not exist");
            Message memory message = Message(messageCount, msg.sender, receiver[i], subject, message[i], messageTimestamp, false, isShareble,
                new address[](0),
                messageCount, fileHash, emailGroup,DeletionStatus.NotDeleted);
                rep[messageCount] = false;
        messages.push(message);
        messageCount++;
        }
        for(uint i = 0; i<cciReceivers.length; i++){
            require(structures.checkUserExists(cciReceivers[i]) == true, "Recipient does not exist");
            Message memory message = Message(messageCount, msg.sender, cciReceivers[i], subject, cciMessages[i], messageTimestamp, false, isShareble,
                new address[](0),
                messageCount,fileHash, '',DeletionStatus.NotDeleted);
                rep[messageCount] = false;
        messages.push(message);
        messageCount++;
        }

        }      

         function shareMessage(uint256 messageId, address[] calldata receivers) external {
    require(messageId < messages.length, "Invalid message ID");
    require(structures.checkUserExists(msg.sender) == true, "You must have an account");
    Message storage messageToShare = messages[messageId];
    uint256 originalMessageid = messages[messageId].originalMessageId;
    require(messageToShare.shareable == true, "Message is not shareable");

    for (uint256 i = 0; i < receivers.length; i++) {
        require(structures.checkUserExists(receivers[i]), "Receiver does not exist");
        Share memory newShare = Share(messageId, block.timestamp, msg.sender, receivers[i]);
        shares.push(newShare);
        
        // Set the originalMessageId of the shared message to the ID of the original message
        Message memory sharedMessage = Message(
            messageCount,
            msg.sender,
            receivers[i],
            messageToShare.subject,
            messageToShare.message,
            block.timestamp,
            false,
            true,
            new address[](0),
            messages[messageId].originalMessageId,
            messageToShare.fileHash,
            messageToShare.receiversGroup,
            DeletionStatus.NotDeleted
        );
        messageCount++;
        messages.push(sharedMessage);
        rep[messageCount] = false;
    }
    emit MessageShared(shareCount, messageId, msg.sender, receivers);
    shareCount++;
}


    function getViewedBy(uint256 messageId) public view returns (address[] memory) {
        return messages[messageId].viewedBy;
    }

function viewMessage(uint256 messageId) public {
    uint256 originalMessageid = messages[messageId].originalMessageId;
    messages[messageId].read= true;
    messages[originalMessageid].read= true;

    bool found = false;
    for (uint256 i = 0; i < messages[messageId].viewedBy.length; i++) {
        if (messages[messageId].viewedBy[i] == msg.sender) {
            found = true;
            break;
        }
    }
    if (!found) {
        messages[messageId].viewedBy.push(msg.sender);
    }

    found = false;
    for (uint256 i = 0; i < messages[originalMessageid].viewedBy.length; i++) {
        if (messages[originalMessageid].viewedBy[i] == msg.sender) {
            found = true;
            break;
        }
    }
    if (!found) {
        messages[originalMessageid].viewedBy.push(msg.sender);
    }
}

function getShares(uint256 messageId) external view returns (Share[] memory) {
        require(messageId < messages.length, "Invalid message ID");

        uint256 count = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            if (messages[messageId].originalMessageId == messageId ) {
                count++;
            }
        }
        Share[] memory messageShares = new Share[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            if (messages[messageId].originalMessageId == messageId) {
                messageShares[index] = shares[i];
                index++;
            }
        }
        return messageShares;
    }

    function deleteMessage(address walletAddress, uint256 id) public {
        require(
            structures.checkUserExists(walletAddress),
            "User with given address does not exist."
        );
        Message storage message = messages[id];
        if (message.sender == walletAddress) {
            if (message.deleted == DeletionStatus.DeletedByReceiver) {
                message.deleted = DeletionStatus.DeletedBoth;
            } else {
                message.deleted = DeletionStatus.DeletedBySender;
            }
        }
        if (message.receiver == walletAddress) {
            if (message.deleted == DeletionStatus.DeletedBySender) {
                message.deleted = DeletionStatus.DeletedBoth;
            } else {
                message.deleted = DeletionStatus.DeletedByReceiver;
            }
        }
    }


   
}