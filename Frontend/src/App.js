import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import ChatContract from "./Chat.sol/Chat.json";
import NameForum from "./NameForum";
import ConnectWallet from "./ConnectWallet";
import Login from "./Login";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import React from "react";
import Inbox from "./Inbox";

import SendMessage from "./SendMessage";
function App() {
  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
 const [connected,setConnected]=useState("");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  const contractAddress = '0x11e7d63d68704D2eEC1312928C0007dd886D21E0';
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddress , ChatContract.abi, signer);
  async function connectWallet() {
    const result= await window.ethereum.isConnected();
    console.log(result);
    setConnected(result);
  }

  useEffect(() => {
    connectWallet() ;
  }, []);
  return (
     <Router>
      <Routes>
      <Route path="/inbox" element={<Inbox />} />
      {connected ? (
      <>
        
        <Route path="/sendmsg" element={<SendMessage />} />
      </>
    ) : (
      <Route path="/login" element={<Login />} />
    )}
    <Route path="/create" element={<ConnectWallet />} />
    <Route path="/name" element={<NameForum />} />
  
    </Routes>
    </Router>

    /*<Inbox/>
   <SendMessage/>*/
  );
}

export default App;
