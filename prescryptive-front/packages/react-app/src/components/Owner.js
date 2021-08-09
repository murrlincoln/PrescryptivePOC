import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { Provider } from "web3modal";

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


async function isOwner(provider) {

    const signer = provider.getSigner();
    const account = await signer.getAddress();
  
    console.log(await getOwner() == account);
  
    return await getOwner() == account;
  }

async function addWithdrawer(provider) {

}


function Owner({provider}) {


    return (
        <div>test
        {isOwner(provider) ? (
            
        <> <p>Owner</p></>) : (<> <p>Not Owner</p></>)}
        </div>

    )
}

export default Owner