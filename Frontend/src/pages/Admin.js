import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ChatContract from '../Chat.sol/Chat.json';
import '../assets/accounts.css';
import { ListGroup } from 'react-bootstrap';
import { BsPersonFillAdd,BsArchiveFill,BsWallet } from "react-icons/bs";
import { FaArchive, FaInbox, FaStar, FaUser,FaRegUser } from "react-icons/fa";
import {HiUsers} from  "react-icons/hi";
import {MdGroups,MdManageAccounts,MdDelete,MdOutlineMail,MdEdit} from "react-icons/md";
import Navbar from '../Components/NavBar';
import { contractAddress } from '../App';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [NewUsers, setNewUsers] = useState({});

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  //const contractAddress = '0xa41102ce0fDA55beD090cEAa803cAf4538c945c1';
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddress , ChatContract.abi, signer);

  async function getName() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const result = await chatContract.getName(accounts[0]);
    setName(result);

    const allUsers = await chatContract.getAllUsers();
    setUsers(allUsers);
  }

  useEffect(() => {
    getName();
  }, []);
  const buttons = [
    
    { icon: <MdManageAccounts className="w-[1.7rem]  h-[1.7rem]" />, title: "Users" },
    { icon: <MdGroups className="w-[1.7rem]  h-[1.7rem]" />, title: "Groups" },
    
    { icon: <BsArchiveFill className="w-[1.7rem]  h-[1.7rem]" />, title: "Archive" },
  ];

  const [hoverIndex, setHoverIndex] = useState(null);

  return (
     <div className="p-0" style={{fontSize: '1.6rem'}}>
      
        <Navbar style={{ zIndex: 1, width: '100%', position: 'fixed' }} className="pl-0 pr-0"/>
        <div className="row">
          <div className="col-md-2 offset-md-2" style={{ marginTop: '80px', zIndex: 1 }}>
            <div style={{ backgroundColor: 'white', height: '100%', position: 'fixed', top: 0, left: 0, width: 230, borderRight: '1px solid #ccc', fontSize: '1.3em'}}>
              <div style={{position: 'fixed', top: 60, left: 17,}}>
                <div style={{ padding: '20px 10px', marginLeft: -15 }}>
                  <button className="btn btn-primary btn-orange btn-lg" style={{ backgroundColor: '#FB723F', borderRadius: '30px', height: 60 }} >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <BsPersonFillAdd className="w-10 h-10 mr-2"/>
                      <p style={{fontSize:'1.2em',}} className="text-white m-0">Add User</p>
                    </div>
                  </button>
                </div>
                <div className="pl-6 pt-4 flex items-center space-x-6">
                  {buttons.map((button) => (
                    <div key={button.title} className="text-gray-600 flex items-center gap-6" style={{marginTop: 6}}>
                      <div className="flex items-center" >
                        {button.icon}
                        <span className="font-semibold ml-2" style={{position: 'relative', top: -4}}>{button.title}</span>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>

        <div className="col-md-12" style={{ marginTop: '-80px', marginLeft: 250 }}>
      {name && (
        <div>
          {/* <h1>Bienvenue, {name}!</h1> */}
          <div className="row">
            <div className="col-md-12">
            <div className="d-flex justify-content-between align-items-center" style={{padding: 10, width: "calc(98% - 250px)", borderBottom: "1px solid #ccc", marginTop: -35}}>
                  <div className="m-2 d-flex align-items-center font-medium fs-4 gap-3" >
                    <h3>Bienvenue, {name} !</h3>
                  </div>
                 
            </div>
              <h1  style={{ marginTop: 10, marginBottom: 20, marginLeft: -270 , float: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: 30}}>Users</h1>
              <ul
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0px",
                  padding: "0",
                  width: "calc(98% - 250px)",
                  backgroundColor: "ghostwhite",
                }}
              >
                <li className="d-flex justify-content-between align-items-center" style={{padding: 10, borderBottom: "1px solid #ccc",}}>
                  <div className="m-2 d-flex align-items-center font-medium fs-4 gap-3">
                    <HiUsers className="w-10 h-10 mr-2"/><p className="m-0" style={{fontSize: '1.7rem' }}>List of users</p>
                  </div>
                  <div className="m-2 d-flex align-items-center font-medium gap-3">
                    <p className="m-0" style={{fontSize: '1.6rem' }}>1-50 of 354</p>
                  </div>
                </li>
                {users.map((user, index) => (
                  <li
                    key={index}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                    style={{
                      borderBottom: "1px solid #ccc",
                      width: "100%",
                      padding: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: user.exist ? "white" : "ghostwhite",
                    }}
                  >
                    <div>
                      <div className="row">
                        <div className="col-12"><strong><FaRegUser className="w-40 h-40 mr-3"/>
                           {user.name}</strong></div>
                        <div className="col-12"><strong><MdOutlineMail className="w-40 h-40 mr-3"/>
                           {user.email}</strong></div>
                        <div className="col-12"><strong><BsWallet className="w-40 h-40 mr-3"/></strong>
                           {user.walletAddress}</div>
                        
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center",  minWidth: '80px'}}>
                      {hoverIndex === index ? (
                        <>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            
                            <MdDelete className="w-10"/>
                          
                          </button>
                          <button
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <MdEdit className="w-10 "/>
                          </button>
                        
                        </>
                      ) : (
                        <p> </p>
                             )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
           
          </div>
        </div>
      )}
        </div>

























































          
       
        </div>
     </div>
   
  );
}

export default Admin;
