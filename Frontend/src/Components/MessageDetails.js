import React, { useState, useEffect } from 'react';
import axios from "axios";

const MessageDetails = (selectedMessage) => {
   
  
  const [imageUrl, setImageUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  const msg = selectedMessage;
  const msgC = msg.selectedMessage;

  console.log(msgC.message);
 console.log('file hash from smart contract'+ msgC.fileHash);
   //IPFS Receiving Files -------------------------------------------

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
   
      <br/><br/>
      <h1>Message Details: </h1>
      <p><b>From:</b> {msgC.sender}</p>
      <p><b>To:</b> {msgC.receiver}</p>
      <h2>Subject: {msgC.subject}</h2>
      <p>{msgC.message}</p>
      <p>{msgC.fileHas}</p>
      {/* <p>Timestamp: {msgC.timestamp}</p> */}
      <div>
            <button onClick={getFileFromIPFS}>
              Get file
            </button>
            {imageUrl && <img src={imageUrl} alt="Retrieved file" />}
            {fileUrl && <a href={fileUrl} download>Download file</a>}

          </div>

    </div>
    
  );
};

export default MessageDetails;