import React, { useState, useEffect } from 'react';
import axios from "axios";
import {contractAddressStructures, contractAddressChat} from "../App"
import ChatContract from '../Chat.sol/Chat.json';
import StructuresContract from '../Structures.sol/Structures.json';
import { ethers } from 'ethers';
import { ec } from 'elliptic';
import crypto from 'crypto-browserify';
const curve = new ec('secp256k1');


const MessageDetails = (selectedMessage) => {

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddressChat , ChatContract.abi, signer);
  const userContract = new ethers.Contract(contractAddressStructures , StructuresContract.abi, signer);
  
  const [imageUrl, setImageUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [counter, setCounter]= useState(0);
  const [senderEmail, setSenderEmail]= useState(0);
  const [receiverEmail, setReceiverEmail]= useState(0);
  const [fileHashes, setFileHashes] = useState([]);
  const [rep, setRep] = useState(false);
  const [replies, setReplies] = useState([]);
  const [decryptedSubject, setDecryptedSubject] = useState();
  
  var res=null;
  var loaded=false;

  const msg = selectedMessage;
  const msgC = msg.selectedMessage;

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

async function getSenderEmail(){
  const result = await userContract.getEmail(msgC.sender);
  const result1 = await userContract.getEmail(msgC.receiver);
  setSenderEmail(result);
  setReceiverEmail(result1);
  console.log("sender email is", senderEmail);
}


  console.log(msgC.message);
 console.log('file hash from smart contract'+ msgC.fileHash);
 console.log('file timestamp is '+ msgC.timestamp);

 useEffect( () => {
  if (counter == 1){
    console.log("Result changed", res);
  };
  if (counter == 0)
  {
    setCounter(1);
  };

}, [res]);

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

   //IPFS Receiving Files -------------------------------------------


   function base64ToDataURL(base64Image) {
    return `data:image/jpeg;base64,${base64Image}`;
  }

async function DecryptedReplies(replies){
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  var pubKey = '';
  if(accounts[0].toLowerCase() == msgC.sender.toLowerCase()){
     pubKey = await getRecieverPubKey(msgC.receiver);
  }else{
     pubKey = await getRecieverPubKey(msgC.sender);
  }
   const priKey = await getSenderPriKey(accounts[0]);
   const decryptedReplies = []
   for (let i = 0; i < replies.length; i++) {
    const decrypted = decryptMessage(replies[i], pubKey, priKey)
    decryptedReplies.push(decrypted);
   }
   return decryptedReplies;
}
  
 useEffect(() => {
    getSenderEmail();

    getFileFromIPFS();

    

    async function getReplies() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  var pubKey = '';
  if(accounts[0].toLowerCase() == msgC.sender.toLowerCase()){
     pubKey = await getRecieverPubKey(msgC.receiver);
  }else{
     pubKey = await getRecieverPubKey(msgC.sender);
  }
   const priKey = await getSenderPriKey(accounts[0]);
      const replies = await chatContract.getReplies(msgC.id);
      const encryptedMessages = replies.responses.map((message) => message.message);
      const senders = replies.responses.map((message) => message.sender);
      const receivers = replies.responses.map((message) => message.receiver);
      const filesHashs = replies.responses.map((message) => message.fileHash);
     console.log(filesHashs);
      var sendersEmails = [];
      var  receiversEmails = [];
      var filesHashes = [];
      for(let i = 0; i < filesHashs.length ; i++){
        if(filesHashs[i] == ""){
          filesHashes.push("");
        }else{
          console.log(filesHashs[i], pubKey, priKey);
         console.log( decryptMessage(filesHashs[i], pubKey, priKey));
          filesHashes.push(decryptMessage(filesHashs[i], pubKey, priKey));
        }
      }
      setFileHashes(filesHashes);
      var hashes = [];
      for (let i = 0; i < fileHashes.length ; i++){
        const res = await axios({
          method: 'get',
          url: `https://gateway.pinata.cloud/ipfs/`+ fileHashes[i],
          responseType: 'blob',
        });
        const contentType = res.headers['content-type'];
      if (contentType && contentType.startsWith('image/')) {
        // If the file is an image, display it
        const imgUrl = URL.createObjectURL(res.data);
        hashes.push(imgUrl);
        console.log(imageUrl);
        setFileUrl(null);
      } else {
        // For other file types, display a download link
        const fileUrl = URL.createObjectURL(res.data);
        console.log(fileUrl);
        setFileUrl(fileUrl);
        setImageUrl(null);
      }
      }
      for (let i = 0 ; i < senders.length ; i++){
        const senderEmail = await userContract.getEmail(senders[i]);
        const receiverEmail = await userContract.getEmail(receivers[i]);
        sendersEmails.push(senderEmail);
        receiversEmails.push(receiverEmail);
      }
      const timestamps = replies.responses.map((message) => formatTimestamp(message.timestamp.toNumber()));
  
      const decryptedReplies = await DecryptedReplies(encryptedMessages);
      const repliesArray = decryptedReplies.map((message, index) => {
        return {
          message: message,
          sender: sendersEmails[index],
          receiver: receiversEmails[index],
          fileHash: filesHashes[index],
          timestamp: timestamps[index],
        };
      });
  
      setReplies(repliesArray);
      console.log(replies);
    }
  
    getReplies();
    console.log(replies);
  }, []);

  const getFileFromIPFS = async (hash) => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      var pubKey = '';
      if(accounts[0].toLowerCase() == msgC.sender.toLowerCase()){
         pubKey = await getRecieverPubKey(msgC.receiver);
      }else{
         pubKey = await getRecieverPubKey(msgC.sender);
      }
      //const pubKey = await getRecieverPubKey(msgC.receiver);
      console.log(pubKey);
       const priKey = await getSenderPriKey(accounts[0]);
       setDecryptedSubject(msgC.subject);
      
       const decryptedFileHash = decryptMessage(msgC.fileHash, pubKey, priKey);
       console.log(`https://gateway.pinata.cloud/ipfs/`+ decryptedFileHash);
      const res = await axios({
        method: 'get',
        url: `https://gateway.pinata.cloud/ipfs/`+ decryptedFileHash,
        responseType: 'blob',
      });
  
      console.log('File retrieved from IPFS:', res.data);
  
      // Determine the file type based on the content type header
      const contentType = res.headers['content-type'];
      if (contentType && contentType.startsWith('image/')) {
        // If the file is an image, display it
        const imgUrl = URL.createObjectURL(res.data);
        setImageUrl(imgUrl);
        console.log(imageUrl);
        setFileUrl(null);
      } else {
        // For other file types, display a download link
        const fileUrl = URL.createObjectURL(res.data);
        console.log(fileUrl);
        setFileUrl(fileUrl);
        setImageUrl(null);
      }
  
    } catch (error) {
      console.log('Error retrieving file from IPFS:', error);
    }
  };
  
  return (
    <div>
      <br />
      <h2>{decryptedSubject}</h2>
      <hr />
      {replies.length === 0 ? (
  <div>
  <h5>
        <b>From: </b>
        {senderEmail}
      </h5>
      <h5>
        <b>To: </b>
        {msgC.receiversGroup}
      </h5>
      <h5>
        <b>Sent on: </b>
        {formatTimestamp(msgC.timestamp)}
      </h5>
      <p>{msgC.message}</p>
      <div>
      {imageUrl &&  <a href={imageUrl}download><img src={imageUrl} alt="Retrieved file" width={800}/></a>}
            {fileUrl && <a href={fileUrl} download>Download file</a>}
      </div>
      <hr/>
  </div>
) : (
  replies.map((msgC, index) => (
    <div key={index}>
      <h5>
        <b>From: </b>
        {msgC.sender}
      </h5>
      <h5>
        <b>To: </b>
        {msgC.receiver}
      </h5>
      <h5>
        <b>Sent on: </b>
        {msgC.timestamp}
      </h5>
      <p>{msgC.message}</p>
      <div>
      {imageUrl &&  <a href={imageUrl}download><img src={msgC.fileHash} alt="Retrieved file" width={800}/></a>}
            {fileUrl && <a href={fileUrl} download>Download file</a>}
      </div>
      <hr/>
    </div>
  ))
)}

    </div>
  );
};

export default MessageDetails;