import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import { ethers } from 'ethers';

import { Body, Button, Header } from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";

import Owner from "./components/Owner";


import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";
import { Provider } from "web3modal";

var address;
var owner = '0x5452bac821e6D53DD69E4D5C5D65Bc188386eEA8';

async function getOwner() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider('https://ropsten.infura.io/v3/fee501e8a2874b79b1bf71b3a59b86ac');
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  var contract = new Contract(addresses.PrescryptiveSmartContract, abis.prescryptiveSmartContract, defaultProvider);

  owner = await contract.owner();

  console.log("Owner:", owner);

  return owner;

}

async function getAllowance(provider) {
  var contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0));

  var spender = addresses.prescryptiveSmartContract;

  const signer = await provider.getSigner(0);
  const owner = await signer.getAddress();

  console.log("Account:", owner.toString());
  console.log(signer.address);



  var allowance = await contract.allowance(owner.toString(), spender);

  console.log(allowance);

  return allowance;
}


async function transfer(provider) {
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  var contract = new Contract(addresses.PrescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'How much TEST would you like to deposit into the smart contract?'
  );

  //if the user enters a null value, nothing happens
  if (valueStr !== null || valueStr > '0.1') {

    // if (getAllowance(provider) < valueStr) {
    //   approveTransfer(provider);
    // }

    await contract.depositFunds(valueStr);
    console.log('Pending deposit...');

    return;
  }

  console.log('Failure, user did not enter an amount to deposit or entered a 0 value');

}

//approve the transfer using the ERC20 contract info
async function approveTransfer(provider) {
  var contract = new Contract(addresses.erc20, abis.erc20, provider.getSigner(0));

  await contract.approve(addresses.PrescryptiveSmartContract, "79228162514260000000000000000");
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

async function getAddress(provider) {
  const signer = provider.getSigner(0);
  address = await signer.getAddress();
}


function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [isOwnerVar, isOwner] = useState(false);

  getOwner(); //stores the owner in owner var

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

            <Button onClick={() => isOwner(address === owner)}> {/* Todo - Give alert when not owner */}
              Open Owner Terminal (only works if you are owner)
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


        <Button onClick={() => getOwner()}>
          Get Contract Owner
        </Button>




      </Body>

    </div>
  );
}

export default App;
