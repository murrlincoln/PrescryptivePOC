import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import { ethers } from 'ethers';

import { Body, Button, Header } from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";

import Owner from "./components/Owner";
import Withdrawer from "./components/Withdrawer";
import Confirmer from "./components/Confirmer";


import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";
import { Provider } from "web3modal";

var address;
var owner = '0x5452bac821e6D53DD69E4D5C5D65Bc188386eEA8';
const defaultProvider = getDefaultProvider('https://ropsten.infura.io/v3/fee501e8a2874b79b1bf71b3a59b86ac');

async function getOwner() {
  // Should replace with the end-user wallet, e.g. Metamask
  
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, defaultProvider);

  owner = await contract.owner();

  console.log("Owner:", owner);

  return owner;

}

async function getAllowance(provider) {
  var contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0));

  var spender = addresses.prescryptiveSmartContract;

  var allowance = await contract.allowance(address, spender); //returned as BigNumber

  console.log(allowance.toString());

  return allowance;
}

/**
 * Checks if the connected wallet has a specific role within the smart contract. The three roles are DEFAULT_ADMIN_ROLE,
 * WITHDRAW_ROLE, and CONFIRM_WITHDRAW_ROLE. 
 * DEFAULT_ADMIN_ROLE in bytes32: 0x0000000000000000000000000000000000000000000000000000000000000000
 * WITHDRAW_ROLE in bytes32:  0x5d8e12c39142ff96d79d04d15d1ba1269e4fe57bb9d26f43523628b34ba108ec
 * CONFIRM_WITHDRAW_ROLE in bytes32: 0xfddac4449a361e3913224ad159a928d20230d6569e72e52e9eec15d2838be8b5
 * @param {*} role 
 */
 async function checkForRole(role) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, defaultProvider);

  var bytes32role;

  if (role === "DEFAULT_ADMIN_ROLE") {
    bytes32role = '0x0000000000000000000000000000000000000000000000000000000000000000';
  } else if (role === "WITHDRAW_ROLE") {
    bytes32role = '0x5d8e12c39142ff96d79d04d15d1ba1269e4fe57bb9d26f43523628b34ba108ec';
  } else if (role === "CONFIRM_WITHDRAW_ROLE") {
    bytes32role = '0xfddac4449a361e3913224ad159a928d20230d6569e72e52e9eec15d2838be8b5';
  } else {
    console.log("User did not enter a role");
    return false;
  }

  let result = await contract.hasRole(bytes32role, address);

  console.log(role, result);

  return result;
}

//transfers a certain amount of tokens from connected address to the smart contract
//requres approval to be run first
async function transfer(provider) {
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'How much TEST would you like to deposit into the smart contract?'
  );

  //if the user enters a null value, nothing happens
  if (valueStr !== null || valueStr > '0.1') {

    //if the allowance is not high enough, approve the transfer first
    if (getAllowance(provider) < valueStr) {
      alert("Please approve the transfer first");
      approveTransfer(provider);
    }

    await contract.depositFunds(valueStr);
    console.log('Pending deposit...');

    return;
  }

  console.log('Failure, user did not enter an amount to deposit or entered a 0 value');

}


//get the address of the connected account
async function getAddress(provider) {
  const signer = provider.getSigner(0);
  address = await signer.getAddress();
}

//approve the transfer using the ERC20 contract info
async function approveTransfer(provider) {
  var contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0));

  await contract.approve(addresses.prescryptiveSmartContract, "79228162514260000000000000000");
}

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

//gets the balance of the smart contract
//TODO - Fix this function
async function getContractBalance() {
  let contract = new Contract(addresses.erc20, abis.erc20, defaultProvider); 

  let value = await contract.balanceOf(addresses.prescryptiveSmartContract);

  value = (value / 10^18);

  console.log(value.toString());

  return value.toString();


}


function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  
  //the state for each of the roles, so that we can open the role-specific terminals
  const [isOwnerVar, isOwner] = useState(false);
  const [isWithdrawerVar, isWithdrawer] = useState(false);
  const [isConfirmerVar, isConfirmer] = useState(false);

  getOwner(); //stores the smart contract owner in owner var

  if (provider) {
    getAddress(provider); //stores the address in address var
  }

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  //TODO - Fix the Owner Component so that it only shows up when the address matches the owner


  return (
    <div>
      <Header>
        {provider ? (<> <h3>Address: {address}</h3> </>) : (<> </>)}
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>



      <Body>

        {provider ? (

          <>


            <Button onClick={() => transfer(provider)}>
              Transfer to smart contract
            </Button>
            <br/>

            <Button onClick={() => approveTransfer(provider)}>
              Approve the transfer
            </Button>
            <br/>

            <Button onClick={() => getAllowance(provider)}>
              Get allowance
            </Button>
            <br/>

            <Button onClick={async () => {
              isOwner(await checkForRole("DEFAULT_ADMIN_ROLE"));
              isConfirmer(await checkForRole("CONFIRM_WITHDRAW_ROLE"));
              isWithdrawer(await checkForRole("WITHDRAW_ROLE"));
            }}>
              Check for all roles
            </Button>
            <br/>
          </>

        ) : <> <p>
          Please install a Web3 provider like{' '}
          <a href="https://metamask.io/">MetaMask</a> to use this app.
        </p> </>}

        {provider && isOwnerVar ? (

          <><Owner provider={provider}/> </>

        ) : (
          <></>
        ) }

        {provider && isWithdrawerVar ? (

        <><Withdrawer provider={provider}/> </>

        ) : (
        <></>
        ) }

        {provider && isConfirmerVar ? (

        <><Confirmer provider={provider}/> </>

        ) : (
        <></>
        ) }




        <Button onClick={() => getOwner()}>
          Get Contract Owner
        </Button>
        <br/>

        <Button onClick={() => getContractBalance()}>
          Get Contract Balance
        </Button>
      </Body>

    </div>
  );
}

export default App;
