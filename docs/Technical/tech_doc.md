# **HODLVERSE Smart Contract Technical Documentation**

## **MoneyToken Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Asset Type: ERC20
* Title of Smart Contract: $MONEY Token Contract
* Token Symbol: MONEY
* Name Of Token: MONEY
* Token Supply (Fixed): 5,000,000,000
* Number of Decimals: 18
* Mintable: No
* Burnable: Yes
* Ropsten Ethereum Address: 0x0000000000000000000000000000000000000000
* Mainnet Ethereum Address: 0x0000000000000000000000000000000000000000

### **Summary** 

This is a smart contract that follows the EIP-20 standard with a twist: owners of the token generated from the smart contract do have the opportunity to make decisions on the future of the ecosystem.   contract inherits from the ownable smart contract.

At the point of deployment, an account is passed to which the total MONEY token available is transferred, ownership of the smart contract is transferred to this account and the Transfer event is emitted.

Like other smart contracts that follow the EIP-20 protocol this contract contains the burn, allowance, approve, balanceOf, transfer, and transferFrom method.

To enable the token used in the smart contract for governance purposes, the smart contract contains methods such as delegate, delegateBySig, getCurentVotes, getPriorVotes, 

### **Code**

[https://github.com/hodlverse/contracts/blob/master/contracts/MoneyToken.sol](https://github.com/hodlverse/contracts/blob/master/contracts/MoneyToken.sol)

### **Functions**

* _allowance_: returns the number of tokens an account is allowed to spend on behalf of another account.
* _approve_: approves an account to send up to a certain amount to another account.
* _balanceOf_: returns how many tokens an account has.
* _transfer_: sends a specified amount of tokens to a specified address.
* _transferFrom_: sends a specified amount of tokens from a specified account to another specified account.
* _delegate_: chooses another account to vote on my behalf.
* _delegateBySig_: accepts a signed transaction to vote on your behalf including address.
* _getCurrentVotes_: Gets the current vote for an account.
* _getPriorVotes_: Gets the previous votes at a specific block number. 

### **Variables**
* _name (public)_: The name of the ERC-20 token.
* _symbol (public)_: The symbol of the ERC-20 token.
* _decimal (public)_: The number of decimals the token has.
* _totalSupply (public)_: The total number of tokens in circulation.
* _delegates (public)_: holds the address that can vote in place of a MONEY token owner.
* _checkpoints (public)_: Holds the number of votes for each account by index.
* _numCheckpoints (public)_: The number of checkpoints for each account.
* _nonces (public)_: keeps the record of the last nonce used to sign or validate a user’s signature.

### **Events**
* _DelegateChanged_: Emitted when a user changes the user allowed to vote on its behalf.
* _DelegateVotesChanged_: Emitted when an address burns its MONEY token, transfers it to another address, or delegates a new address to vote on its behalf.  
* _Transfer_: emits when an address transfers some MONEY token
* _Approval_: emits when an account has been approved to spend an amount of token on behalf of a user.


## **Ownable Smart Contract**

### **Requirements**
* Blockchain: Ethereum

### **Summary**
This contract is a utility contract and is inherited by other contracts that need to define access control based on ownership. The owner of the contract and the pending owner are stored in the OwnableData smart contract.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/utils/Ownable.sol](https://github.com/hodlverse/contracts/blob/master/contracts/utils/Ownable.sol)

### **Functions**
* _transferOwnership_: allows the contract ownership to be changed to a new owner and can only be called by the current owner.
* _claimOwnership_: allows the contract ownership to be claimed by the pending owner.

### **Variables**
* _owner (public)_: The current owner of the smart contract.
* _pendingOwner (public)_: The pending owner of the contract.

### **Events**
* OwnershipTransferred: Emitted when the ownership is transferred to a new owner 

## **Time Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Grace Period: 14 days
* Minimum Delay: 2 days
* Maximum Delay: 30 days

### **Summary**
The Time smart contract uses the openzeppelin’s SafeMath library guiding against arithmetic overflow and underflow.

It ensures that acting on a process is delayed by the specified time.

At the point of deployment, the owner’s address and the delay are set. The constructor checks to ensure that the delay is within the acceptable range.

The receive method is available and is made payable to ensure that calling the smart contract with some ether without calling any of its functions will have the ether deposited in the contract.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/Time.sol](https://github.com/hodlverse/contracts/blob/master/contracts/Time.sol)

### **Functions**
Function calls can either be done by the owner of the contract, the contract itself, or the pending owner depending on the function. 
* setDelay: sets a new delay value between the minimum and maximum delay constants.
* acceptOwner: allows the contract ownership to be changed to a new owner.
* queueTransaction: sets transaction execution to a specified eta/delay based upon the block timestamp..
* cancelTransaction: allows a queued transaction to be cancelled by the contract owner.
* executeTransaction: execute an operation containing a single transaction that has to be called by the current owner.

### **Variables**
* _GRACE_PERIOD (public constant)_: set at 14 days and is used to determine if transactions to be executed are stale.
* _MINIMUM_DELAY (public constant)_: set at 2 days and is used to set a minimum value for the delay.
* _MAXIMUM_DELAY (public constant)_: set at 30 days and is used to set a maximum value for the delay.
* _owner (public)_: address of the contract owner.
* _pendingOwner (public)_: address of the new contract owner.
* _delay (public)_: time delay in days.
* _owner_initialized (public)_: boolean value used to check if a new owner has been set on the contract.

### **Events**
* NewOwner: emitted when a new pending owner accepts ownership of the contract.
* NewPendingOwner: emitted when a new pending owner has been set on the contract. 
* NewDelay: emitted when a new delay has been set.
* ExecuteTransaction: emitted after a new transaction has been queued and executed.
* QueueTransaction: emitted when a new transaction has been queued..
* CancelTransaction: emitted when a transcation is cancelled.

## **Reserve Smart Contract**
### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit function from any address at any time: Yes
* 60% Repurchased $MONEY is distributed to the Farming Contract: Yes
* 30% Repurchased $MONEY is distributed to the Staking Contract: Yes
* 10% Repurchased $MONEY is distributed to the HODLVERSE DAO: Yes
* Initiates $MONEY buybacks, swaps, and distributions into a single transaction: Yes
* Pause function for safeguard: Yes
* Withdrawals are restricted to the Farming, Staking Contracts, and HODLVERSE DAO wallet: Yes

### **Summary**
The reserve smart contract inherits from the IReserve interface, openzeppelin’s Ownable, Pausable and SafeERC20 smart contract. It uses the SafeMath library and the SafeERC20 library. 

The reserve contract has two(2) modifiers; the onlyWithdrawers modifier which allows only eligible withdrawers to access a feature and the onlyBuyBack modifier which allows only the buyBack contract to access features it protects.

At the point of deployment, we ensure that the MoneyToken contract address and the buyBack contract address are not the zero address, before setting them.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/Reserve.sol](https://github.com/hodlverse/contracts/blob/master/contracts/Reserve.sol)

### **Functions**
* _withdrawRewards_: it is available only to withdrawers and sends the amount of Money token the withdrawer is allowed to withdraw to their wallet and returns the amount withdrawn.

### **Variables**
* _buyback (public)_: address of the BuyBack smart contract.
* _money (public)_: address of the MoneyToken contract.
* _moneyBalance (public)_: the amount of money token available in the contract.
* _totalProportions (public)_: The summation of each withdrawers money token proportion.
* _totalMoneyCollected (public)_: The sum of all the money tokens deposited to the reserve smart contract.

### **Events**
* No events are emitted by this contract


## **BuyBack Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit from any address at any time: Yes
* Buybacks occur (daily at market price) when triggered by the rewards contract or an external cron job: Yes 
* Purchased $MONEY is distributed to the Reserve Contract: Yes
* Pause function for safeguard: Yes
* Withdrawals are restricted to the Reserve Contract: Yes

### **Summary**
The BuyBack smart contract inherits from the IbuyBack interface, openzeppelin’s Ownable and Pausable smart contract. It uses the SafeMath and SafeERC20 library. 

The BuyBack contract has a modifier called isInitialised that ensures that the Reserve contract address has been set.

At the point of deployment, the address of the Router smart contract and the Money smart contract is set and the constructor ensures they are not set to the zero(0) address.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/Buyback.sol](https://github.com/hodlverse/contracts/blob/master/contracts/Buyback.sol)

### **Functions**
* _transferMoneyToReserve_: it can be called by anyone when the Buyback contract is not paused and the reserve contract address has been set. It takes all the money tokens available in the Buyback contract and sends it to the reserve contract, then calls the deposit function of the reserve contract to ensure that the transaction has occurred. 
* _removeLiquidity_: removes liquidity from a liquidity pool, by interacting with the Router smart contract and returning the tokens gotten to the buyback smart contract.

### **Variables**
* _router_: address of the Router smart contract.
* _reserve_: address of the Reserve smart contract
* _money_: address of the MoneyToken smart contract.

## **Events**
* _TransferMoneyToReserve_: Emitted when all the money tokens have been transferred to the Reserve smart contract.


## **Migrator Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Removes liquidity from 3rd-party pairs using their router contract: Yes
* Adds the liquidity for same token pairs to HODL pairs: Yes
* If the pair doesn’t exist on HODLVERSE, it will create a new pool for the same: Yes

### **Summary**
The Migrator smart contract uses the SafeERC20 library. It ensures that we can move our liquidity pairs from other DEXes to ours.

At the point of deployment, the oldRouter and the router address are set. 

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/Migrator.sol](https://github.com/hodlverse/contracts/blob/master/contracts/Migrator.sol)

### **Functions**
* _migrateWithPermit_: allows for the spending of the tokens on the liquidity pool when the pool is migrated without having to create the approval for such spending.
* _migrate_: requires that the owner of the pool first grants HodlValley the approval needed to spend the tokens in the pool.

### **Variables**
* _oldRouter_: address of the router smart contract we are removing liquidity from.
* _router_: address of the router smart contract.

### **Events**
* No events are emitted by this contract


## MultiSigWallet Smart Contract

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Stores the list of wallet addresses that will take part in the decision making: Yes
* Also stores the number of required confirmations before executing a transaction: Yes
* Admin of all of the contracts in the network: Yes

### **Summary**
The MultiSigWallet smart contract ensures that more than one person is required for decision making. Decisions are proposed and various individuals pick their stand. The minimum number of confirmations on the decision needs to be met before the decision is approved.

At the point of deployment, an array of owners and the number of required confirmations are set.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/MultiSigWallet.sol](https://github.com/hodlverse/contracts/blob/master/contracts/MultiSigWallet.sol)

### **Functions**
* _receive_: a payable function that receives Ether and emits the deposit event if more than zero(0) is sent across.
* _addOwner_: adds a new owner. It is a public function that makes use of the onlyWallet, ownerdoesNotExist, notNull, and validRequirement modifiers. 
* _removeOwner_: removes an owner, and tries to balance the number of required confirmations to the number of owners available if the number of required confirmations are greater than the number of users. It uses the onlyWallet and ownerExists modifier.
* _replaceOwner_: takes the address of an existing owner and replaces it with the address of an owner that is not already in the smart contract. It uses the onlyWallet, ownerExists, and ownerDoesNotExist modifiers.
* _changeRequirement_: changes the number of required confirmations based on the input passed. It uses the onlyWallet and the validRequirement modifier.
* _submitTransaction_: allows an owner to submit a new transaction. It returns the transaction Id of the new transaction.
* _confirmTransaction_: accepts a transaction id and confirms the transaction. It makes a call to execute the transaction. It uses the ownerExists, transactionExists, and notConfirmed modifiers.
* _revokeConfirmation_: accepts a transaction id and undo a confirmed transaction. It uses the ownerExists, notExecuted, and confirmed modifiers.
* _executeTransaction_: accepts a transaction id, checks If the transaction has met the confirmation requirements, and executes. It uses the ownerExists, confirmed, and notExecuted modifiers.
* _isConfirmed_: takes a transactionId and checks if the number of confirmations for the transaction has met the required number of confirmations. returns a boolean.
* _getConfirmationCount_: takes a transaction id and returns the total number of confirmations for a transaction.
* _getTransactionCount_: Returns transaction count after filters, such as pending or executed, are applied. The filters are boolean values where you state if you want to add either or both pending or executed transactions.
* _getOwners_: returns the list of owners.
* _getConfirmations_: accepts a transaction id and returns the address of all who confirmed the transaction.
* _getTransactionIds_: accepts a range where the from value is inclusive and the to value is not. A filter is in place so we can decide if we want to include either or both pending or executed transactions.

### **Variables**
* _MAX_OWNER_COUNT (public)_: stores the maximum number of owners.
* _transactions (public)_: stores details of the transaction as value and the index as keys.
* _confirmations (public)_: stores the index of a transaction as key with its value being a map whose key is the owner’s address and value is a boolean.
* _isOwner (public)_: stores the address of various owners.
* _owners (public)_: an array containing the address of all the owners.
* _required (public)_: Keep the number of required confirmations.
* _transactionCount (public)_: Stores the number of transactions on the system.

### **Events**
* _Deposit_: Events emitted when Ether is deposited on the smart contract.
* _OwnerAddition_: Emitted when a new owner is added.
* _OwnerRemoval_: Emitted when an owner is removed.
* _RequirementChange_: Emitted when there is a change in requirement.
* _Confirmation_: Emitted when a submitted transaction has been approved by an owner.
* _Revocation_: Emitted when a confirmed transaction is revoked.
* _Execution_: Emitted when a transaction is executed successfully.
* _ExecutionFailure_: Emitted when a transaction execution fails.


## **Farming Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit from any address at any time but only begin accruing rewards at the beginning of the monthly reward cycle(???): Yes
* Deposits are locked until the end of the reward cycle and can only be withdrawn on the reward distribution date (end of the month / monthly). Otherwise they roll over to the next reward cycle the following day after the reward distribution date. : Yes
* 100% of deposits are distributed to farmers monthly as rewards.: Yes
* (Variable APY that is dependent on network utilization ie: trades, revenues, etc and the number of farmers on the network): Yes
* Rewards are withdrawn and sent to the same deposit wallet address: Yes
* Withdrawals are restricted to the same deposit wallet address (for farmers to withdraw deposited $HVLP): Yes

### **Summary**
The farming smart contract inherits from the Openzeppelin’s Ownable and ReentrancyGuard. It uses the Safemath and SafeERC20 library.

At the point of deployment, the feeAddress, address of the Money, and the Reserve smart contract are set, after confirming that neither is set as the zero(0) address.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/Farming.sol](https://github.com/hodlverse/contracts/blob/master/contracts/Farming.sol)

### **Functions**
* _poolLength_: returns the total number of liquidity pools available in the smart contract.
* _deposit_: uses the nonReentrant modifier to prevent reentrancy attacks. It accepts tokens for the liquidity pool and gives the liquidity pool token provider money tokens. It emits a Deposit event. 
* _withdraw_: accepts the id of the pool we want to withdraw from and the amount we want to withdraw from the pool. It uses the nonReentrant modifier to prevent reentrancy attacks. It emits the Withdraw event when the withdrawal is done.
* _massUpdatePools_: goes through all the liquidity pools ensuring that the reward variables are up to date.
* _updatePool_: accepts the pool’s id and ensures that the reward variables of the given pool are up to date.

### **Variables**
* _money (public)_: address of the MoneyToken smart contract.
* _feeAddress (public)_:  the address where the pool deposit fee is sent to.
* _reserve (public)_: the address of the reserve smart contract.
* _poolInfo (public)_: an array containing all PoolInfo struct.
* _userInfo (public)_: a collection of each pool id to a user’s address to the UserInfo struct.
* _totalAllocPoint (public)_: a summation of all the allocated points in all pools.
* _availableRewards (public)_: total rewards in the farming contract.
* _rewards (public)_: An array taking hold of the total rewards generated during each period the massUpdatePools function is called.
* _globalRoundId (public)_: It holds the count of how many times we have updated all liquidity pools.
* _reserveDistributionSchedule (public)_: A farming cycle calculated in days.
* _lastReserveDistributionTimestamp (public)_: When the last circle ended.
* _depositPeriod (public)_: The farm period a user has to submit their token for farming or withdraw the token they deposited initially. It is calculated in hours.

### **Events**
* _Deposit_: emitted when the liquidity pool tokens are deposited into the farming contract.
* _Withdraw_: emitted when the liquidity pool token is withdrawn from the farming contract.


## **Staking Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit from any address at any time but Rewards only accrue on funds staked prior to each 30 day reward cycle(???): Yes
* Deposits are locked until the end of the reward cycle and can only be withdrawn on the reward distribution date. Otherwise, they roll over to the next reward cycle the following day after the reward distribution date.: Yes
* 100% of deposits are distributed to stakers monthly.: Yes
* (Variable APY that is dependent on network utilization ie: trades, revenues, etc and the number of stakers on the network): Yes
* Rewards are withdrawn and sent to the same deposit wallet address: Yes
* Withdrawals are restricted to the same deposit wallet address (for stakers to withdraw deposited $MONEY): Yes

### **Summary**
The staking smart contract inherits from the Openzeppelin’s Ownable and ERC20 smart contract. The ERC20 token is initialized with the name Staking and the symbol xMONEY. It uses the SafeMath library and also interacts with the Money and Reserve smart contract.

At the point of deployment, the money smart contract address is set.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/Staking.sol](https://github.com/hodlverse/contracts/blob/master/contracts/Staking.sol)


### **Functions**
* _enter_: collects money tokens and mints an appropriate amount of xMONEY token which is sent to the function’s caller.
* _accumulateRewards_: makes a call to the reserve smart contract to check if there are rewards to withdraw and proceeds to withdraw it if it exists or reverts if withdrawal is not possible.
* _leave_: allows one who stakes money tokens to unlock the staked tokens and any rewards it has accrued. It accepts the xMONEY token that was given earlier and burns it.

### **Variables**
* _money (public)_: address of the money smart contract.
* _reserve (public)_: address of the reserve smart contract.

### **Events**
* No events are emitted by this contract


## **Router Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* This contract helps in doing pair functions easily thus providing us a middleware to perform transactions easily.: Yes
* Helps in performing swaps, addLiquidity and removeLiquidity: Yes

Summary
The router contract inherits from the IRouter interface and uses the SafeMath library. It interacts with the factory and WETH smart contract.

It has a modifier that ensures that the deadline is in the future.

At the point of deployment, it sets the factory and WETH smart contract address.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/pairs/Router.sol](https://github.com/hodlverse/contracts/blob/master/contracts/pairs/Router.sol)

### **Functions**
* _addLiquidity_: adds liquidity to an ERC-20 <- -> ERC-20 pool.
* _addLiquidityETH_: adds liquidity to the ERC-20 <- -> WETH pool with ETH.
* _removeLiquidity_: removes liquidity from an ERC20 - ERC20 pool.
* _removeLiquidityETH_: removes liquidity from an ERC-20 - WETH pool and returns ETH to the liquidity provider.
* _removeLiquidityWithPermit_: allows one to remove liquidity from a pool without seeking approval first.
* _removeLiquidityETHWithPermit_: allows one to remove liquidity from a pool without seeking approval first and gives back ETH to the one removing the liquidity.
* _removeLiquidityETHSupportingFeeOnTransferTokens_: helps to remove liquidity for tokens that require some fee to be paid when transferring. 
* _removeLiquidityETHWithPermitSupportingFeeOnTransferTokens_: helps to remove liquidity for tokens that require some fee to be paid when transferring and  needs no pre-approval to remove liquidity from a token.
* _swapExactTokensForTokens_: swaps an exact amount of input tokens for as many output tokens as it can get. The first address in the pair array is that of the input token, and the last address is that of the output address. Other addresses are for pairs to be traded through if there is no direct pair between the first and the last token.
* _swapTokensForExactTokens_: it is the opposite of the swapExactTokensForTokens method. It operates in a similar way to the swapExactTokensForTokens method.
* _swapExactETHForToken_: swaps an exact amount of ETH for as many output tokens as possible, following the route specified by the path.
* _swapTokensForExactETH_: returns an exact amount of ETH for as few input tokens as possible, the pair can contain the address of two elements or more.
* _swapExactTokensForETH_: swaps an exact amount of token for as much ETH as possible.
* _swapETHForExactTokens_: receives an exact amount of tokens for as little ETH as possible.
* _swapExactTokensSupportingFeeOnTransferTokens_: swaps an exact amount of input tokens for as many output tokens as it can get. Any or both of these tokens may require a fee on transfer. 
* _swapExactETHForTokensSupportingFeeOnTransferTokens_: swaps an exact amount of ETH for as many output tokens requiring a transfer fee as possible. 
* _swapExactTokensForSupportingFeeOnTransferTokens_: swaps an exact amount of input tokens for as many output tokens as it can get. Any or both of these tokens may require a fee on transfer.
* _receive_: Accepts Ether from only the WETH smart contract.

### **Variables**
* _factory (public)_: address of the factory smart contract.
* _WETH (public)_: address of the WETH smart contract.

### **Events**
* No events are emitted by this contract


## **Core Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* .4% fee (revenue) every swap - .2% if the wallet holds > 1000 $MONEY: Yes
* .25 of the fee is re-added back to the LP pool - .125 if the wallet holds > 1000 $MONEY: Yes
* .15 of the fee is distributed to the Buyback Contract  - .075 if the wallet holds > 1000 $MONEY: Yes
* No withdrawal function: Yes

### **Summary**
The Core smart contract inherits from the liquidity pool token smart contract. It uses SafeMath and UQ112x112 for arithmetic calculations. It is always deployed from the Factory smart contract whenever a new pool is to be added to the Hodlvalley ecosystem. 

It comes with a lock modifier that locks a method when in use and unlocking the methods when not in use.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/pairs/Core.sol](https://github.com/hodlverse/contracts/blob/master/contracts/pairs/Core.sol)

### **Functions**
* _getReserves_: returns the reserves. The reserves are the balance for each token in the pool, stored as a binary fixed-point number and the block timestamp when the reserves were set.
* _mint_: creates new Liquidity pool tokens after calculating how many needs to be created and sends the created tokens to the user selected to address. It emits the Mint event.
* _burn_: calculates the available liquidity and uses the data to calculate how much of each token will be sent to the inputted address and sends it. The liquidity is burnt and the burn event is emitted.
* _swap_: echanges specified amount of token in a pool for $MONEY token and emits the Swap events.
* _skim_: ensures that balances match reserves
* _sync_: ensures that reserves match balances.

### **Variables**
* _factory (public)_: address of the factory contract.
* _token0 (public)_: address of token0.
* _token1 (public)_: address of token1.
* _reserve0 (public)_: balance of the first token in the pool stored as a binary fixed point number.
* _reserve1 (public)_: balance of the second token in the pool stored as a binary fixed point number.
* _blockTimestampLast (public)_: The timestamp stored as a 32 bits integer at the point of setting the reserves.
* _price0CumulativeLast (public)_: The last cumulative price for token0 calculated at the point of updating using the reserves.
* _price1CumulativeLast (public)_: The last cumulative price for token1 calculated at the point of updating using the reserves.
* _kLast (public)_: It is emitted after the last liquidity event. It is a multiplication of the two reserve values and is calculated if the lpFeeOn found on the factory smart contract is true.

### **Events**
* _Mint_: emitted when liquidity tokens are created.
* _Burn_: emitted when liquidity tokens are destroyed.
* _Swap_: emitted when liquidity tokens are swapped.
* _Sync_: emitted when reserves are made to match balances.


## **Factory Smart Contract**

### **Requirements**

* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Creates new token pools on HODLVERSE: Yes
* Stores the fee to be deducted from pool after swaps: Yes
* Stores the feeTo address which is the Buyback contract in HODLVERSE: Yes
* Stores the address of all pairs: Yes

### **Summary**
The factory contract inherits from the IFactory interface. It interacts with the Owner, BuyBack, Money, and Migrator smart contract. It aids with the creation of liquidity pools.
The constructor sets the owner of the contract and the address of the money smart contract. The owner variable set will be needed by the onlyOwner modifier to grant access to some functions.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/pairs/Factory.sol](https://github.com/hodlverse/contracts/blob/master/contracts/pairs/Factory.sol)

### **Functions**
* _allPairsLength_: returns the total number of pools/pairs available
* _pairCodeHash_: returns the hash of the memory byte array that contains the creation bytecode of the Core contract.

* _createPair_: accepts the address of two tokens and deploys a Core contract creating a liquidity pool for the two tokens. It puts the details of the pair in the getPair mapping and adds the pool/pair in the allPairs array. It emits the PairCreated event.
* _getSwapFee_: collects a user address and calculates how much they will be charged as swap fee and buybackShare.

### **Variables**
* _owner (public)_: address of the owner.
* _buyback (public)_: address of the buyback contract.
* _money (public)_: address of the money smart contract.
* _migrator (public)_: address of the migrator smart contract.
* _lpfeeOn (public)_: holds the boolean state that determines if the liquidity pool fee should be on or not.
* _swapFee (public)_: holds what the percentage should be charged as swap fee
* _buybackshare (public)_: holds what percentage should be charged as buybackshare
* _discountEligibilityBalance (public)_: how much Money token you need to have toreceive a discount on swap fee and  buybackshare.
* _getPair (public)_: holds the address to a pool and the address of each token in the pool.
* _allpairs (public)_: holds the address to each pool.

### **Events**
* _PairCreated_: emitted when a pair is created.


## **HVLPToken Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Asset Type: ERC20
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit function from any address at any time: Yes
* Mint HVLP function with proportional share of pooled assets added for liquidity: Yes
* Return function with proportional number of deposited pooled assets added for liquidity: Yes
* Withdrawals are restricted to the same deposit wallet address (for LP to withdraw deposited tokens used for liquidity): Yes

### **Summary**
The LiquidityPool smart contract is a smart contract that follows the EIP-2612 standard for extending ERC-20 smart contracts. The tokens generated from the contract have the name and symbol HVLP and eighteen(18) decimals.  

The contract has a transfer and transferFrom method which allows for transferring of HVLP.

The approve function ensures that a user can send HVLP to another user by first approving that the new owner is able to spend the token.

The permit method which uses the DOMAIN_SEPARATOR is used to approve and make transactions.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/pairs/HVLPToken.sol](https://github.com/hodlverse/contracts/blob/master/contracts/pairs/HVLPToken.sol)

### **Functions**
* _approve_: Approves that an amount be sent to another address.
* _transfer_: Transfer an amount to an address.
* _transferFrom_: Transfers from an address you have approval to spend its tokens and the maximum or less than the amount to another address.
* _permit_: Allows the token to be sent to another address without first approving the transaction.

### **Variables**
* _allowance (public)_: stores the balance an address is allowed to transfer to another.
* _balanceOf (public)_: stores the balance of an address.
* _name (public)_: stores the name of the token.
* _symbol (public)_: stores the symbol of the token.
* _decimals (public)_: stores the numbers of decimals.
* _totalsupply (public)_: stores the total amount of liquidity tokens in circulation.

### **Events**
* _Transfer_: Emitted when a user transfers the liquidity token they have on the contract.
* _Approval_: Emitted when a user approves their token to be transfered.


## **WETH Smart Contract**

### **Requirements**

* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit function from any address: Yes
* Mint WETH function with proportional number of deposited ETH: Yes
* Return ETH function with proportional number of deposited WETH: Yes
* Withdrawals are restricted to the same deposit wallet address: Yes

### **Summary**
The WETH smart contract ensures that Ether can be traded on any decentralized exchange like other ERC-20 tokens. It follows the EIP-20 standards for creating a non-fungible token. We do not own it but we interact with it in our contracts like the Router smart contract.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/mocks/WETH9.sol](https://github.com/hodlverse/contracts/blob/master/contracts/mocks/WETH9.sol)

### **Functions**
* _withdraw_: The withdraw function accepts the amount of WETH we need to withdraw and sends its equivalent in ETH to the smart contract.
* _balanceOf_: The balanceOf function is used to check how much WETH belongs to our smart contract.
* _deposit_: The deposit method accepts ETH from us and returns the equivalent WETH.
* _transfer_: The transfer method sends the specified amount from the WETH we have deposited to the address of a liquidity pool we have specified.

### **Variables**
* _allowance (public)_: stores the balance an address is allowed to transfer to another.
* _balanceOf (public)_: stores the balance of an address.
* _name (public)_: stores the name of the token.
* _symbol (public)_: stores the symbol of the token.
* _decimals (public)_: stores the numbers of decimals.

### **Events**
* _Deposit_: Emitted when a user deposits Ether on the smart contract.
* _Withdrawal_: Emitted when a user withdraws the Ether they initially deposited.
* _Transfer_: Emitted when a user transfers the Ether they have on the contract.
* _Approval_: Emitted when a user approves their token to be transfered.


## **Xchain Smart Contract**

### **Requirements**

* Blockchain: Ethereum
* Ropsten Contract Address: HTLC contract deploys on an as-needed basis
* Mainnet Contract Address: HTLC contract deploys on an as-needed basis
* Deposit from any address: Yes

### **Summary**
This contract is deployed at the point of need. It ensures swaps can happen across various blockchains. This swap happens with the help of Hash Time Locked Contracts(HTLCs) ensuring that an individual’s coin does not go missing. No central entity or individual is involved in this swap. 

Anytime a user needs to perform a swap a new hash time lock contract is deployed using its byte code. The contract contains the token/cryptocurrency the user wants to swap locked in it. At the same time, an automated service deploys a hash time lock contract and locks in it the token/cryptocurrency the user needs. The user then retrieves the token they wanted and upon doing that on our end the automated service is able to collect the token the user locked in initially.

If the deadline placed on the deployed contract expires both the user and the automated service gets their token/coin refunded.

### **Code**
< link to contract code on Github >

### **Functions**
* _refund (public)_: called when a swap between wallets has expired, or has been cancelled, forfeited or is no longer viable for completion. 
* _claim (public)_: Open to all users. Allows a user wallet to submit a claim for funds held in an HTLC contract using the secret for the transaction.

### **Variables**
* _recipientAddress_: address of the recipient of a token set to be swapped.
* _refundAddress_: address of where a token should be refunded.
* _tokenAddress_: address of the token involved in the swap.
* _ERC20_: interface for the tokenAddress.
* _hashedSecret_: used in the Claim function to validate the secret

### **Events**
* _Claimed_: emitted when a wallet successfully carries out the claim operation using the transaction secret. 
* _Refund_: emitted when a refund operation has successfully been executed for an expired, cancelled forfeited swap.

## **IDO Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit from any address: Yes
* Claim governance token with a deposit address: Yes
* Withdrawer’s address claim all deposited USDT: Yes

### **Summary**
The IDO Contract aids in the generation of funds by accepting users’ USDT tokens, locking them, and giving them MONEY tokens when the IDO contract is finally unlocked. The MONEY token makes them citizens of HODLVERSE with governance privilege.

This contract inherits from the Pausable smart contract and the Ownable smart contract. It uses the SafeMath and SafeERC20 library. It is necessary as it is the logic behind the decentralized offering. At the point of deployment the saleStartTime, saleEndTime, unlockTime, saleCap, depositMin, depositMax, exchangeRate, withdrawer, USDT, and MONEY variables are set.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/IDO.sol](https://github.com/hodlverse/contracts/blob/master/contracts/IDO.sol)

### **Functions**
* _deposit (public)_: Accepts USDT between the minimum and maximum deposit amount and within the start and end of the sales period before the sales cap is hit. Stores the data of each address and the total number of USDT deposited. 
* _claim (public)_: Open to all users. Checks if the unlock time condition has been met and if the user deposited any USDT. For all users who deposited USDT tokens, their equivalent in MONEY will be sent to them.

### **Variables**
* _saleStartTime_: The time when the IDO starts.
* _saleEndTime_: The time when the IDO ends.
* _unlockTime_: Holds the time in seconds when the IDO should be unlocked for participants to claim their Money.
* _saleCap_: Holds the amount of USDT we plan to generate from the sales.
* _exchangeRate_: Holds the exchange rate between USDT and Money.
* _depositMin_: Holds the minimum amount of USDT needed for the IDO per address.
* _depositMax_: Holds the maximum number of USDT tokens needed for the IDO per address.
* _totalBalance_: Holds the total number of USDT deposited.
* _totalClaimed_: Holds the token number of Money that has been claimed.
* _withdrawer_: Holds the address that is allowed to withdraw the USDT off the IDO smart contract.
* _USDT_: Holds the address of the USDT token smart contract.
* _MONEY_: Holds the address of the Money token smart contract.

### **Events**
* _Deposited_: Emitted when a user successfully carries out the deposit operation. 
* _Claimed_: Emitted when a user successfully carries out the claim operation.


## **MainBridge Smart Contract**

### **Requirements**

* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit from any address: No

### **Summary**
MainBridge smart contract ensures swapping can be done between the Ethereum and Binance smart chain network. 

It inherits from a BasicBridge contract which it uses to ensure that calls cannot be made to the bridge contract from a remote contract. 

The BridgeSmart contract uses the SafeERC20. 

### **Code**

[https://github.com/hodlverse/contracts/blob/master/contracts/MainBridge.sol](https://github.com/hodlverse/contracts/blob/master/contracts/MainBridge.sol)

### **Functions**

* _registerSwapPairToSide (external)_: Accepts an erc20 token address. It ensures the address is not registered already and that the erc20 token has a name and symbol. 
Finally it adds the new address to the registeredERC20 map, emits the SwapPairRegister events and returns true.
* _swapETH2Side (external)_: Open to all users. Accepts the erc20 token address and the amount of erc20 tokens to send across. Checks if the erc20 token address is registered on the contract and the exact swap fee is also sent across. Transfers the erc20 token to the smart contract, emits the SwapStarted and returns true.
* _swapFee (public)_: Returns the amount in Eth needed to swap between Ethereum and Binance smart Chain.

### **Variables**
* _registeredERC20_: Contains the address of all registered erc20 tokens.
* _filledSideTx_: Saves the hash for every transaction that lands on the contract from the other end of the bridge., as well as the status.
* _swapFee_: Holds how much Eth a user will pay to swap between the Ethereum and Binance smart chain.

### **Events**
* _SwapPairRegister_: Emitted when a new erc20 token is registered on the platform using the registerSwapPairToSide. 
* _SwapStarted_: Emitted when a swap is triggered from this contract from the swapETH2Side function.


## **SideBridge Smart Contract**

### **Requirements**
* Blockchain: Ethereum
* Ropsten Contract Address: 0x0000000000000000000000000000000000000000
* Mainnet Contract Address: 0x0000000000000000000000000000000000000000
* Deposit from any address: No

### **Summary**
SideBridge smart contract ensures swapping can be done between the Binance smart chain and the Ethereum network. 

It inherits from a BasicBridge contract which ensures that calls cannot be made to the bridge contract from a remote contract. 

The BridgeSmart contract uses the SafeERC20. 

### **Code**

[https://github.com/hodlverse/contracts/blob/master/contracts/SideBridge.sol](https://github.com/hodlverse/contracts/blob/master/contracts/SideBridge.sol)

### **Functions**
* _swapSideToMain (external)_: Open to all users. Accepts the bep20 token address and the amount of bep20 tokens to send across. Checks if its corresponding erc20 token address is registered on the contract and the exact swap fee is also sent across. Transfers the bep20 token to the smart contract, emits the SwapStarted and returns true.
* _swapmappingMainToSide (public)_: A getter function that accepts the erc 20 token address and returns the corresponding bep 20 token address.
* _swapMappingSideToMain (public)_: A getter function that accepts bep 20 tokens and returns the corresponding erc 20 token address.
* _filledMainTx (public)_: A getter function that accepts a transaction hash and returns the status of the transaction in boolean. 
* _swapFee (public)_: Returns the amount in Eth needed to swap between Ethereum and Binance smart Chain.

### **Variables**
* _filledSideTx_: Saves the hash for every transaction that lands on the contract from the other end of the bridge., as well as the status.
* _swapmappingMainToSide_: holds an erc 20 token address and its corresponding bep 20 token address.
* _swapMappingSideToMain_: holds a bep 20 token address and its corresponding erc 20 token address.
* _swapFee_: Holds how much Eth a user will pay to swap between the Ethereum and Binance smart chain.

### **Events**
* _SwapPairCreated_: Emitted when a new pair of erc20 token address and bep 20 token address are registered on the platform using the createSwapPair method. 
* _SwapStarted_: Emitted when a swap is triggered from this contract from the swapSideToMain function.


## **MoneyTokenBridge Smart Contract**

### **Requirements**

* Blockchain: Binance Smart Contract
* Asset Type: BEP20
* Title of Smart Contract: $MONEY Token Contract
* Token Symbol: MONEY
* Name Of Token: MONEY
* Token Supply: 0
* Number of Decimals: 18
* Mintable: Yes
* Burnable: Yes
* Testnet Binance Smart Chain Address: 0x0000000000000000000000000000000000000000
* Mainnet Binance Smart Chain Address: 0x0000000000000000000000000000000000000000

### **Summary**
This is a smart contract that follows the BEP-20 standard with a twist: contract inherits from the ownable smart contract and can be used for governance.

At the point of deployment, the contract has a total supply of zero(0) tokens.

Like other smart contracts that follow the BEP-20 protocol this contract contains the burn, allowance, approve, balanceOf, transfer, mintTo and transferFrom method. It has the ability to be used as a governance token on all chains.

### **Code**
[https://github.com/hodlverse/contracts/blob/master/contracts/MoneyTokenBridge.sol](https://github.com/hodlverse/contracts/blob/master/contracts/MoneyTokenBridge.sol)

### **Functions**
* _Allowance (external)_ : returns the number of tokens an account is allowed to spend on behalf of another account.
* _Approve (external)_ : approves an account to send up to a certain amount to another account.
* _balanceOf (external)_ : returns how many tokens an account has.
* _Transfer (external)_ : sends a specified amount of tokens to a specified address.
* _transferFrom (external)_ : sends a specified amount of tokens from a specified account to another specified account.

### **Variables**
* _name (public)_: The name of the ERC-20 token.
* _symbol (public)_: The symbol of the ERC-20 token.
* _decimal (public)_: The number of decimals the token has.
* _totalSupply (public)_: The total number of tokens in circulation.

### **Events**
* _Transfer_: emits when an address transfers some MONEY token
* _Approval_: emits when an account has been approved to spend an amount of token on behalf of a user.