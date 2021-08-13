import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { Provider } from "web3modal";
import {Button} from "./";
import {ethers} from "ethers";

//initiates a withdrawal of a certain number of tokens to a specified address. Requires the WITHDRAW_ROLE role
async function initiateWithdraw(provider) {
    var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0))
  
    let valueStr = prompt("How many tokens would you like to withdraw?");

    valueStr = ethers.utils.parseUnits(valueStr, 18); //if using USDC, this number needs to be 6
  
    const addressStr = prompt("What address would you like to send the tokens to?");
  
    //todo - listen for emit of withdraw initiated and code it into solidity
    await contract.initiateWithdraw(valueStr, addressStr);
  
    alert("If the transaction was successful, ask the confirmer to confirm the transaction");
  }
  
  
  
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