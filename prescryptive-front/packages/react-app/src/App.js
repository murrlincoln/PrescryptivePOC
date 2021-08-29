import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header } from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";

import Owner from "./components/Owner";
import Withdrawer from "./components/Withdrawer";
import Confirmer from "./components/Confirmer";

import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

import { ethers } from "ethers";

import logo from "./cropped-pres-logo.png"

import "./App.css"


var address; //the address of the user
var owner; //the address of the contract owner

//the provider we use to read from the blockchain (note - This is Lincoln's personal link, may need to be updated if 
// this code is used in the real-world in the future)
const defaultProvider = getDefaultProvider('https://polygon-mumbai.infura.io/v3/fee501e8a2874b79b1bf71b3a59b86ac');

//contract used for reads on prescryptive smart contract. Not used at the moment due to running into issues with the Infura calls
var defaultPrescryptiveContract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, defaultProvider);


/**
 * Gets the current contract owner from the blockchain
 * @returns - The address of the owner
 */
async function getOwner(provider) {

  let contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  owner = await contract.owner();

  return owner;

}

/**
 * Checks if the connected wallet has a specific role within the smart contract. The three roles are DEFAULT_ADMIN_ROLE,
 * WITHDRAW_ROLE, and CONFIRM_WITHDRAW_ROLE. 
 * DEFAULT_ADMIN_ROLE in bytes32: 0x0000000000000000000000000000000000000000000000000000000000000000
 * WITHDRAW_ROLE in bytes32:  0x5d8e12c39142ff96d79d04d15d1ba1269e4fe57bb9d26f43523628b34ba108ec
 * CONFIRM_WITHDRAW_ROLE in bytes32: 0xfddac4449a361e3913224ad159a928d20230d6569e72e52e9eec15d2838be8b5
 * @param {*} role - the role that we are checking for
 */
async function checkForRole(role, provider) {

  var bytes32role;

  //todo: fix this to not use provider when possible
  let contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  //get the bytes32 for each of the string roles
  if (role === "DEFAULT_ADMIN_ROLE") {
    bytes32role = '0x0000000000000000000000000000000000000000000000000000000000000000';
  } else if (role === "WITHDRAW_ROLE") {
    bytes32role = '0x5d8e12c39142ff96d79d04d15d1ba1269e4fe57bb9d26f43523628b34ba108ec';
  } else if (role === "CONFIRM_WITHDRAW_ROLE") {
    bytes32role = '0xfddac4449a361e3913224ad159a928d20230d6569e72e52e9eec15d2838be8b5';
  } else {
    console.log("User did not enter a valid role");
    return false;
  }

  let result = await contract.hasRole(bytes32role, address);

  console.log(role, result);

  return result;
}


/**
 * Deposits funds to Aave, where they become interest-bearing
 * Requires that approveTransfer() has been run first.
 * 
 * @param {*} provider - The MetaMask instance
 * @returns 
 */
async function depositToAave(provider, setTxPending) {
  var contract = new Contract(addresses.lendingPool, abis.lendingPool, provider.getSigner(0));

  let valueStr = prompt(
    'How much USDC would you like to deposit into the smart contract?'
  );

  //if the user enters a null value, nothing happens
  if (valueStr !== null) {

    //If the user has not approved a transfer, they are prompted to do so
    if (await getAllowance(provider) === "0") {
      alert("Please approve the transfer first by using the 'Approve the transfer' button");

      return;
    }

    valueStr = ethers.utils.parseUnits(valueStr, 6); //if using USDC, this number needs to be 6

    await contract.deposit(addresses.erc20, valueStr, addresses.prescryptiveSmartContract, 0);


    //alerts when a deposit is successful
    contract.on('Deposit', (reserve, user, onBehalfOf) => {

      if (user === address) {
        alert('Deposit successful!');
        return;
      }

    })

    return;
  }

  console.log("Failure, user did not input a value");

}

/**
 * Checks how much stablecoin the Aave lending pool can take from the user's wallet.
 *  
 * @param {*} provider - The MetaMask instance
 * @returns the allowance as a string
 */
async function getAllowance(provider) {
  var contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0));

  var spender = addresses.lendingPool;

  var allowance = await contract.allowance(address, spender); //returned as BigNumber

  console.log(allowance.toString());

  return allowance.toString();
}




/**
 * Get the address of the connected account
 * @param {*} provider - The MetaMask instance
 */
