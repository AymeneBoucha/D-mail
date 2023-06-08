import { ethers } from "ethers";
import { useState, useEffect } from "react";
import ChatContract from "./Chat.sol/Chat.json";
import StructuresContract from "./Structures.sol/Structures.json";
import NameForum from "./pages/NameForum";
import ConnectWallet from "./pages/ConnectWallet";
import Drafts from "./Components/Drafts";
import Login from "./pages/Login";
import Forgot from "./pages/Forgot";
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

const contractAddressStructures = "0x9668f5a8Ca971bA0be47CE7B04d062fA47781F9d";
const contractAddressChat = "0x646abcA1ccE238A05F80831ba7Aee68c4Ad216e0";
const contractAddressOperations = "0x17D7228D30b69f452c35D514f637DD0eab7603BD";
export {
  contractAddressStructures,
  contractAddressChat,
  contractAddressOperations,
};

function App() {
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [connected, setConnected] = useState("");
  const [verify, setVerify] = useState("");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(
    contractAddressChat,
    ChatContract.abi,
    signer
  );
  const userContract = new ethers.Contract(
    contractAddressStructures,
    StructuresContract.abi,
    signer
  );

  async function connectWallet() {
    const result = await window.ethereum.isConnected();
    console.log(result);
    setConnected(result);
  }

async function verifyAdmin(){
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  if(accounts[0].toLowerCase() === "0x7B60eD2A82267aB814256d3aB977ae5434d01d8b".toLowerCase() ){
    setVerify(true);
  }else{
    setVerify(false);
  }
}
   
  useEffect(() => {
    connectWallet();
    verifyAdmin();
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/inbox" element={<Inbox />} />

        <Route path="/sendmsg" element={<SendMessage />} />

        <Route path="/" element={<Login />} />

        <Route path="/create" element={<ConnectWallet />} />
        <Route path="/drafts" element={<Drafts />} />
        <Route path="/forgot" element={<Forgot />} />
        {verify && <Route path="/name" element={<NameForum />} />}
        {verify && <Route path="/admin" element={<Admin />} />}
      </Routes>
    </Router>

    /*<Inbox/>
   <SendMessage/>*/
  );
}

export default App;
