import React, { useState, useEffect } from 'react';
import SendMessage from '../Components/SendMessage';

import MessageDetails from '../Components/MessageDetails';
import { ethers } from 'ethers';
import ChatContract from '../Chat.sol/Chat.json';
import '../assets/Inbox.css';
import { Button, ListGroup } from 'react-bootstrap';
import { BsPencilSquare } from "react-icons/bs";
 import { FaInbox, FaStar } from "react-icons/fa";
import { MdNotificationImportant } from "react-icons/md";
import { MdLabelImportant } from "react-icons/md";
import Navbar from '../Components/NavBar';
import axios from "axios";


import { MY_CONTRACT_ADDRESS } from "../contractAddresses";
const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [Email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [senderEmails, setSenderEmails] = useState({});
  const [receiverEmails, setReceiverEmails] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const [selectedMessage, setSelectedMessage]= useState({});
  const [counter, setCounter]= useState(0);
  //var counter=0;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  const contractAddress = MY_CONTRACT_ADDRESS;
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddress , ChatContract.abi, signer);


   const  handleSelectedMessage = (message) => {

    setSelectedMessage(message);
    
   };

   useEffect( () => {
    if (counter == 1){
      setShowMessage(true);
      console.log("Selected Message", selectedMessage);
    };
    if (counter == 0)
    {
      setCounter(1);
    };

  }, [selectedMessage]);

  
 


  async function getName() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const result = await chatContract.getEmail(accounts[0]);
    setEmail(result);
    const result2 = await chatContract.getName(accounts[0]);
    setName(result2);
   
    const messagesReceived = await chatContract.MessageReceived(result);
    const messagesSent = await chatContract.MessageSent(result);

    const allMessages = [...messagesSent, ...messagesReceived];
    allMessages.sort((a, b) => b.timestamp - a.timestamp);

    setMessages(allMessages);

    const senderEmails = {};
    const receiverEmails = {};
    allMessages.forEach(message => {
      if (!(message.sender in senderEmails)) {
        getEmail(message.sender).then(email => setSenderEmails(prevState => ({
          ...prevState,
          [message.sender]: email
        })));
      }
      if (!(message.receiver in receiverEmails)) {
        getEmail(message.receiver).then(email => setReceiverEmails(prevState => ({
          ...prevState,
          [message.receiver]: email
        })));
      }
    });
  }
   
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
    const result = await chatContract.getEmail(adresse);
    return result;
  }

  useEffect(() => {
    getName();
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
   
    <div className="col-md-12" style={{ marginTop: '-80px', marginLeft: 250 }}>

    {Email && (
    

      <div>
       { showMessage && (
        <MessageDetails selectedMessage={selectedMessage} />
       ) }
       { !showMessage &&  ( 
        <div className="row">
          <div className="col-md-12">
          <div className="d-flex justify-content-between align-items-center" style={{padding: 10, width: "calc(98% - 250px)", borderBottom: "1px solid #ccc", marginTop: -35}}>
                <div className="m-2 d-flex align-items-center font-medium fs-4 gap-3" >
                  <h3>Bienvenue, {Name} !</h3>
                </div>
                <div className="mt-3 d-flex align-items-center font-medium gap-3">
                  <img src="./config.png" width={30} height={30} />
                </div>
            </div>
            <h1  style={{ marginTop: 10, marginBottom: 20, marginLeft: -270 , float: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: 30}}>Mes Messages</h1>
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0px",
                padding: "0",
                width: "calc(98% - 250px)",
                backgroundColor: "ghostwhite",
              }}
            >
              <li className="d-flex justify-content-between align-items-center" style={{padding: 10, borderBottom: "1px solid #ccc",}}>
                <div className="m-2 d-flex align-items-center font-medium fs-4 gap-3">
                  <img src="./logo.png" width={30} height={30} /><p className="m-0" style={{fontSize: '1.7rem' }}>inbox</p>
                </div>
                <div className="m-2 d-flex align-items-center font-medium gap-3">
                  <p className="m-0" style={{fontSize: '1.6rem' }}>1-50 of 354</p>
                </div>
              </li>
              {messages.map((message, index) => (
                <li
                  key={index}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                  style={{
                    borderBottom: "1px solid #ccc",
                    width: "100%",
                    padding: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: message.read ? "white" : "ghostwhite",
                  }}
                  onClick={()=>handleSelectedMessage(message)}
                >
                  <div>
                    <div className="row">
                      <div className="col-md-12">
                        <strong>From :</strong> {senderEmails[message.sender]}
                        <br/>
                        <strong>To : </strong>{receiverEmails[message.receiver]}
                      </div>
                      <div className="col-md-12">
                      <strong>{message.subject}</strong>
                      <br/>
                        <strong>Message : </strong>
                        {message.message.length > 100
                          ? `${message.message.substring(0, 100)}...`
                          : message.message}
                          <br/>
                      </div>
                      
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center",  minWidth: '80px'}}>
                    {hoverIndex === index ? (
                      <>
                        <button
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            marginRight: "10px",
                          }}
                        >
                          <img src="./reply.png" width={20} height={20} />
                        </button>
                        <button
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            marginRight: "10px",
                          }}
                        >
                          <img src="./reply2.png" width={20} height={20} />
                        </button>
                        <button
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <img src="./delete.png" width={20} height={20} />
                        </button>
                      </>
                    ) : (
                      <p className="d-flex justify-content-center" style={{float: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1}}>{formatTimestamp(message.timestamp.toNumber())}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
        </div>
      )} 

        
      </div>


    













) }
  
  </div>
   
  );
}

export default Messages;