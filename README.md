# PrescryptivePOC

## Project Info

A payment rails system to increase settlement time, improve efficiently, and offer an interest rate 400x higher than a traditional bank account.

## Features
- Three different roles, owner, withdrawer, and confirmer. The owner has complete control over the account and access create/remove withdrawers/confirmers.
  The withdrawer initializes withdrawals with a certain address and value.
  The confirmer confirms these withdrawals by re-entering the address and value, or cancelling the withdrawal if necessary.
  
- Integration with Aave to get a high-yield interest rate
- Deployment on Polygon mainnet for high speeds and low costs

## Release Schedule/Todo

### Alpha (Complete)
- Deployment on Ropsten testnet
- Working roles, deposits, and withdrawals
- Working frontend with buttons and conditional rendering
- Some bugs and WIP items that were found along the way

### Beta (Complete)
- Deployment on Mumbai (Polygon) testnet (Not done since testnet stablecoins could not be found, but the rails are there)
- Events and emits (Solidity) and event listeners (frontend) 
- Aave integration
- Frontend with better UI and greater automation

### Proof of Concept Release
- Deployment on Polygon mainnet
- Easy-to-use UI and instructions for deployment

### Final Release (Unlikely to reach some of these goals)
- A credit system to account for any overpayment of pharmacies
- Clean code repo and remove unused dependencies
- Greater control for worst-case scenario issues (creating communication between accounting and engineering teams to ensure prescryptive account is not overdrawn)
- Create method for more than one transaction to be queued up at once
- Separate Prescryptive smart contract to manage the payments to the pharmacies


## How to Use
- After cloning this repo, open README.md in prescryptive-front and follow the instructions
- MetaMask is required to interact with the smart contract
- Note, the @aave/protocol-v2 and @openzeppelin modules were modified to change the solidity version
