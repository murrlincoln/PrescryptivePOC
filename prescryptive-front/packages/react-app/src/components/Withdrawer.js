import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import {Button} from "./";
import {ethers} from "ethers";

/**
 * initiates a withdrawal of a certain number of tokens to a specified address. Requires the WITHDRAW_ROLE role
 * @param {*} provider - The MetaMask instance
 * @returns 
 */
async function initiateWithdraw(provider) {
    var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0))
  
    let valueStr = prompt("How many tokens would you like to withdraw?");

    valueStr = ethers.utils.parseUnits(valueStr, 18); //if using USDC, this number needs to be 6
  
    const addressStr = prompt("What address would you like to send the tokens to?");

    if (valueStr == null || addressStr == null) {
      console.log("Value was null, returning");
      return;
  }
  
    //todo - listen for emit of withdraw initiated and code it into solidity
    await contract.initiateWithdraw(valueStr, addressStr);
  
    alert("Ask the confirmer to confirm the transaction");
  }
  
  
//The React component for the Withdrawer  
function Withdrawer({provider}) {

    return (
        <div>
        Withdrawer Only Functions:<br />
        <Button onClick={() => initiateWithdraw(provider)}>
          Initiate Withdraw
        </Button>
        </div>
        
    )
}


export default Withdrawer