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

const contractAddressStructures =  '0x6C330e24A6BDfDf8017994C134E20FE35C38D03A';
const contractAddressChat = '0x1690926D949E258f61b9095EFAA0bF0D34A71171';
const contractAddressOperations = '0xACfA2f1a9F7E3b54A6cAe2322b23ece319cB226A';
export { contractAddressStructures, contractAddressChat, contractAddressOperations };

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
