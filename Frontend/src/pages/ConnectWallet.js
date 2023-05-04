import { ethers } from 'ethers';
import { useState } from 'react';
import ChatContract from '../Chat.sol/Chat.json';
import { ec } from 'elliptic';
import crypto from 'crypto-browserify';
import { sha512 } from 'js-sha512';
import { generateMnemonic } from 'bip39';
import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';
import {contractAddress} from "../App"

const bip39 = require('bip39');

const curve = new ec('secp256k1');


function ConnectWallet() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seed, setSeed] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState('');
  const [userId, setUserId] = useState('');
  const [isExecuted, setIsExecuted] = useState(false);
  const [link, setLink] = useState('');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  //const contractAddress = '0xa41102ce0fDA55beD090cEAa803cAf4538c945c1';
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddress , ChatContract.abi, signer);
  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(accounts[0]);
  }

  function encryptMessage(plaintext, pubKey, priKey) {
    const sharedSecret = curve.keyFromPrivate(priKey, 'hex').derive(curve.keyFromPublic(pubKey, 'hex').getPublic()).toString('hex');
    console.log(sharedSecret);
    const message = Buffer.from(plaintext, 'utf8');
    const iv = crypto.randomBytes(16);
    const encryptionKey = sharedSecret.toString('hex').substr(0, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    const encryptedMessage = Buffer.concat([cipher.update(message), cipher.final()]);
    const ciphertext = Buffer.concat([iv, encryptedMessage]);
    console.log(ciphertext.toString('base64'));
    return ciphertext.toString('base64');
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
   // this.setState({ decryptedtext: decryptedMessage.toString('utf8') });
    
  };

  function generateKeys(){
    /*const mnemonic = generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const master = sha512.array(seed);
    const keyPair = curve.keyFromPrivate(master.slice(0, 32));
    const privateKey = keyPair.getPrivate().toString('hex');
    console.log(privateKey);
    const publicKey = keyPair.getPublic().encode('hex');*/
    // const password  = "Lynda 2001";
    // const encryptedPrivateKey = AES.encrypt(privateKey, password).toString();
    // localStorage.setItem("Lynda", encryptedPrivateKey);
    // const cle = localStorage.getItem("Lynda");
    // console.log(cle);
    // const decryptedPrivateKey = AES.decrypt(encryptedPrivateKey, password).toString(CryptoJS.enc.Utf8);
    // console.log(decryptedPrivateKey);
    //     const hexPubKey = publicKey.toString(16);
    //     const paddedHexPubKey = hexPubKey.padStart(64, '0');
    //     const bytes32PubKey = Buffer.from(paddedHexPubKey, 'hex');

    // const bytes32PubKeyInverse = Buffer.from(bytes32PubKey, 'hex');
    // const pubKey = bytes32PubKeyInverse.toString('hex');

    // const ciphertext = encryptMessage("Aymen yaehf,naueinj uenf aemkngaemlk nageyy, gaemopg ,mal,g ", pubKey, decryptedPrivateKey);
    // decryptMessage(ciphertext, pubKey, decryptedPrivateKey);
    const cipher = "J0hxpMoYC/nFsJsYvF0D5ilI3QGLe/qPPGUM4ZnECaEHFepNaCfhEe53fqQP27ja";
    const priKey = "42dd388856a11e259f030eec337aba7c93491318012e6f07338726850dfc2fdb";
    const pubKey = "041495182f8eafb127bb8a69738fb8fa998a83ae4be156b9070c81ff06cf02a13ed9ed7002fb565b750b32dee0600a240216ff12c13352ec6fb586e093c10cc0c0";
    //function decryptMessage(cipher, pubKey, priKey) {
    const sharedSecret = curve.keyFromPrivate(priKey, 'hex').derive(curve.keyFromPublic(pubKey, 'hex').getPublic()).toString('hex');
    console.log(sharedSecret);
    const ciphertext = Buffer.from(cipher, 'base64');
    const iv = ciphertext.slice(0, 16);
    const encryptedMessage = ciphertext.slice(16);
    const encryptionKey = sharedSecret.toString('hex').substr(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    const decryptedMessage = Buffer.concat([decipher.update(encryptedMessage), decipher.final()]);
    console.log(decryptedMessage.toString('utf8'));
 // };

    //return [mnemonic, privateKey, publicKey];
    }

    async function createUser() {
      const userExists = await chatContract.verifyUser(userId, email);
      console.log(userExists);
      if (userExists == true) {
        const keys = generateKeys();
        const seed = keys[0];
        const privateKey = keys[1];
        const pubKey = keys[2];
        console.log(keys[0], keys[1], keys[2]);
        const encryptedPrivateKey = AES.encrypt(privateKey, password).toString();
    
        localStorage.setItem('PrivateKey.'+email, encryptedPrivateKey);
        
        console.log(encryptedPrivateKey);
        const hashSeed = crypto.createHash('sha256');
        hashSeed.update(seed);
        const digestSeed = hashSeed.digest('hex');
    
        const hashPassword = crypto.createHash('sha256');
        hashPassword.update(password);
        const digestPassword = hashPassword.digest('hex');

        const bytes32HashSeed = '0x' + digestSeed.padStart(32, '0');
        const bytes32HashPassword = '0x' + digestPassword.padStart(32, '0');

        const hexPubKey = pubKey.toString(16);
        const paddedHexPubKey = hexPubKey.padStart(64, '0');
        const bytes32PubKey = Buffer.from(paddedHexPubKey, 'hex');

        console.log(bytes32HashSeed + "\n" + bytes32HashPassword + "\n" + pubKey);
    
        await chatContract.createUser(userId, name, email, walletAddress, bytes32HashSeed, bytes32HashPassword, bytes32PubKey);
      } else {
        alert("You don't have permission to create an account ! ");
      }
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

              <div className="form-floating mb-3">
              <label htmlFor="Name" className="text-black" style={{ display: 'flex', alignItems: 'center' }}>Confirm Password</label>
              <input
  type="password"
  id="CPassword"
  className="form-control form-control-lg"
  value={cpassword}
  placeholder=" "
  onChange={e => setCPassword(e.target.value)}
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
                onClick={generateKeys}
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