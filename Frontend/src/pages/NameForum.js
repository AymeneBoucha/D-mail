import "../assets/App.css";
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import ChatContract from '../Chat.sol/Chat.json';
import StructuresContract from '../Structures.sol/Structures.json';
import {contractAddressStructures, contractAddressChat} from "../App"
import { isEmail } from 'email-validator';
import Modal from 'react-modal';

function NameForum() {

  

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [emailError, setEmailError] = useState(null);
  const [idError, setIdError] = useState(null);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddressChat , ChatContract.abi, signer);
  const userContract = new ethers.Contract(contractAddressStructures , StructuresContract.abi, signer);

 async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
  }
  
// Function to open success popup
const openSuccessModal = () => {
  setIsSuccessModalOpen(true);
};

// Function to close success popup
const closeSuccessModal = () => {
  setIsSuccessModalOpen(false);
};

useEffect(() => {
  // Set app element when component mounts
  Modal.setAppElement('#root');
}, []);

  async function createUserId() {
    try{
      var err = false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
  
      if (!isValid) {
        setEmailError("this is not a valid email address");
        err = true;
      } else {
        setEmailError(null);
      }
      if (userId.length == 0) {
        setIdError("the id shouldn't be empty, it must be of a 32 bit format");
        err = true;
      } else {
        setIdError(null);
      }
      if (err) return;
    await userContract.createUserId(email, userId);
    openSuccessModal();
    window.location.href = "/create";
    }
    catch(e) {
      alert("Invalid Email or ID !");
    }
  }
 
  const validateEmail = () => {
    const isValid = isEmail(email);
    // Perform any additional logic based on the email validation result
    console.log(`Email is ${isValid ? 'valid' : 'invalid'}`);
  };

 

  return (
    <section className="vh-100" style={{overflowX: "hidden", backgroundImage: "url('/Background.png')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center center', margin: '0', height: '100vh' }}>
  <div className="container py-5 h-100">
    <div className="row d-flex justify-content-center align-items-center h-100">
      <div className="col-12 col-md-8 col-lg-6 col-xl-5">
        <div className="card bg-white" style={{ borderRadius: '15px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}>
          <div className="card-body p-5 text-center">
            <div className="mb-md-5 mt-md-4 pb-5">
            <h2 className="fw-bold mb-2 text-uppercase">Create account</h2>
            <p className="text-black-50 mb-5 mt-5">
                    Please enter the new user Name
                  </p>

                  <div className="form-floating mb-3">
  <label htmlFor="ID" className="text-black" style={{ display: 'flex', alignItems: 'center' }}>Email</label>
  <input
    type="email"
    id="email"
    placeholder=""
    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    className="form-control form-control-lg"
    value={email}
    onChange={e => setEmail(e.target.value)}
    required
    style={{
      borderRadius: '10px',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      transition: 'all 0.3s ease',
      background: `url(email.png) no-repeat 10px center / auto 20px`,
      paddingLeft: '40px',
    }}
    onFocus={(e) => e.target.style.boxShadow = '0px 0px 8px rgba(0, 0, 0, 0.4)'}
    onBlur={(e) => e.target.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.25)'}
  />
  {emailError && <p className="text-danger">{emailError}</p>}
</div>

                    <div className="form-floating mb-3">
              <label htmlFor="ID" className="text-black" style={{ display: 'flex', alignItems: 'center' }}>User ID</label>
                     <input
                      type="text"
                      id="userId"
                      placeholder=""
                      className="form-control form-control-lg"
                      value={userId}
                      onChange={e => setUserId(e.target.value)}
                      required
                      style={{
    borderRadius: '10px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.3s ease',
    background: `url(key.png) no-repeat 10px center / auto 20px`,
      paddingLeft: '40px',
  }}
  onFocus={(e) => e.target.style.boxShadow = '0px 0px 8px rgba(0, 0, 0, 0.4)'}
  onBlur={(e) => e.target.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.25)'}
  />
                    {idError && <p className="text-danger">{idError}</p>}
                  </div>

<br></br>
                  <button
                    className="btn btn-outline-light btn-lg px-5"
                    type="submit"
                    onClick={createUserId}
                    style={{
    backgroundColor: '#FB723F',
    border: 'none',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
  }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#F64A0B'}
  onMouseLeave={(e) => e.target.style.backgroundColor = '#FB723F'}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={closeSuccessModal}
        className="modal"
        overlayClassName="overlay"
      >
        <div className="success-popup">
          <h3>User Created Successfully!</h3>
          <p>Thank you for creating a new user.</p>
          <button className="close-button" onClick={closeSuccessModal}>
            Close
          </button>
        </div>
      </Modal>
    </section>
  );
}

export default NameForum;