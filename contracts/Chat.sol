// SPDX-License-Identifier: UNLICENSED0
pragma solidity ^0.8.9;

import "./Structures.sol";
contract Chat {
    Structures structures;
     constructor() {
    structures = Structures(0x984C5a79a47e385c0224D9617DCc69dcDdDE0DDC);
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
        //uint256 shares;
        //uint256 views;
        address[] viewedBy;
        uint256 originalMessageId;
        string fileHash;
        string receiversGroup;
        DeletionStatus deleted;
    }
    struct Share {
        uint256 messageId;
        uint256 timestamp;
        address sender;
        address receiver;
    }

    struct Reply {
       Message [] responses;
       bool rep;
    }

    mapping (uint256 => Reply) public replies;


     function replyTo (uint256 messageId, string memory response, Message memory messageOriginal,bool shareable) external  {
        if (replies[messageId].responses.length == 0){
            replies[messageId].responses.push(messageOriginal);
            Message memory message = Message(
                messageCount,
            msg.sender,
            messageOriginal.sender,
            messageOriginal.subject,
            response,
            block.timestamp,
            false,
            shareable,
                //0,
                //0,
                new address[](0),
                messageCount,
            messageOriginal.fileHash,
            messageOriginal.receiversGroup,
            DeletionStatus.NotDeleted
            );
            replies[messageId].responses.push(message);
            replies[messageId].rep = true;
        }else{
            Message memory message = Message(
                messageCount,
            msg.sender,
            messageOriginal.sender,
            messageOriginal.subject,
            response,
            block.timestamp,
            false,
            shareable,
                //0,
                //0,
                new address[](0),
                messageCount,
            messageOriginal.fileHash,
            messageOriginal.receiversGroup,
            DeletionStatus.NotDeleted
            );
            replies[messageId].responses.push(message);
        }
    }
    


    uint256 messageCount;
    uint256 shareCount;

     Share[] public shares;
    event MessageShared(
        uint256 shareId,
        uint256 messageId,
        address sender,
        address[] receivers
    );
      Message[] public messages;

      function sendMessage(
        address receiver,
        string calldata subject,
        string memory message,
        bool isShareable,
        string memory fileHash,
        string memory receiverGroup
    ) external {
        require(
            structures.checkUserExists(msg.sender) == true,
            "You must have an account"
        );
        require(structures.checkUserExists(receiver) == true, "Recipient does not exist");
        //address[] memory receivers = new address[](1);
        //receivers[0] = receiver;
        Message memory message = Message(
            messageCount,
            msg.sender,
            receiver,
            subject,
            message,
            block.timestamp,
            false,
            isShareable,
                //0,
                //0,
                new address[](0),
                messageCount,
            fileHash,
            receiverGroup,
            DeletionStatus.NotDeleted
        );
        messages.push(message);
        //emit MessageSent(msg.sender, receiver, messageHash);
        messageCount++;
    }

   function sendMessageToGroup(address[] memory receiver, string calldata subject, string []memory message, string []memory cciMessages,bool isShareble, string memory fileHash, string memory emailGroup, address[] memory cciReceivers) external {
        require(
            structures.checkUserExists(msg.sender) == true,
            "You must have an account"
        );
        for(uint i = 0; i<receiver.length; i++){
            require(structures.checkUserExists(receiver[i]) == true, "Recipient does not exist");
            Message memory message = Message(messageCount, msg.sender, receiver[i], subject, message[i], block.timestamp, false, isShareble,
                //0,
               // 0,
                new address[](0),
                messageCount, fileHash, emailGroup,DeletionStatus.NotDeleted);
        messages.push(message);
        messageCount++;
        }
        for(uint i = 0; i<cciReceivers.length; i++){
            require(structures.checkUserExists(cciReceivers[i]) == true, "Recipient does not exist");
            Message memory message = Message(messageCount, msg.sender, cciReceivers[i], subject, cciMessages[i], block.timestamp, false, isShareble,
               // 0,
                //0,
                new address[](0),
                messageCount,fileHash, '',DeletionStatus.NotDeleted);
        messages.push(message);
        messageCount++;
        }
        
        //emit MessageSent(msg.sender, receiver, messageHash);
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
        //messageToShare.shares++;
       //messages[originalMessageid].shares++;
        
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
            //0,
            //0,
            new address[](0),
            messages[messageId].originalMessageId,
            messageToShare.fileHash,
            messageToShare.receiversGroup,
            DeletionStatus.NotDeleted
        );
        messageCount++;
        messages.push(sharedMessage);
    }
    emit MessageShared(shareCount, messageId, msg.sender, receivers);
    shareCount++;
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

    function getViewedBy(uint256 messageId) public view returns (address[] memory) {
        return messages[messageId].viewedBy;
    }

function viewMessage(uint256 messageId) public {
    uint256 originalMessageid = messages[messageId].originalMessageId;
  // messages[messageId].views++;
    //messages[originalMessageid].views++;
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



    function deleteMessage(address walletAddress, uint256 id) public {
        require(
            structures.checkUserExists(walletAddress),
            "User with given address does not exist."
        );
        Message storage message = messages[id];
        //Message storage message = getMessageById(id);
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
     function getMessagesCount(string memory email) public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < messages.length; i++) {
            if (messages[i].sender == structures.getAddress(email)) {
                count++;
            }
        }
        return count;
    }

    function MessageSent(
        string memory email
    ) public view returns (Message[] memory) {
        uint count = 0;
        for (uint i = 0; i < messages.length; i++) {
            if (
                (messages[i].sender == structures.getAddress(email)) &&
                (messages[i].deleted != DeletionStatus.DeletedBySender) &&
                (messages[i].deleted != DeletionStatus.DeletedBoth)
            ) {
                count++;
            }
        }
        Message[] memory messagesSent = new Message[](count);
        uint index = 0;
        for (uint i = 0; i < messages.length; i++) {
            if (
                (messages[i].sender == structures.getAddress(email)) &&
                (messages[i].deleted != DeletionStatus.DeletedBySender) &&
                (messages[i].deleted != DeletionStatus.DeletedBoth)
            ) {
                messagesSent[index] = messages[i];
                index++;
            }
        }
        return messagesSent;
    }

    function MessageReceived(
        string memory email
    ) public view returns (Message[] memory) {
        uint count = 0;
        for (uint i = 0; i < messages.length; i++) {
            if (
                (messages[i].receiver == structures.getAddress(email)) &&
                (messages[i].deleted != DeletionStatus.DeletedByReceiver) &&
                (messages[i].deleted != DeletionStatus.DeletedBoth)
            ) {
                count++;
            }
        }
        Message[] memory messagesRecieved = new Message[](count);
        uint index = 0;
        for (uint i = 0; i < messages.length; i++) {
            if (
                (messages[i].receiver == structures.getAddress(email)) &&
                (messages[i].deleted != DeletionStatus.DeletedByReceiver) &&
                (messages[i].deleted != DeletionStatus.DeletedBoth)
            ) {
                messagesRecieved[index] = messages[i];
                index++;
            }
        }
        return messagesRecieved;
    }


   
}