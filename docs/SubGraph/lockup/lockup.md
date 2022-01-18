## lockup

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| pools | Pool[] | an array of pools |
| totalAllocPoint | BigInt | total allocation point |
| poolLength | BigInt | holds the number of liquidity pools available |

## Pools

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| lockup | Lockup(optional) | data from the lockup entity for the pool |
| balance | BigInt | remaing quantity of each token in the pool |
| allocPoint | BigInt | allocation point for a pool |
| moneyPerShare | BigInt | accumulated money per share |

## User 

| Field | Type | description |
|-------|------|-------------|
| id | ID | unique identifier |
| lockup | Lockup(optional) | data from the lock up entity for the user |
| pool | Pool | data from the pool entity for the user |
| address | Bytes | user address |
| amount | BigInt | amount |
| rewardDebt | BigInt | rewardDebt |
| moneyharvestedSinceLockup | BigDecimal | money harvested since lockup by the user |
| moneyHarvestedSinceLockupUSD | BigDecimal | value of money harvested since lockup in USD |