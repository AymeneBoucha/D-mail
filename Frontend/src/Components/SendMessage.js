import { ethers } from "ethers";
import { useState } from "react";
import ChatContract from "../Chat.sol/Chat.json";
import { contractAddress } from "../App";
import { ec } from 'elliptic';
import crypto from 'crypto-browserify';
import { sha512 } from 'js-sha512';
import { generateMnemonic } from 'bip39';
import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

const bip39 = require('bip39');

const curve = new ec('secp256k1');

const SendMessage = () => {
  const [receiver, setreceiver] = useState("");
  const [emailReceiver, setEmailReceiver] = useState("");
  const [subject, setSubject] = useState("");
  const [attachment, setAttachment] = useState("");
  const [receiverName, setreceiverName] = useState("");
  const [body, setBody] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletAddressName, setWalletAddressName] = useState("");
  const [isExecuted, setIsExecuted] = useState(false);
  const [link, setLink] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(
    contractAddress,
    ChatContract.abi,
    signer
  );
  
  function encryptMessage(plaintext, pubKey, priKey) {
     const sharedSecret = curve.keyFromPrivate(priKey, 'hex').derive(curve.keyFromPublic(pubKey, 'hex').getPublic()).toString('hex');
     console.log(sharedSecret);
     const message = Buffer.from(plaintext, 'utf8');
     const iv = crypto.randomBytes(16);
     const encryptionKey = sharedSecret.toString('hex').substr(0, 32);
     const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
     const encryptedMessage = Buffer.concat([cipher.update(message), cipher.final()]);
     const ciphertext = Buffer.concat([iv, encryptedMessage]);
     console.log("ciphertext.toString('base64') :" + ciphertext.toString('base64'));
     const hexCipher = ciphertext.toString('base64').toString(16);
     console.log("hexCipher : " + hexCipher);
     return hexCipher;
   };
 
   function decryptMessage(ciphertextt, pubKey, priKey) {
     const sharedSecret = curve.keyFromPrivate(priKey, 'hex').derive(curve.keyFromPublic(pubKey, 'hex').getPublic()).toString('hex');
     console.log(sharedSecret);
     const ciphertext = Buffer.from(ciphertextt, 'base64');
     const iv = ciphertext.slice(0, 16);
     const encryptedMessage = ciphertext.slice(16);
     const encryptionKey = sharedSecret.toString('hex').substr(0, 32);
     const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
     const decryptedMessage = Buffer.concat([decipher.update(encryptedMessage), decipher.final()]);
     console.log(decryptedMessage.toString('utf8'));
   };

   async function getRecieverPubKey(address) {
    const pubKeyX = await chatContract.getRecieverPubKey(address);
    console.log(pubKeyX);
   // const bytes32PubKeyInverse = Buffer.from(pubKeyX, 'hex');
    //const pubKey = bytes32PubKeyInverse.toString('hex');
    const pubKey = pubKeyX.slice(2);
    return pubKey;
   }

   async function getSenderPriKey(address){
    const email = await chatContract.getEmail(address);
    const priKey = sessionStorage.getItem('PrivateKey.'+email);
    return priKey;
   }

  async function sendMessage(event) {
    event.preventDefault();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const result = await chatContract.getName(accounts[0]);
    setWalletAddressName(result);
    setWalletAddress(accounts[0]);
    const address = await chatContract.getAddress(emailReceiver);
    const priKey = await getSenderPriKey(accounts[0]);
    const recieverPubKey = await getRecieverPubKey(address);
    console.log("Receiver public key : " + recieverPubKey);
    const encryptedMessage = encryptMessage(body, recieverPubKey, priKey);
    console.log("encrypted message : " + encryptedMessage);
    const tx = await chatContract.sendMessage(address, subject, encryptedMessage);
    console.log(tx.hash);

    setIsExecuted(true);
    setLink("https://mumbai.polygonscan.com/tx/" + tx.hash);
  }

  return (
    <div className="card-body p-0 text-center m-2" style={{ position: "fixed", bottom: 0, right: 0, width: "100%", maxWidth: "600px", height: "auto", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)", zIndex: "10" }}>
  <div className="card-header bg-dark text-white" style={{borderRadius: "8px 8px 0 0", cursor: "pointer"}} onClick={() => setIsMinimized(!isMinimized)}>
  <h5 className="mt-0">New Message</h5>
</div>
<div className="send-message card p-0" style={{height: isMinimized ? "3px" : "auto"}}>
      <form className="send-message card p-3">
        <div className="form-group">
          <label htmlFor="emailReceiver" className="sr-only">
            To:
          </label>
          <input
            type="text"
            className="form-control form-control-lg mb-1"
            id="emailReceiver"
            placeholder="To"
            style={{ border: "none" }}
            value={emailReceiver}
            onChange={(e) => setEmailReceiver(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject" className="sr-only">
            Title:
          </label>
          <input
            type="text"
            className="form-control mb-1"
            id="subject"
            placeholder="Subject"
            style={{ border: "none" }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="body" className="sr-only">
            Message:
          </label>
          <textarea
            className="form-control mb-1"
            id="body"
            rows="5"
            placeholder="Compose email"
            style={{ border: "none" }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <div className="form-group d-flex justify-content-between align-items-center">
          <div className="form-group ml-4 mb-2">
            <input
              type="file"
              id="attachment"
              multiple
              onChange={(e) => setAttachment(e.target.files[0])}
              style={{ display: "none" }}
            />
            <label
              htmlFor="attachment"
              style={{
                display: "inline-block",
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
            >
              <img
                src="/add_file.png"
                alt="Add file"
                style={{
                  width: "100%",
                  height: "100%",
                  transition: "opacity 0.2s ease-in-out",
                }}
                className="hover:opacity-80"
              />
            </label>
          </div>
          <div className="btn-group d-flex align-items-center">
            <button
              type="submit"
              className="btn btn-primary btn-sm rounded-start flex-grow-1"
              style={{
                backgroundColor: "#FB723F",
                border: "none",
                color: "#fff",
                borderRadius: "8px 0 0 8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#F64A0B")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#FB723F")}
            >
              <img
                src="timer.png"
                alt="program send"
                style={{ pointerEvents: "none", maxWidth: "100%" }}
              />
            </button>
            <button
              type="submit"
              className="btn btn-secondary btn-sm rounded-end flex-grow-1"
              style={{
                backgroundColor: "#FB723F",
                marginLeft: "1.4px",
                border: "none",
                color: "#fff",
                borderRadius: "0 8px 8px 0",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#F64A0B")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#FB723F")}
              onClick={sendMessage}
            >
              <img
                src="send.png"
                alt="send"
                style={{ pointerEvents: "none", maxWidth: "100%" }}
              />
            </button>
          </div>
        </div>
      </form>
      </div>
      {isExecuted && (
        <a href={link} target="_blank" rel="noopener noreferrer">
          View transaction in Mumbai.polygonscan
        </a>
      )}
    </div>
  );
};

export default SendMessage;
