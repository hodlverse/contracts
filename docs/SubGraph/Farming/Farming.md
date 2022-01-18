## Farming 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| owner | Bytes | address of the farm owner |
| feeAddress | Bytes | address of the fee smart contract |
| reserve | Bytes | address of the reserve smart contract |
| money | Bytes | address of the money smart contract |
| totalAllocPoint | BigInt | sum of points allocated |
| availableRewards | BigInt | available rewards |
| rewards | BigInt[] | array of rewards |
| pools | Bytes[] | array of pool's address |
| poolCount | BigInt | total number of pools |
| globalRoundId | BigInt | global round id indicating reward intervals |
| reserveDistributionSchedule | BigInt | stores the waiting time before fetching the next round of rewards |
| lastReserveDistributionTimestamp | BigInt | last time harvesting occurred |
| depositperiod | BigInt | the time frame a has to plant before the next farming season starts | 
| hvlpBalance | Bigdecimal | amount of hvlp token locked in the farming contract |
| hvlpAge | BigDecimal | measures how long farming has been farmed |
| hvlpAgeRemoved | BigDecimal | measure of how long hvlp tokens were farmed before removing |
| hvlpDeposited | BigDecimal | amount of liquidity pool token transferred to the farming smart contract |
| hvlpWithdrawn | Bigdecimal | amount of liquidity pool token removed from the smart contract |
| history | History[] | array of data gotten from querying the history entity |
| updateAt | BigInt | time the farming subgraph was last updated |


## History 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| owner | Bytes | address of the farming smart contract, the user or the liquidity pool |
| hvlpBalance | BigDecimal | the amount of liquidity pool token owned |
| hvlpAge | BigDecimal | measures how long farming has been done |
| hvlpAgeRemoved | BigDecimal | measures how long harvesting has been done |
| hvlpDeposited | BigDecimal | total liquidity pool token deposited |
| hvlpWithdrawn | BigDecimal | total liquidity pool token taken out |
| timestamp | BigInt | time the data was gathered |
| block | BigInt | the number of the block the farming was mined in |

## Pool 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| owner | Bytes | address of the farming smart contract |
| pair | Bytes | address of a liquidity pool / pair |
| poolStartTime | BigInt | the time liquidity pool starts off |
| depositFeeBP | BigInt | fee charged when one deposits into the liquidity pool |
| globalRoundId | BigInt | global round id at pool creation |
| allocPoint | BigInt | allocation point per user |
| lastRewardBlock | BigInt | the block number the last reward was mined in |
| rounds | PoolRounds[] |  |
| balance | BigInt |  |
| users | Users[] | array of users data |
| userCount | BigInt | total number of pool users |
| hvlpbalance | BigDecimal |  |
| hvlpAge | BigDecimal | measure of how long a farm has been running |
| hvlpAgeRemoved | BigDecimal | measure of how long a farm has stopped running |
| hvlpDeposited | BigDecimal | how much liquidity pool token was deposited |
| hvlpWithdrawn | BigDecimal | how much liquidity pool token was withdrawn |
| timestamp | BigInt | time of last transaction |
| block | BigInt | the block number the pool was mined in |
| updatedAt | BigInt | the last time the subgrapgh was updated |
| entryUSD | BigDecimal | all time amount in usd thrown into the pool |
| exitUSD | BigDecimal | all time amount in usd taken out from the pool |
| moneyHarvested | BigDecimal | amount of money taken out from the farm |
| moneyHarvestedUSD | BigDecimal | amount in USD taken out from the farm after yield |

## PoolRounds 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | Index of pool round in pool on Farming contract |
| pool | Pool | data about the pool on a farming contract |
| accMoneyPerShare | BigInt | accumulated money per share |
| deposits | BigInt| liquidity pool token deposited during the pool round | 
| userCount | BigInt | number of all users in a pool round |
| hvlpBalance | BigDecimal | balance of liquidity pool token during the pool round |
| hvlpAge | BigDecimal | measure of how long farming has occured in the round |
| hvlpAgeRemoved | BigDecimal | measure of how long the farm has been harvested or user pulled out of the pool |
| hvlpDeposited | BigDecimal | amount of liquidity pool token deposited in the pool in the pool round |
| hvlpWithdrawn | BigDecimal | amount of liquidity pool token withdrawn from the pool during the pool round |
| timestamp | BigInt | the time at which the last transaction happened in the pool |
| block | BigInt | the block numbr of the block the pool round was mined in |
| updatedAt | BigInt | the last time the subgraph was updated |
| entryUSD | BigDecimal | all time amount in usd thrown into the pool |
| exitUSD | BigDecimal | all time amount in usd taken from the pool |
| moneyHarvested | BigDecimal | amount of money taken out from the farming contract |
| moneyHarvestedUSD | BigDecimal | equivalence of money token harvested in USD |

## PoolHistory 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | concatenation of the pool id and timestamp |
| pool | Pool | data about the pool on a farming contract at a particular point in time |
| hvlpBalance | BigDecimal | balance of liquidity pool token at a particular point in time | 
| hvlpAge | BigDecimal | measure of how long farming has occured at a particular point in time |
| hvlpAgeRemoved | BigDecimal | measure of how long the farm has been harvested or user pulled at a particular point in time |
| hvlpDeposited | BigDecimal | amount of liquidity pool token deposited in the pool at a particular point in time |
| hvlpWithdrawn | BigDecimal | amount of liquidity pool token withdrawn from the pool at a particular point in time |
| userCount | BigInt | number of all users in a pool at a particular point in time |
| timestamp | BigInt | the time at which the last transaction happened | 
| block | BigInt | the number of the block |
| entryUSD | BigDecimal | all time amount in usd thrown into the pool at that point in time |
| exitUSD | BigDecimal | all time amount in usd taken from the pool at that point in time |
| moneyHarvested | BigDecimal | amount of money taken out from the farming contract |
| moneyHarvestedUSD | BigDecimal | equivalence of money harvested in USD |

## User

| Field | Type | Description |
|-------|------|-------------|
| id | ID | pool id concatenated with user address |
| address | Bytes | user's address |
| pool | Pool (optional) | data from the related pool |
| entryRound | BigInt (optional) | entry round of the related pool |
| amount | BigInt | amount of money the user put into the pool |
| entryUSD | BigDecimal | all time amount in USD the user has put in the pool |
| exitUSD | BigDecimal | all time amount in USD the user has removed from the pool |
| moneyHarvested | BigDecimal | amount of money the user has harvested from the farm |
| moneyHarvestedUSD | BigDecimal | equivalence of money harvested by the user in USD |
| timestamp | BigInt | timestamp of the last user transaction |
| block | BigInt | the block this data were mined into |

