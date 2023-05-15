import React, { useState, useEffect } from 'react';
import SendMessage from '../Components/SendMessage';
import { ethers } from 'ethers';
import ChatContract from '../Chat.sol/Chat.json';
import StructuresContract from '../Structures.sol/Structures.json';
import Messages from '../Components/Messages';
import '../assets/Inbox.css';
import { Button, ListGroup } from 'react-bootstrap';
import { BsPencilSquare } from "react-icons/bs";
 import { FaInbox, FaStar } from "react-icons/fa";
import { MdNotificationImportant } from "react-icons/md";
import { MdLabelImportant } from "react-icons/md";
// Importation de la Navbar et left bar
import Navbar from '../Components/NavBar';
import {contractAddressStructures, contractAddressChat} from "../App"
import { ec } from 'elliptic';
import crypto from 'crypto-browserify';
import axios from "axios";
//import Leftbar from './LeftBar';
const curve = new ec('secp256k1');


const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [senderEmails, setSenderEmails] = useState({});
  const [receiverEmails, setReceiverEmails] = useState({});
  const [showSendMessage, setShowSendMessage] = useState(false);
 
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddressChat , ChatContract.abi, signer);
  const userContract = new ethers.Contract(contractAddressStructures , StructuresContract.abi, signer);
  
  const handleSendMessage = (message) => {
    const newMessage = {
      sender:message.sender,
      receiver: message.receiver,
      subject: message.subject,
      body: message.message,
      timestamp: message.timestamp,
      read: message.read
    };
    setMessages([...messages, newMessage]);
    setShowSendMessage(false);
    console.log('messages',messages);
  };

  const handleToggleSendMessage = () => {
    setShowSendMessage(!showSendMessage);
  };

  async function getRecieverPubKey(address) {
    const pubKeyX = await userContract.getRecieverPubKey(address);
    //console.log(pubKeyX);
   // const bytes32PubKeyInverse = Buffer.from(pubKeyX, 'hex');
    //const pubKey = bytes32PubKeyInverse.toString('hex');
    const pubKey = pubKeyX.slice(2);
    return pubKey;
   }

   async function getSenderPriKey(address){
    const email = await userContract.getEmail(address);
    const priKey = sessionStorage.getItem('PrivateKey.'+email);
    return priKey;
   }

  function decryptMessage(ciphertextt, pubKey, priKey) {
    const sharedSecret = curve.keyFromPrivate(priKey, 'hex').derive(curve.keyFromPublic(pubKey, 'hex').getPublic()).toString('hex');
    const ciphertext = Buffer.from(ciphertextt, 'base64');
    const iv = ciphertext.slice(0, 16);
    const encryptedMessage = ciphertext.slice(16);
    const encryptionKey = sharedSecret.toString('hex').substr(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    const decryptedMessage = Buffer.concat([decipher.update(encryptedMessage), decipher.final()]);
    const final = decryptedMessage.toString('utf8');
    return final;
  };

  
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero to month
    const day = ("0" + date.getDate()).slice(-2); // Add leading zero to day
    const hours = ("0" + date.getHours()).slice(-2); // Add leading zero to hours
    const minutes = ("0" + date.getMinutes()).slice(-2); // Add leading zero to minutes
    const seconds = ("0" + date.getSeconds()).slice(-2); // Add leading zero to seconds
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  async function getEmail(adresse) {
    const result = await userContract.getEmail(adresse);
    return result;
  }

  useEffect(() => {
   // getName();
    // Lock horizontal scroll
    document.body.style.overflowX = 'hidden';

    // Clean up on unmount
    return () => {
      document.body.style.overflowX = 'auto';
    };
  }, []);

  const buttons = [
    
    { icon: <FaInbox className="w-[1.7rem]  h-[1.7rem]" />, title: "Inbox" },
    { icon: <FaStar className="w-[1.7rem]  h-[1.7rem]" />, title: "Sent" },
     {
      icon: <MdLabelImportant className="w-[1.7rem]  h-[1.7rem]" />,title: "Programmed",
    },
    
    { icon: <FaInbox className="w-[1.7rem]  h-[1.7rem]" />, title: "Spam" },
    { icon: <FaStar className="w-[1.7rem]  h-[1.7rem]" />, title: "Drafts" },
    {
      icon: <MdLabelImportant className="w-[1.7rem]  h-[1.7rem]" />,title: "Favourites",
    },
  ];

  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <div className="p-0" style={{fontSize: '1.6rem'}}>
      
      <Navbar style={{ zIndex: 1, width: '100%', position: 'fixed' }} className="pl-0 pr-0"/>
      <div className="row">
      <div className="col-md-2 offset-md-2" style={{ marginTop: '80px', zIndex: 1 }}>
      <div style={{ backgroundColor: 'white', height: '100%', position: 'fixed', top: 0, left: 0, width: 230, borderRight: '1px solid #ccc', fontSize: '1.3em'}}>
        <div style={{position: 'fixed', top: 60, left: 17,}}>
          <div style={{ padding: '20px 10px', marginLeft: -15 }}>
          <button className="btn btn-primary btn-orange btn-lg" style={{ backgroundColor: '#FB723F', borderRadius: '30px', height: 60 }} onClick={handleToggleSendMessage}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BsPencilSquare className="w-10 h-10 mr-2"/>
              <p style={{fontSize:'1.2em',}} className="text-white m-0">New Message</p>
            </div>
          </button>
          </div>
          <div className="pl-6 pt-4 flex items-center space-x-6">
      {buttons.map((button) => (
        <div key={button.title} className="text-gray-600 flex items-center gap-6" style={{marginTop: 6}}>
          <div className="flex items-center" >
            {button.icon}
            <span className="font-semibold ml-2" style={{position: 'relative', top: -4}}>{button.title}</span>
            
          </div>
        </div>
      ))}
    </div>
          </div>
        </div>
      </div>
      <div className="col-md-12">
      <Messages/>
      
    </div>
            <div className="col-md-12">
              {showSendMessage && <SendMessage onSendMessage={handleSendMessage} />}
            </div>
        </div>
    </div>
  );
}

export default Inbox;