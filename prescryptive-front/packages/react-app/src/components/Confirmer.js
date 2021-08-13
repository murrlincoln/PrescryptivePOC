import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { Provider } from "web3modal";
import {Button} from "./";
import {ethers} from "ethers";


async function confirmWithdraw(provider) {
    var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));
  
    let valueStr = prompt("Please confirm the amount of tokens you want to withdraw");
    
    valueStr = ethers.utils.parseUnits(valueStr, 18); //if using USDC, this number needs to be 6
  
    const addressStr = prompt("Please confirm the address to which you would like to withdraw");

    if (valueStr == null || addressStr == null) {
        console.log("Value was null, returning");
        return;
    }
  
    //true confirms that we would like to withdraw.
    await contract.withdrawFunds(true, valueStr, addressStr);
  
    //todo - wait for emit
    alert("Withdrawal successfully submitted. If there is any discrepancy between your info and the initalizer's information, the transaction will fail, and you can call 'cancel transaction' to start over");
  }
  
  async function cancelWithdraw(provider) {
    var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));
    //TODO - ADD cancelWithdraw Method
    await contract.cancelWithdraw();
  
    //todo - wait for emit
    alert("Withdrawal cancelled, please have the initalizer re-enter amount and address");
  }
  

function Confirmer({provider}) {

    return (
        <div>
        Confirmer Only Functions:<br />
        <Button onClick={() => confirmWithdraw(provider)}>
          Confirm Withdraw
        </Button>
        
        <Button onClick={() => cancelWithdraw(provider)}>
          Cancel Withdraw (Currently not working, will require re-deploy of smart contract)
        </Button>

        </div>
    )
}



export default Confirmer