async function getAddress(provider) {
  const signer = provider.getSigner(0);
  address = await signer.getAddress();
}

/**
 * Approve the ERC20 transfer to the lendingPool 
 * @param {*} provider - The MetaMask instance
 */
async function approveTransfer(provider) {
  var contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0));

  await contract.approve(addresses.lendingPool, "79228162514260000000000000000");


  contract.on('Approval', (tokenOwner, spender, value) => {
    console.log('Approval event fired for', tokenOwner);

    if (tokenOwner === address) {
      alert('Approval successful!');
    }

  })

}


/**
 * The component for the "connect wallet" button
 * @param {*} param0 - The state variables for the provider and login/out 
 * @returns 
 */
function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

/**
 * The function that sets up the automatic updating of the contract's balance state variable
 * @param {*} fun - The function that will be set to run every 5 seconds
 */
// **WARNING** - This function may cause excessive calls to infura API. Current soln: use provider.getSinger() for read tx and don't update balance when wallet isn't connected
function updateBalance(fun) {
  setInterval(fun, 1000);
}

/**
 * The main React component 
 * @returns The react component
 */
function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  //the state for each of the roles, so that we can open the role-specific terminals
  const [isOwnerVar, isOwner] = useState(false);
  const [isWithdrawerVar, isWithdrawer] = useState(false);
  const [isConfirmerVar, isConfirmer] = useState(false);

  const [userBalance, setUserBalance] = useState();
  const [contractBalance, setContractBalance] = useState();
  const [allowance, setAllowance] = useState();

  const [showRolesButton, setShowRolesButton] = useState(true);

  const [txPending, setTxPending] = useState(true);

  //changes the contractBalance state variable to reflect 
  const getContractBalance = async () => {
    let contract = new Contract(addresses.interestBearingErc20, abis.erc20, provider.getSigner(0)); //todo - Should be defaultProvider but there's call loop
    let value = await contract.balanceOf(addresses.prescryptiveSmartContract)
    value = ethers.utils.formatUnits(value, 6);
    value = Math.round(value * 100) / 100;

    setContractBalance(value);
  };

  const getUserBalance = async () => {
    if (provider) {
      let contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0)); //todo - May be able to use defaultProvider
      let value = await contract.balanceOf(address);
      value = ethers.utils.formatUnits(value, 6);
      value = Math.round(value * 100) / 100;

      setUserBalance(value);
    }

  }

  if (provider) {
    getAddress(provider);
    getOwner(provider);
  }

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);


  return (
    <div>
      <Header><img src={logo} alt="logo" />
        {provider ? (<>
          <h3>Address: {address} <div>{updateBalance(getUserBalance)}</div>
            User Balance: ${userBalance}</h3> </>)
          : (<> </>)}
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>

      <Body>
        {/*updateBalance(getContractBalance) commented out since infura calls were too expensive*/}

        <p>Smart Contract Balance: ${contractBalance}</p>

        {provider ? (

          <>

            {updateBalance(getContractBalance)}

            <Button onClick={() => depositToAave(provider, setTxPending)}>
              Deposit in Smart Contract
            </Button>
            <br />

            <Button onClick={() => approveTransfer(provider)}>
              Approve the transfer
            </Button>
            <br />

            <Button onClick={async () => setAllowance(await getAllowance(provider))}>
              Get allowance
            </Button>
            {allowance ? (<p>Allowance: {allowance} </p>) : (<> </>)}
            <br />

            {showRolesButton ? (
              <Button onClick={async () => {
                setShowRolesButton(false);
                isOwner(await checkForRole("DEFAULT_ADMIN_ROLE", provider));
                isConfirmer(await checkForRole("CONFIRM_WITHDRAW_ROLE", provider));
                isWithdrawer(await checkForRole("WITHDRAW_ROLE", provider));
              }}>
                Check for all roles
              </Button>)
              : (<></>)}
            <br />
          </>

        ) : <> <p>
          Please install a Web3 provider like{' '}
          <a href="https://metamask.io/">MetaMask</a> to use this app.
        </p> </>}

        {provider && isOwnerVar ? (

          <><Owner provider={provider} /> </>

        ) : (
          <></>
        )}

        {provider && isWithdrawerVar ? (

          <><Withdrawer provider={provider} /> </>

        ) : (
          <></>
        )}

        {provider && isConfirmerVar ? (

          <><Confirmer provider={provider} /> </>

        ) : (
          <></>
        )}

      </Body>

    </div>
  );
}

export default App
