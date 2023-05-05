import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import ChatContract from "./Chat.sol/Chat.json";
import NameForum from "./pages/NameForum";
import ConnectWallet from "./pages/ConnectWallet";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import React from "react";
import Inbox from "./pages/Inbox";
import SendMessage from "./Components/SendMessage";
import Messages from "./Components/Messages";
import { MY_CONTRACT_ADDRESS } from "./contractAddresses";
function App() {
  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
 const [connected,setConnected]=useState("");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  const contractAddress = MY_CONTRACT_ADDRESS;
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
        <Route path="/messages" element={<Messages />} />
      </>
    ) : (
      <Route path="/login" element={<Login />} />
    )}
    <Route path="/create" element={<ConnectWallet />} />
    <Route path="/name" element={<NameForum />} />
    <Route path="/admin" element={<Admin/>} />
    </Routes>
    </Router>

    /*<Inbox/>
   <SendMessage/>*/
  );
}

export default App;
