import React from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";

import { Body, Button, Header, Image, Link } from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";


import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

async function getOwner() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider('https://ropsten.infura.io/v3/fee501e8a2874b79b1bf71b3a59b86ac');
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  var contract = new Contract(addresses.PrescryptiveSmartContract, abis.prescryptiveSmartContract, defaultProvider);

  const owner = await contract.owner();

  console.log(owner);
  return owner;
  
}


async function transfer(provider) {
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  var contract = new Contract(addresses.PrescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));



  await contract.depositFunds(100);
  console.log( 'Success!' );
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

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  React.useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>


      <Body>
        <p>
          Edit <code>packages/react-app/src/App.js</code> and save to reload.
        </p>
        <Button onClick={() => getOwner()}>
          Get Contract Owner
        </Button>

        <Button onClick={() => transfer(provider)}>
          Transfer to smart contract
        </Button>

        <Button onClick={() => approveTransfer(provider)}>
          Approve the transfer
        </Button>



      </Body>

    </div>
  );
}

export default App;
