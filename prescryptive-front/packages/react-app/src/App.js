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


var address;
var owner;
const defaultProvider = getDefaultProvider('https://kovan.infura.io/v3/fee501e8a2874b79b1bf71b3a59b86ac');

//contract used for reads on prescryptive smart contract
var defaultPrescryptiveContract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, defaultProvider);


//Gets the current owner of the Prescryptive smart contract
async function getOwner() {

  owner = await defaultPrescryptiveContract.owner();

  console.log("Owner:", owner);

  return owner;

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

  var bytes32role;

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

  let result = await defaultPrescryptiveContract.hasRole(bytes32role, address);

  console.log(role, result);

  return result;
}


//deposits funds to Aave, where they become interest-bearing
//Requires that approveTransfer() has been run first.
async function depositToAave(provider) {
  var contract = new Contract(addresses.lendingPool, abis.lendingPool, provider.getSigner(0));

  let valueStr = prompt(
    'How much DAI would you like to deposit into the smart contract?'
  );

  //if the user enters a null value, nothing happens
  if (valueStr !== null) {

    //todo - add some sort of test to see if allowance has been done before
    if (await getAllowance(provider) === "0") {
      alert("Please approve the transfer first");
      await approveTransfer(provider);

      //todo - Add event listener here so that the function does not continue until approval done
    }

    valueStr = ethers.utils.parseUnits(valueStr, 18); //if using USDC, this number needs to be 6

    await contract.deposit(addresses.erc20, valueStr, addresses.prescryptiveSmartContract, 0);

    return;
  }

  console.log("Failure, user did not input a value");


}

//Checks how much stablecoin the Aave lending pool can take from the user's wallet. 
async function getAllowance(provider) {
  var contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0));

  var spender = addresses.lendingPool;

  var allowance = await contract.allowance(address, spender); //returned as BigNumber

  console.log(allowance.toString());

  return allowance.toString();
}




//get the address of the connected account
async function getAddress(provider) {
  const signer = provider.getSigner(0);
  address = await signer.getAddress();
}

//approve the ERC20 transfer to the lendingPool 
async function approveTransfer(provider) {
  var contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0));

  await contract.approve(addresses.lendingPool, "79228162514260000000000000000");
}


//The component for the "connect wallet" button
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



function updateBalance(getContractBalance) {
  getContractBalance();
  setInterval(getContractBalance, 5000);
}


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


  //changes the contractBalance state variable to reflect 
  const getContractBalance = async () => {
    let contract = new Contract(addresses.interestBearingErc20, abis.erc20, defaultProvider);
    let value = await contract.balanceOf(addresses.prescryptiveSmartContract)
    value = ethers.utils.formatEther(value);
    value = Math.round(value*100) / 100;

    setContractBalance(value);
  };


  getOwner(); //stores the smart contract owner in owner var

  if (provider) {
    getAddress(provider); //stores the address in address var
  }

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);


  return (
    <div>
      <Header>
        {provider ? (<> <h3>Address: {address}</h3> </>) : (<> </>)}
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>

      <Body>
        {updateBalance(getContractBalance)}
        <p>Smart Contract Balance: ${contractBalance}</p>

        {provider ? (

          <>

            <Button onClick={() => depositToAave(provider)}>
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

            <Button onClick={async () => {
              isOwner(await checkForRole("DEFAULT_ADMIN_ROLE"));
              isConfirmer(await checkForRole("CONFIRM_WITHDRAW_ROLE"));
              isWithdrawer(await checkForRole("WITHDRAW_ROLE"));
            }}>
              Check for all roles
            </Button>
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




        <Button onClick={() => getOwner()}>
          Get Contract Owner
        </Button>
        <br />

      </Body>

    </div>
  );
}

export default App
