import { ethers } from 'ethers';
import { useState } from 'react';
import ChatContract from './Chat.sol/Chat.json';


function ConnectWallet() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState('');
  const [userId, setUserId] = useState('');
  const [isExecuted, setIsExecuted] = useState(false);
  const [link, setLink] = useState('');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  const contractAddress = '0x11e7d63d68704D2eEC1312928C0007dd886D21E0';
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddress , ChatContract.abi, signer);
  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
  }

  async function createUser() {
    await chatContract.createUser(userId, name, email, walletAddress);
  }
  async function IsConnected(event) {
    event.preventDefault();
    
   const tx =  await chatContract.createUser;
  

  }
  return (
<section className="vh-100" style={{ backgroundImage: "url('/Background.png')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center center', margin: '0', height: '100vh' }}>
  <div className="container py-5 h-100">
    <div className="row d-flex justify-content-center align-items-center h-100">
      <div className="col-12 col-md-8 col-lg-6 col-xl-5">
        <div className="card bg-white" style={{ borderRadius: '15px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}>
          <div className="card-body p-5 text-center">
            <div className="mb-md-5 mt-md-4 pb-5">
              <h2 className="fw-bold mb-2 text-uppercase">Create Your Account</h2>
              <p className="text-black-50 mb-5 mt-5">
                Please enter the given information from your admin
              </p>

              <div className="form-floating mb-3">
              <label htmlFor="Email" className="text-black" style={{ display: 'flex', alignItems: 'center' }}>Email</label>
              <input
  type="text"
  id="Email"
  className="form-control form-control-lg"
  value={email}
  placeholder=" "
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
                
              </div>

              <div className="form-floating mb-3">
              <label htmlFor="Name" className="text-black" style={{ display: 'flex', alignItems: 'center' }}>Name</label>
              <input
  type="text"
  id="Name"
  className="form-control form-control-lg"
  value={name}
  placeholder=" "
  onChange={e => setName(e.target.value)}
  required
  style={{
    borderRadius: '10px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.3s ease',
    background: `url(user.png) no-repeat 10px center / auto 20px`,
      paddingLeft: '40px',
  }}
  onFocus={(e) => e.target.style.boxShadow = '0px 0px 8px rgba(0, 0, 0, 0.4)'}
  onBlur={(e) => e.target.style.boxShadow = '0px 2px 4px rgba(0, 0, 0, 0.25)'}
/>
                
              </div>

              <div className="form-floating mb-3">
              <label htmlFor="userId" className="text-black" style={{ display: 'flex', alignItems: 'center' }}>Your ID</label>
              <input
  type="text"
  id="userId"
  className="form-control form-control-lg"
  value={userId}
  placeholder=" "
  onChange={e => setUserId(e.target.value)}
  required
  style={{ borderRadius: '10px' , boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',  background: `url(key.png) no-repeat 10px center / auto 20px`,
      paddingLeft: '40px',}}
/>
                
              </div>

              <div className="form-floating mb-5">
  <label htmlFor="walletAddress" className="text-black" style={{ display: 'flex', alignItems: 'center' }}>Wallet Address</label>
  <input
    type="text"
    id="walletAddress"
    className="form-control form-control-lg"
    value={walletAddress}
    placeholder=" "
    onChange={e => setWalletAddress(e.target.value)}
    readOnly
    required
    style={{
      borderRadius: '10px',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      background: `url(wallet.png) no-repeat 10px center / auto 20px`,
      paddingLeft: '40px',
    }}
  />
</div>
              <button
                className="btn btn-lg px-5 me-2 mb-3"
                type="submit"
                onClick={connectWallet}
                style={{
    backgroundColor: '#00D45C',
    border: 'none',
    color: '#fff',
    padding: '7px 12px',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
  }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#01BF53'}
  onMouseLeave={(e) => e.target.style.backgroundColor = '#00D45C'}
              >
                Get My Wallet Address
              </button>

              <button
                className="btn btn-lg px-5"
                type="submit"
                onClick={createUser}
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
                Create Account
              </button>

              {isExecuted && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-black mt-3">
                  User Connected successfully. View transaction in Mumbai.polygonscan.
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}


export default ConnectWallet;
