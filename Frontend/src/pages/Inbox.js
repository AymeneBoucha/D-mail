import React, { useState, useEffect } from 'react';
import SendMessage from '../Components/SendMessage';
import Messages from '../Components/Messages';
import { ethers } from 'ethers';
import ChatContract from '../Chat.sol/Chat.json';
import '../assets/Inbox.css';
import { Button, ListGroup } from 'react-bootstrap';
import { BsPencilSquare } from "react-icons/bs";
 import { FaInbox, FaStar } from "react-icons/fa";
import { MdNotificationImportant } from "react-icons/md";
import { MdLabelImportant } from "react-icons/md";
// Importation de la Navbar et left bar
import Navbar from '../Components/NavBar';
//import Leftbar from './LeftBar';

import axios from "axios";


import { MY_CONTRACT_ADDRESS } from "../contractAddresses";
const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [showSendMessage, setShowSendMessage] = useState(false);
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