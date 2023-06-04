// SPDX-License-Identifier: UNLICENSED0
pragma solidity ^0.8.9;

import "./Structures.sol";
import { Chat } from "./Chat.sol";

contract Operations {
    Structures structures;
    Chat chat;

    constructor() {
        structures = Structures(0x6C330e24A6BDfDf8017994C134E20FE35C38D03A);
        chat = Chat(0x1690926D949E258f61b9095EFAA0bF0D34A71171);
    }

    function getMessagesCount(string memory email) public view returns (uint) {
        uint count = 0;
        Chat.Message[] memory messages = chat.getAllArays();

        for (uint i = 0; i < messages.length; i++) {
            if (messages[i].sender == structures.getAddress(email)) {
                count++;
            }
        }

        return count;
    }


    function MessageSent(string memory email) public view returns (Chat.Message[] memory) {
        uint count = 0;
        Chat.Message[] memory messages = chat.getAllArays();

        for (uint i = 0; i < messages.length; i++) {
            if (
                (messages[i].sender == structures.getAddress(email)) &&
                (messages[i].deleted != Chat.DeletionStatus.DeletedBySender) &&
                (messages[i].deleted != Chat.DeletionStatus.DeletedBoth)
            ) {
                count++;
            }
        }

        Chat.Message[] memory messagesSent = new Chat.Message[](count);
        uint index = 0;

        for (uint i = 0; i < messages.length; i++) {
            if (
                (messages[i].sender == structures.getAddress(email)) &&
                (messages[i].deleted != Chat.DeletionStatus.DeletedBySender) &&
                (messages[i].deleted != Chat.DeletionStatus.DeletedBoth)
            ) {
                messagesSent[index] = messages[i];
                index++;
            }
        }

        return messagesSent;
    }

    function MessageReceived(string memory email) public view returns (Chat.Message[] memory) {
        uint count = 0;
        Chat.Message[] memory messages = chat.getAllArays();

        for (uint i = 0; i < messages.length; i++) {
            if (
                (messages[i].receiver == structures.getAddress(email)) &&
                (messages[i].timestamp <= block.timestamp) &&
                (messages[i].deleted != Chat.DeletionStatus.DeletedByReceiver) &&
                (messages[i].deleted != Chat.DeletionStatus.DeletedBoth)
            ) {
                count++;
            }
        }

        Chat.Message[] memory messagesReceived = new Chat.Message[](count);
        uint index = 0;

        for (uint i = 0; i < messages.length; i++) {
            if (
                (messages[i].receiver == structures.getAddress(email)) &&
                (messages[i].timestamp <= block.timestamp) &&
                (messages[i].deleted != Chat.DeletionStatus.DeletedByReceiver) &&
                (messages[i].deleted != Chat.DeletionStatus.DeletedBoth)
            ) {
                messagesReceived[index] = messages[i];
                index++;
            }
        }

        return messagesReceived;
    }
    
}
