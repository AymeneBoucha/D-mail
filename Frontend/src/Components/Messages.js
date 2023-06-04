import React, { useState, useEffect } from 'react';
import MessageDetails from './MessagesDetails';
import { ethers } from 'ethers';
import ChatContract from '../Chat.sol/Chat.json';
import StructuresContract from '../Structures.sol/Structures.json';
import OperationsContract from '../Operations.sol/Operations.json';
import { BsArrowLeft  } from "react-icons/bs";
import { BsReplyFill  } from "react-icons/bs";
import { BsBoxArrowUpRight  } from "react-icons/bs";
import { BsTrashFill  } from "react-icons/bs";
import '../assets/Inbox.css';
import '../assets/SharesList.css';
import { ec } from 'elliptic';
import crypto from 'crypto-browserify';
import {contractAddressStructures, contractAddressChat, contractAddressOperations} from "../App"
import ReplyMessage from '../Components/ReplyMessage';
const curve = new ec('secp256k1');



const Messages = ( { selectedButton } ) => {
  const [messages, setMessages] = useState([]);
  const [Email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [senderEmails, setSenderEmails] = useState({});
  const [receiverEmails, setReceiverEmails] = useState({});
  const [senderShares, setSenderShares] = useState({});
  const [receiverShares, setReceiverShares] = useState({});
  const [showViewedbyModal, setShowViewedbyModal] = useState(false);
  const [showShares, setShowShares] = useState(false);
  const [shareList, setShareList] = useState([]);
  const [viewedbyList, setViewedbyList] = useState([]);
  const [shares, setShares] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [selectedMessage, setSelectedMessage]= useState({});
  const [counter, setCounter]= useState(0);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [showReplyMessage, setShowReplyMessage] = useState(false);

  //var counter=0;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddressChat , ChatContract.abi, signer);
  const userContract = new ethers.Contract(contractAddressStructures , StructuresContract.abi, signer);
  const opContract = new ethers.Contract(contractAddressOperations , OperationsContract.abi, signer);

  const backToMessages = () => {
    console.log("going back");
    setShowMessage(false);
    setCounter(0);
    setSelectedMessage({});
  };

  async function handleSelectedMessage  (message) {

    setSelectedMessage(message);
    console.log(message.id);
    if(message.read == false){
    const tx = await chatContract.viewMessage(message.id)
    }
   }; 

   const handleReplyMessage = (message) => {
    
    setShowReplyMessage(false);
    console.log('messages',messages);
  };

   const handleToggleReplyMessage = () => {
    setShowReplyMessage(!showReplyMessage);
  };

   const handleShareMessage = async (message) => {
    const recipientEmails = prompt("Please enter the email addresses of the recipients, separated by commas:");
    if (!recipientEmails || !/\S+@\S+\.\S+/.test(recipientEmails)) {
      alert("Please enter valid email addresses.");
      return;
    }
    console.log(`message:`,{message});
    const newshare={
      id: message.id,
      timestamp: Date.now(),
      sender: message.receiver,
      receiver: recipientEmails,
      read: false,
    };
    console.log(`share:`,{newshare});

    setShares([...shares, newshare]);
    const recipientAddresses = recipientEmails.split(",").map(email => userContract.getAddress(email));
    const tx = await chatContract.shareMessage(message.id, recipientAddresses);
  
    const recipientNames = recipientEmails.split(",").join(", ");
    console.log(`Message ${message.id} shared with recipients ${recipientNames}. Transaction hash: ${tx.transactionHash}`);
    alert(`Message "${message.subject}" shared with recipients ${recipientNames}.`);
  };
     async function handleShare(message) {
      const shareList = await chatContract.getShares(message.id);
      console.log(shareList);
      setShowShares(true);
      setShareList(shareList);
    }

    async function handleView(message) {
      const viewedby = await chatContract.getViewedBy(message.id);
      setShowViewedbyModal(true);
      setViewedbyList(viewedby);
    }

  async function DeleteMessage  (message) {

    // console.log("message is: ", message);
    // console.log("message id is: ", message.id)
    //setDeletedMessage(message);
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const address = accounts[0];
    console.log("current user is: ", address)
    const tx = await chatContract.deleteMessage(address, message.id);
    console.log(tx.hash); 
    return tx; 

    
   };
   const handleDeleteMessage =(message)=> {

    console.log("message is: ", message);
    console.log("message id is: ", message.id)
    //setDeletedMessage(message);
    DeleteMessage(message);
    
   };


  async function getRecieverPubKey(address) {
    const pubKeyX = await userContract.getRecieverPubKey(address);
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


   useEffect( () => {
    if (counter == 1){
      setShowMessage(true);
      //console.log("Selected Message", selectedMessage);
    };
    if (counter == 0)
    {
      setCounter(1);
    };

  }, [selectedMessage]);

  
 async function getInboxMessages(){
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const result = await userContract.getEmail(accounts[0]);
  setEmail(result);
  const result2 = await userContract.getName(accounts[0]);
  setName(result2);
 
  const MyPriKey = await getSenderPriKey(accounts[0]);

  const messagesReceived = await opContract.MessageReceived(result);
  const DecryptedMessagesReceived = [];

  for (let i = 0; i < messagesReceived.length; i++) {
    if (messagesReceived[i].timestamp <= Math.floor(Date.now() / 1000)) {
      const pubKeyR = await getRecieverPubKey(messagesReceived[i].sender);
      const decryptedMessage = decryptMessage(messagesReceived[i].message, pubKeyR, MyPriKey);
      const newMessage = {
        ...messagesReceived[i],
        message: decryptedMessage,
      };
      DecryptedMessagesReceived.push(newMessage);
    }
  }

  const keepUniqueMessages = (messages) => {
    const uniqueMessages = [];
    for (const message of messages) {
      if (!uniqueMessages.some((otherMessage) => {
        return formatTimestamp(message.timestamp) === formatTimestamp(otherMessage.timestamp) &&
          message.sender === otherMessage.sender &&
          message.receivers_group === otherMessage.receivers_group;
      })) {
        uniqueMessages.push(message);
      }
    }
    return uniqueMessages;
  };

  const allMessages = [...keepUniqueMessages(DecryptedMessagesReceived)];
    allMessages.sort((a, b) => b.timestamp - a.timestamp); 
   console.log(allMessages);
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

 async function getSentMessages(){
  
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const result = await userContract.getEmail(accounts[0]);
  setEmail(result);
  const result2 = await userContract.getName(accounts[0]);
  setName(result2);
 
  const MyPriKey = await getSenderPriKey(accounts[0]);

  const messagesSent = await opContract.MessageSent(result);
  const DecryptedMessagesSent = [];

  for (let i = 0; i < messagesSent.length; i++) {
    if (messagesSent[i].timestamp <= Math.floor(Date.now() / 1000)) {
      const pubKeyS = await getRecieverPubKey(messagesSent[i].receiver);
      const decryptedMessage = decryptMessage(messagesSent[i].message, pubKeyS, MyPriKey);
      const newMessage = {
        ...messagesSent[i],
        message: decryptedMessage,
      };
      DecryptedMessagesSent.push(newMessage);
    }
  }

  const keepUniqueMessages = (messages) => {
    const uniqueMessages = [];
    for (const message of messages) {
      if (!uniqueMessages.some((otherMessage) => {
        return formatTimestamp(message.timestamp) === formatTimestamp(otherMessage.timestamp) &&
          message.sender === otherMessage.sender &&
          message.receivers_group === otherMessage.receivers_group;
      })) {
        uniqueMessages.push(message);
      }
    }
    return uniqueMessages;
  };

  const allMessages = [...keepUniqueMessages(DecryptedMessagesSent)];
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

 async function getProgrammedMessages(){
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const result = await userContract.getEmail(accounts[0]);
  setEmail(result);
  const result2 = await userContract.getName(accounts[0]);
  setName(result2);
 
  const MyPriKey = await getSenderPriKey(accounts[0]);

  const messagesSent = await opContract.MessageSent(result);
  const DecryptedMessagesSent = [];

  for (let i = 0; i < messagesSent.length; i++) {
    if (messagesSent[i].timestamp > Math.floor(Date.now() / 1000)) {
      const pubKeyS = await getRecieverPubKey(messagesSent[i].receiver);
      const decryptedMessage = decryptMessage(messagesSent[i].message, pubKeyS, MyPriKey);
      const newMessage = {
        ...messagesSent[i],
        message: decryptedMessage,
      };
      DecryptedMessagesSent.push(newMessage);
    }
  }

  const keepUniqueMessages = (messages) => {
    const uniqueMessages = [];
    for (const message of messages) {
      if (!uniqueMessages.some((otherMessage) => {
        return formatTimestamp(message.timestamp) === formatTimestamp(otherMessage.timestamp) &&
          message.sender === otherMessage.sender &&
          message.receivers_group === otherMessage.receivers_group;
      })) {
        uniqueMessages.push(message);
      }
    }
    return uniqueMessages;
  };

  const allMessages = [...keepUniqueMessages(DecryptedMessagesSent)];
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

 async function getDraftsMessages(){
  
 }


  async function getName() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const result = await userContract.getEmail(accounts[0]);
    setEmail(result);
    const result2 = await userContract.getName(accounts[0]);
    setName(result2);
   
    const MyPriKey = await getSenderPriKey(accounts[0]);

    const messagesReceived = await opContract.MessageReceived(result);
    const messagesSent = await opContract.MessageSent(result);
    const DecryptedMessagesReceived = [];
    const DecryptedMessagesSent = [];

    for (let i = 0; i < messagesReceived.length; i++) {
      if (messagesReceived[i].timestamp <= Math.floor(Date.now() / 1000)) {
        const pubKeyR = await getRecieverPubKey(messagesReceived[i].sender);
        const decryptedMessage = decryptMessage(messagesReceived[i].message, pubKeyR, MyPriKey);
        const newMessage = {
          ...messagesReceived[i],
          message: decryptedMessage,
        };
        DecryptedMessagesReceived.push(newMessage);
      }
    }
    

    for (let i = 0; i < messagesSent.length; i++) {
  if (messagesSent[i].timestamp <= Math.floor(Date.now() / 1000)) {
    const pubKeyS = await getRecieverPubKey(messagesSent[i].receiver);
    const decryptedMessage = decryptMessage(messagesSent[i].message, pubKeyS, MyPriKey);
    const newMessage = {
      ...messagesSent[i],
      message: decryptedMessage,
    };
    DecryptedMessagesSent.push(newMessage);
  }
}

    
    const keepUniqueMessages = (messages) => {
      const uniqueMessages = [];
      for (const message of messages) {
        if (!uniqueMessages.some((otherMessage) => {
          return formatTimestamp(message.timestamp) === formatTimestamp(otherMessage.timestamp) &&
            message.sender === otherMessage.sender &&
            message.receivers_group === otherMessage.receivers_group;
        })) {
          uniqueMessages.push(message);
        }
      }
      return uniqueMessages;
    };
    
    const allMessages = [...keepUniqueMessages(DecryptedMessagesReceived), ...keepUniqueMessages(DecryptedMessagesSent)];
    allMessages.sort((a, b) => b.timestamp - a.timestamp);

console.log(allMessages);
    setMessages(allMessages);

    const senderEmails = {};
    const receiverEmails = {};
    const senderShares = {};
    const receiverShares = {};
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

    shareList.forEach(share => {
      if (!(share.sender in senderShares)) {
        getEmail(share.sender).then(email => setSenderShares(prevState => ({
          ...prevState,
          [share.sender]: email
        })));
      }
      if (!(share.receiver in receiverShares)) {
        getEmail(share.receiver).then(email => setReceiverShares(prevState => ({
          ...prevState,
          [share.receiver]: email
        })));
      }
    });
  }

  useEffect(() => {
    // Fetch messages based on the selectedButton
    fetchMessages(selectedButton);
  }, [selectedButton]);

  const fetchMessages = (buttonTitle) => {
    if (buttonTitle === 'Inbox') {
      getInboxMessages();
    } else if (buttonTitle === 'Sent') {
      getSentMessages();
    } else if (buttonTitle === 'Programmed') {
      getProgrammedMessages();
    } else if (buttonTitle === 'Drafts') {
     getDraftsMessages();
    }
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
    const result = await userContract.getEmail(adresse);
    return result;
  }

  useEffect(() => {
    //getName();

    // Lock horizontal scroll
    document.body.style.overflowX = 'hidden';
    // Clean up on unmount
    return () => {
      document.body.style.overflowX = 'auto';
      
    };
  }, []);

 


  return (
   
     <div className="col-md-12" style={{ marginTop: '-80px', marginLeft: 250 }}>

    {Email && (
    

      <div>
       { showMessage && (
        <span>
              <button 
              className="btn btn-primary btn-orange" 
              style={{ backgroundColor: 'white', color: '#FB723F', borderRadius: '30px', border: '2px solid #FB723F', margin: '0 1rem', fontSize:'1.1em'}}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#F64A0B", e.target.style.color = "white")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white", e.target.style.color = "#F64A0B")}
              onClick={backToMessages}>         
              <BsArrowLeft  className="w-10 h-10 mr-2"/>Back
              </button>
              <button 
              className="btn btn-primary btn-orange" 
              style={{ backgroundColor: 'white', color: 'gray', borderRadius: '30px', border: '2px solid gray', margin: '0 1rem', fontSize:'1.1em'}} 
              onMouseEnter={(e) => (e.target.style.backgroundColor = "gray", e.target.style.color = "white")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white", e.target.style.color = "gray")}
              onClick={handleToggleReplyMessage}>         
              <BsReplyFill  className="w-10 h-10 mr-2"/>Reply
              </button>
              <button 
              className="btn btn-primary btn-orange" 
              style={{ backgroundColor: 'white', color: 'gray', borderRadius: '30px', border: '2px solid gray', margin: '0 1rem', fontSize:'1.1em'}} 
              onMouseEnter={(e) => (e.target.style.backgroundColor = "gray", e.target.style.color = "white")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white", e.target.style.color = "gray")}
              onClick={backToMessages}>       
              <BsBoxArrowUpRight  className="w-10 h-10 mr-2"/>Forward  
              </button>
              <button 
              className="btn btn-primary btn-orange" 
              style={{ backgroundColor: 'white', color: 'gray', borderRadius: '30px', border: '2px solid gray', margin: '0 1rem', fontSize:'1.1em'}} 
              onMouseEnter={(e) => (e.target.style.backgroundColor = "gray", e.target.style.color = "white")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "white", e.target.style.color = "gray")}
              onClick={()=>handleDeleteMessage(selectedMessage)}>         
              <BsTrashFill  className="w-10 h-10 mr-2"/>Delete
              </button>
          </span>
       ) }
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
    cursor: 'pointer'
  }}
  onClick={() => handleSelectedMessage(message)}
>
  <div>
    <div className="row">
      <div className="col-md-12">
        <strong>From :</strong> {senderEmails[message.sender]}
        <br />
        <strong>To: </strong>
        {message.receiversGroup === "" ? receiverEmails[message.receiver] : message.receiversGroup}
      </div>
      <div className="col-md-12">
        <strong>{message.subject}</strong>
        <br />
        <strong>Message : </strong>
        {message.message.length > 100 ? `${message.message.substring(0, 100)}...` : message.message}
        <br />
      </div>
    </div>

    <div className="buttons-container" style={{marginLeft: -12}}>
      <button className="btn btn-outline-info" onClick={() => handleShare(message)}>Shares</button>
      {showShares && (
        <div className="popup">
          {shareList.length > 0 && (
            <div className="share-content">
              <span className="close" onClick={() => setShowShares(false)}>&times;</span>
              <h2>Shared with:</h2>
              <ul className="list-group">
                {shareList.map((share, index) => (
                  <li key={index} className="list-group-item">
                    <strong>{senderShares[share.sender]}</strong> shared with <strong>{receiverShares[share.receiver]}</strong> at <strong>{formatTimestamp(share.timestamp.toNumber())}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button className="btn btn-outline-info" onClick={() => handleView(message)}>Views</button>
      {showViewedbyModal && (
        <div className="popup">
          <div className="view-content">
            <span className="close" onClick={() => setShowViewedbyModal(false)}>&times;</span>
            <h2>Viewed By:</h2>
            <ul className="list-group">
              {viewedbyList.map((viewer, index) => (
                <li key={index} className="list-group-item">{viewer}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  </div>
  <div style={{ display: "flex", alignItems: "center", minWidth: '80px' }}>
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
          <img src="./reply.png" width={20} height={20} onClick={() => handleShareMessage(message)} />
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
          <img src="./delete.png" onClick={() => handleDeleteMessage(message)} width={20} height={20} />
        </button>
      </>
    ) : (
      <p className="d-flex justify-content-center" style={{ float: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>{formatTimestamp(message.timestamp.toNumber())}</p>
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
<div className="col-md-12">
              {showReplyMessage && <ReplyMessage selectedMessage={selectedMessage} />}
            </div>
  </div>
   
  );
}

export default Messages;