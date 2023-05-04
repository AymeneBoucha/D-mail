import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import ChatContract from '../Chat.sol/Chat.json';
import {contractAddress} from "../App"
import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';
import crypto from 'crypto-browserify';

function Login() {
  const [name, setName] = useState('');
  const [exists, setExists] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [password, setPassword] = useState();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  //const contractAddress = '0xa41102ce0fDA55beD090cEAa803cAf4538c945c1';
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddress , ChatContract.abi, signer);

  useEffect(() => {
    async function checkLogin() {
      const userAddress = await signer.getAddress();
      setUserAddress(userAddress);
      const user = await chatContract.users(userAddress);
      console.log(user, userAddress);
      setExists(user.exists);
      if (user.exists) {
        setName(user.name);
      }
    }
    checkLogin();
  }, []);

  async function Infos(){
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const email = await chatContract.getEmail(accounts[0]);
    console.log(email);
    return email;
  }

  async function verifyPassword(){
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const hashPassword = crypto.createHash('sha256');
    hashPassword.update(password);
    const digestPassword = hashPassword.digest('hex');
    const bytes32HashPassword = '0x' + digestPassword.padStart(32, '0');
    const verify = await chatContract.verifyPassword(accounts[0], bytes32HashPassword);
    return verify;
  }

  async function handleLogin() {
    if (exists) {
      // user exists, redirect to inbox
      // you can replace '/inbox' with the actual URL of the inbox page 
      if (verifyPassword()){
        console.log("password verified !");
        const infos = await Infos();
        console.log(infos);
        const encryptedPrivateKey = localStorage.getItem('PrivateKey.'+infos);
        //console.log(encryptedPrivateKey);
        const decryptedPrivateKey = AES.decrypt(encryptedPrivateKey, password).toString(CryptoJS.enc.Utf8);
        sessionStorage.setItem("PrivateKey"+infos, decryptedPrivateKey);
        window.location.href = '/inbox';
      }else{
        alert("Invalid Password !");
      }
    } else {
      // user does not exist, redirect to create account page
      // you can replace '/create' with the actual URL of the create account page
      window.location.href = '/create';
    }
  }

  return (
<section className="section-bg" style={{ backgroundImage: "url('/Background.png')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center center', margin: '0', height: '100vh' }}>
  <div className="container py-5 h-100">
    <div className="row d-flex justify-content-center align-items-center h-100">
      <div className="col-12 col-md-8 col-lg-6 col-xl-5">
        <div className="card bg-white text-black" style={{ borderRadius: '20px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }}>
          <div className="card-body p-5 text-center">
            <div className="mb-md-5 mt-md-4 pb-10">
              <h2 className="fw-bold mb-2 text-uppercase">Welcome to Dmail</h2>
              <p className="text-black-50 mb-5 mt-5">
                Click to connect your MetaMask wallet
              </p>

              <div className="form-floating mb-3">
              <label htmlFor="Name" className="text-black" style={{ display: 'flex', alignItems: 'center' }}>Password</label>
              <input
  type="password"
  id="Password"
  className="form-control form-control-lg"
  value={password}
  placeholder=" "
  onChange={e => setPassword(e.target.value)}
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
<br></br>
              <button
  className="btn btn-lg px-5"
  type="submit"
  onClick={handleLogin}
  style={{
    backgroundColor: '#FB723F',
    border: 'none',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#F64A0B'}
  onMouseLeave={(e) => e.target.style.backgroundColor = '#FB723F'}
>
  Login
</button>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}

export default Login;
