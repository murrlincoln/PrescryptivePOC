import React from "react";
import { Contract } from "@ethersproject/contracts";
import { addresses, abis } from "@project/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { Provider } from "web3modal";
import {Button} from "./";
import {ethers} from "ethers";


async function removeWithdrawer(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'What address would you like to remove the withdraw role from?'
  );

  await contract.removeWithdrawer(valueStr);
}

async function addWithdrawer(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'What address would you like to give the withdraw role to?'
  );

  await contract.addWithdrawer(valueStr);
}

async function addConfirmer(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'What address would you like to give the confirm role to?'
  );

  await contract.addConfirmer(valueStr);
}


async function removeConfirmer(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  const valueStr = prompt(
    'What address would you like to remove the confrim role from?'
  );

  await contract.removeConfirmer(valueStr);
}

async function instantWithdraw(provider) {
  var contract = new Contract(addresses.prescryptiveSmartContract, abis.prescryptiveSmartContract, provider.getSigner(0));

  let valueStr = prompt("How many tokens would you like to withdraw?");

  valueStr = ethers.utils.parseUnits(valueStr, 18); //if using USDC, this number needs to be 6

  await contract.ownerWithdraw(valueStr);
}

function Owner({provider}) {

  return (
    <div>
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