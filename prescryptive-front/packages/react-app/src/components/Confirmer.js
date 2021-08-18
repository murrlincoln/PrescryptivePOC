import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import {Button} from "./";
import {ethers} from "ethers";


/**
 * Confirms the withdrawal initiated by the initalizer
 * @param {*} provider - The MetaMask instance
 * @returns 
 */
async function confirmWithdraw(provider) {
    var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));
    var poolContract = new Contract(addresses.lendingPool, abis.lendingPool, provider.getSigner(0));
  
    let valueStr = prompt("Please confirm the amount of tokens you want to withdraw");

    valueStr = ethers.utils.parseUnits(valueStr, 18); //if using USDC, this number needs to be 6
  
    const addressStr = prompt("Please confirm the address to which you would like to withdraw");

    if (valueStr == null || addressStr == null) {
        console.log("Value was null, returning");
        return;
    }
  
    //true confirms that we would like to withdraw. If valueStr and addressStr do not match what initalizer put
    //the withdrawal fails
    await contract.withdrawFunds(true, valueStr, addressStr);
  
    alert("Withdrawal successfully submitted. If there is any discrepancy between your info and the initalizer's information, the transaction will fail, and you can call 'cancel transaction' to start over");


    poolContract.on("Withdraw", (reserve, user, to) => {
      if (user === addresses.prescryptiveSmartContract) {
        alert('Successful withdrawal!');
      }
    })
    
  }
  

  /**
   * Cancels the withdrawal and resets the withdraw address and value to their default values (0x00... and 0)
   * @param {*} provider - The MetaMask instance
   */
  async function cancelWithdraw(provider) {
    var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

    await contract.cancelWithdraw();
  
    //todo - wait for emit
    alert("Withdrawal cancelled, please have the initalizer re-enter amount and address");
  }
  
//The React component for the Confirmer
function Confirmer({provider}) {

    return (
        <div>
        Confirmer Only Functions:<br />
        <Button onClick={() => confirmWithdraw(provider)}>
          Confirm Withdraw
        </Button>
        
        <Button onClick={() => cancelWithdraw(provider)}>
          Cancel Withdraw
        </Button>

        </div>
    )
}



export default Confirmer