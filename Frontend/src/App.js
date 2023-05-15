import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import ChatContract from './Chat.sol/Chat.json';
import StructuresContract from './Structures.sol/Structures.json';
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

const contractAddressStructures =  '0xc0e774b4F92804bEB5c2E142Cc6d676e79619A43';
const contractAddressChat = '0x1DbaAa60DDe19C00DD0BCBB9f69e69578a544e9E';
export { contractAddressStructures, contractAddressChat };

function App() {
  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
 const [connected,setConnected]=useState("");


 const provider = new ethers.providers.Web3Provider(window.ethereum);
 const signer = provider.getSigner();
 const chatContract = new ethers.Contract(contractAddressChat , ChatContract.abi, signer);
 const userContract = new ethers.Contract(contractAddressStructures , StructuresContract.abi, signer);


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

        
        <Route path="/sendmsg" element={<SendMessage />} />

      <Route path="/" element={<Login />} />

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
