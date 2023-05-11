import React, { useState, useEffect } from 'react';
import axios from "axios";
import {contractAddress} from "../App"
import ChatContract from '../Chat.sol/Chat.json';
import { ethers } from 'ethers';


const MessageDetails = (selectedMessage) => {

  const provider = new ethers.providers.Web3Provider(window.ethereum); 
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddress , ChatContract.abi, signer);
  
  const [imageUrl, setImageUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [counter, setCounter]= useState(0);
  const [senderEmail, setSenderEmail]= useState(0);
  
  var res=null;
  var loaded=false;

  const msg = selectedMessage;
  const msgC = msg.selectedMessage;

async function getSenderEmail(){
  const result = await chatContract.getEmail(msgC.sender);
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

  
  useEffect(() => {
    getSenderEmail();
    if(loaded==false){
        getFileFromIPFS();
    }
    loaded=true;
    console.log('Component mounted!');
  }, []);

   const getFileFromIPFS = async () => {
    try {
      console.log("before axios");
      const res = await axios.get('https://gateway.pinata.cloud/ipfs/'+msgC.fileHash, {
        // headers: {
        //   'Accept': 'text/plain'
        // }
      })
      //console.log("Correct Header Status:", res.data)
      console.log("after axios, res is", res);



      //console.log('File retrieved from IPFS:', res.data);
  
      // Determine the file type based on the content type header
      const contentType = res.headers['content-type'];
      if (contentType && contentType.startsWith('image/')) {
        // If the file is an image, display it
        const imageBase64 = res.data;
        const binaryString = atob(imageBase64);
        const blob = new Blob([binaryString], { type: 'image/jpeg' });
        const imgUrl = URL.createObjectURL(blob);
        console.log("imgUrl is", imgUrl);
        setImageUrl(imgUrl);
        setFileUrl(null);
      } else {
          //for text files
          if (contentType && contentType.startsWith('text/')){
            const blob = new Blob([res.data], { type: 'text/plain' });
            const fileUrl = URL.createObjectURL(blob);
            setFileUrl(fileUrl);
            setImageUrl(null);
          }
          else{
                if (contentType && contentType.startsWith('application/pdf')){
                  alert("pdf functionality will be added soon");
                  // const blob = new Blob([res.data], { type: 'application/pdf' });
                  // const fileUrl = URL.createObjectURL(blob);
                  // setFileUrl(fileUrl);
                  // setImageUrl(null);
                }
                else{
                  alert("file type not supported yet");
                  // // For other file types, display a download link
                  // const fileUrl = URL.createObjectURL(res.data);
                  // setFileUrl(fileUrl);
                  // setImageUrl(null);
                }
          }
      }
  
    } catch (error) {
      console.log('Error retrieving file from IPFS:', error);
    }
  };
  
  return (
    
    <div>
   
      <br/>
      <h2>{msgC.subject}</h2>
      <hr/>
      <h5><b>From: </b>{senderEmail}</h5>
      <h5><b>Sent on: </b>{formatTimestamp(msgC.timestamp.toNumber())}</h5>
      <br/>
      <p>{msgC.message}</p>
      <br/>
      <div>
            {imageUrl && <img src={imageUrl} alt="Retrieved file" />}
            {fileUrl && <a href={fileUrl} download = 'DmailDownload.txt'>Download file</a>}
      </div>

    </div>
    
  );
};

export default MessageDetails;