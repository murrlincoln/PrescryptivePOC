import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import {Button} from "./";
import {ethers} from "ethers";
import "./Owner.css";


async function removeWithdrawer(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'What address would you like to remove the withdraw role from?'
  );

  if (valueStr === null) {
    console.log("User entered null value");
    return;
  }

  await contract.removeWithdrawer(valueStr);

  contract.on('RoleRevoked', (role) => {
    if (role === '0x5d8e12c39142ff96d79d04d15d1ba1269e4fe57bb9d26f43523628b34ba108ec') {
      alert("Withdraw role successfully revoked!");
    }

  })
}

async function addWithdrawer(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'What address would you like to give the withdraw role to?'
  );

  if (valueStr === null) {
    console.log("User entered null value");
    return;
  }

  await contract.addWithdrawer(valueStr);

  contract.on('RoleGranted', (role) => {
    if (role === '0x5d8e12c39142ff96d79d04d15d1ba1269e4fe57bb9d26f43523628b34ba108ec') {
      alert("Withdraw role successfully granted!");
    }

  })
}

async function addConfirmer(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'What address would you like to give the confirm role to?'
  );

  await contract.addConfirmer(valueStr);

  contract.on('RoleGranted', (role) => {
    if (role === '0xfddac4449a361e3913224ad159a928d20230d6569e72e52e9eec15d2838be8b5') {
      alert("Confirm role successfully granted!")
    }
  })
}


async function removeConfirmer(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'What address would you like to remove the confrim role from?'
  );

  if (valueStr === null) {
    console.log("User entered null value");
    return;
  }

  await contract.removeConfirmer(valueStr);

  contract.on('RoleRevoked', (role) => {
    if (role === '0xfddac4449a361e3913224ad159a928d20230d6569e72e52e9eec15d2838be8b5') {
      alert("Confirm role successfully revoked!")
    }
  })
}

async function instantWithdraw(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));
  var poolContract = new Contract(addresses.lendingPool, abis.lendingPool, provider.getSigner(0));

  let valueStr = prompt("How many tokens would you like to withdraw?");

  if (valueStr === null) {
    console.log("User entered null value");
    return;
  }

  valueStr = ethers.utils.parseUnits(valueStr, 18); //if using USDC, this number needs to be 6

  await contract.ownerWithdraw(valueStr);

  poolContract.on("Withdraw", (reserve, user, to) => {
    if (user === addresses.prescryptiveSmartContract) {
      alert('Successful withdrawal!');
    }
  })

  
}

function Owner({provider}) {

  return (
    <div className="test">
    Owner Only Functions:<br />
    <Button onClick={() => addWithdrawer(provider)}>
      Create new Withdrawer
    </Button>

    <Button onClick={() => removeWithdrawer(provider)}>
      Remove a Withdrawer
    </Button>

    <Button onClick={() => addConfirmer(provider)}>
      Create new Confirmer
    </Button>

    <Button onClick={() => removeConfirmer(provider)}>
      Remove a Confirmer
    </Button>

    <Button onClick={() => instantWithdraw(provider)}>
      Instantly Withdraw Funds to Owner Wallet
    </Button>
    
    </div>
    
  )

}

export default Owner