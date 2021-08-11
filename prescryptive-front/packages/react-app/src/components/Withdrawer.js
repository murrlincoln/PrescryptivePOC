import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { Provider } from "web3modal";
import {Button} from "./";

//initiates a withdrawal of a certain number of tokens to a specified address. Requires the WITHDRAW_ROLE role
async function initiateWithdraw(provider) {
    var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0))
  
    //todo - May need to multiply by 10^18
    const valueStr = prompt("How many TEST tokens would you like to withdraw?");
  
    const addressStr = prompt("What address would you like to send the tokens to?");
  
    //todo - listen for emit of withdraw initiated and code it into solidity
    await contract.initiateWithdraw(valueStr, addressStr);
  
    alert("If the transaction was successful, ask the confirmer to confirm the transaction");
  }

  //todo - remove this, it's not necessary since the withdrawer could send a new request
  async function cancelWithdraw(provider) {
    var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));
    //TODO - ADD cancelWithdraw Method
    await contract.cancelWithdraw();
  
    //todo - wait for emit
    alert("Withdrawal cancelled, please have the initalizer re-enter amount and address");
  }
  
  
  
function Withdrawer({provider}) {

    return (
        <div>
        Withdrawer Only Functions:<br />
        <Button onClick={() => initiateWithdraw(provider)}>
          Initiate Withdraw
        </Button>
        
        <Button onClick={() => cancelWithdraw(provider)}>
          Cancel Withdraw (Currently not working, will require re-deploy of smart contract)
        </Button>
        </div>
        
    )
}


export default Withdrawer