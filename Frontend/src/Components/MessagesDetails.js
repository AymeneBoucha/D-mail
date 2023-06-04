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
  const [rep, setRep] = useState(false);
  const [replies, setReplies] = useState([]);
  
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
  setSenderEmail(result);
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
  if(accounts[0] == msgC.sender){
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
      const replies = await chatContract.getReplies(msgC.id);
      const encryptedMessages = replies.responses.map((message) => message.message);
      const senders = replies.responses.map((message) => message.sender);
      const receivers = replies.responses.map((message) => message.receiver);
      var sendersEmails = [];
      var  receiversEmails = [];
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
          timestamp: timestamps[index],
        };
      });
  
      setReplies(repliesArray);
    }
  
    getReplies();
  }, []);

  const getFileFromIPFS = async (hash) => {
    try {
      const res = await axios({
        method: 'get',
        url: `https://gateway.pinata.cloud/ipfs/`+msgC.fileHash,
        responseType: 'blob',
       
      });
  
      console.log('File retrieved from IPFS:', res.data);
  
      // Determine the file type based on the content type header
      const contentType = res.headers['content-type'];
      if (contentType && contentType.startsWith('image/')) {
        // If the file is an image, display it
        const imgUrl = URL.createObjectURL(res.data);
        setImageUrl(imgUrl);
        setFileUrl(null);
      } else {
        // For other file types, display a download link
        const fileUrl = URL.createObjectURL(res.data);
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
      <h2>{msgC.subject}</h2>
      <hr />
      {replies.map((msgC, index) => (
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
            {msgC.imageUrl && <a href={msgC.imageUrl} download><img src={msgC.imageUrl} alt="Retrieved file" /></a>}
            {msgC.fileUrl && <a href={msgC.fileUrl} download>Download file</a>}
          </div>
          <hr/>
        </div>
      ))}
    </div>
  );
};

export default MessageDetails;