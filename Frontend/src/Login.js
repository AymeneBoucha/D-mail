import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import ChatContract from './Chat.sol/Chat.json';

function Login() {
  const [name, setName] = useState('');
  const [exists, setExists] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const contractAddress = '0x11e7d63d68704D2eEC1312928C0007dd886D21E0';
  const signer = provider.getSigner();
  const chatContract = new ethers.Contract(contractAddress , ChatContract.abi, signer);

  useEffect(() => {
    async function checkLogin() {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
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

  function handleLogin() {
    if (exists) {
      // user exists, redirect to inbox
      // you can replace '/inbox' with the actual URL of the inbox page
      window.location.href = '/inbox';
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
