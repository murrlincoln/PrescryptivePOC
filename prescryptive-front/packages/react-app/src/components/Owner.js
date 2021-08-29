import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import { Button } from "./";
import { ethers } from "ethers";
import "./Components.css";


async function addRole(contract, role) {
  const valueStr = prompt(
    'What address would you like to add the ' + role + ' role to?'
  )

  if (valueStr === null) {
    console.log("User entered null value");
    return;
  }

  if (role === "Withdrawer") {
    await contract.addWithdrawer(valueStr);
  } else if (role === "Confirmer") {
    await contract.addConfirmer(valueStr);
  } //should never need an else return

  contract.on('RoleGranted', (role) => {
    if (role === '0x5d8e12c39142ff96d79d04d15d1ba1269e4fe57bb9d26f43523628b34ba108ec') {
      alert("Withdraw role successfully granted!");
    } else if (role === '0xfddac4449a361e3913224ad159a928d20230d6569e72e52e9eec15d2838be8b5') {
      alert("Confirm role successfully granted!");
    }
  });

}

async function removeRole(contract, role) {

  const valueStr = prompt(
    'What address would you like to remove the ' + role + ' role from?'
  )

  if (valueStr === null) {
    console.log("User entered null value");
    return;
  }

  console.log(role);

  if (role === "Withdrawer") {
    await contract.removeWithdrawer(valueStr);
  } else if (role === "Confirmer") {
    await contract.removeConfirmer(valueStr);
  } //should never need an else return

  contract.on('RoleRevoked', (role) => {
    if (role === '0x5d8e12c39142ff96d79d04d15d1ba1269e4fe57bb9d26f43523628b34ba108ec') {
      alert("Withdraw role successfully revoked!");
    } else if (role === '0xfddac4449a361e3913224ad159a928d20230d6569e72e52e9eec15d2838be8b5') {
      alert("Confirm role successfully revoked!");
    }
  });

}

async function instantWithdraw(provider, contract) {
  var poolContract = new Contract(addresses.lendingPool, abis.lendingPool, provider.getSigner(0));

  let valueStr = prompt("How much USDC would you like to withdraw?");

  if (valueStr === null) {
    console.log("User entered null value");
    return;
  }

  valueStr = ethers.utils.parseUnits(valueStr, 6); //if using USDC, this number needs to be 6

  console.log(valueStr.toString())

  await contract.ownerWithdraw(valueStr);

  poolContract.on("Withdraw", (reserve, user, to) => {
    if (user === addresses.prescryptiveSmartContract) {
      alert('Successful withdrawal!');
    }
  })


}

function Owner({ provider }) {

  //contract used for all functions
  const contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  return (
    <div className="div">
      Owner Only Functions:<br />
      <Button onClick={() => addRole(contract, "Withdrawer")}>
        Create new Withdrawer
      </Button>

      <Button onClick={() => removeRole(contract, "Withdrawer")}>
        Remove a Withdrawer
      </Button>

      <Button onClick={() => addRole(contract, "Confirmer")}>
        Create new Confirmer
      </Button>

      <Button onClick={() => removeRole(contract, "Confirmer")}>
        Remove a Confirmer
      </Button>

      <Button onClick={() => instantWithdraw(provider, contract)}>
        Instantly Withdraw Funds to Owner Wallet
      </Button>

    </div>

  )

}

export default Owner