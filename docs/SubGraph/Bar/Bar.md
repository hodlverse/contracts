# Entities

## Entity

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| decimals | Int | number of decimals xMoney has |
| name | String | name of the liquidity pool token (xMoney) |
| money | Bytes | address of the Money smart contract |
| symbol | String | symbol of the xMoney token |
| totalSupply | BigDecimal | total number of xMoney in circulation |
| ratio | BigDecimal | ratio of xMoney to Money |
| xMoneyMinted | BigDecimal | total quantity of xMoney token minted |
| xMoneyBurned | BigDecimal | total quantity of xMoney token burnt | 
| moneyStaked | BigDecimal | total quantity of Money staked |
| moneyStakedUSD | BigDecimal | total quantity of money staked with its equivalence in USD |
| moneyHarvested | BigDecimal | total quantity of money taken out of the staking contract |
| moneyHarvestedUSD | BigDecimal | equivalence of money harvested from the staking contract in USD. |
| xMoneyAge | BigDecimal | a measure of how many time a user has staked on the platform |
| xMoneyAgeDestroyed | BigDecimal | a measure of how many times a user has unstaked |
| users | address[] | an array of user address currently staking |
| updatedAt | BigInt | timestamp showing the last time the subgrapgh data was updated |

## User 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| bar | Bar(optional) | The bar object containing staking data for the user from the Bar subgraph |
| xMoney | BigDecimal | amount of xMoney a user has |
| xMoneyIn | Bigdecimal | amount of xMoney a user receives |
| xMoneyOut | BigDecimal | amount of xMoney a user looses or gives out |
| xMoneyMinted | Bigdecimal | amount of xMoney minted to a user |
| xMoneyBurned | BigDecimal | amount of a user's xMoney sent to the burn address |
| xMoneyOffset | BigDecimal | The amount of xMoney token taken out when a user unstakes |
| xMoneyAge | BigDecimal | a measure of how long a user has been staking |
| xmoneyAgeDestroyed | BigDecimal | a measure of how long a user has been unstaking |
| moneyStaked | BigDecimal | amount of money a user has staked |
| moneyStakedUSD | BigDecimal | the USD value of what a user has staked |
| moneyHarvested | BigDecimal | amount of money token a user has unstaked |
| moneyHarvestedUSD | the USD value of what a user has unstaked |
| moneyOut | BigDecimal | amount of money a user withdraws from the contract |
| moneyIn | BigDecimal | amount of money token a user deposits in the contract |
| usdOut | BigDecimal | amount of USD a user withdraws from the contract |
| usdIn | BigDecimal | amount of USD a user deposits in the contract |
| updatedAt | BigInt | the last time a user details was updated |
|moneyOffset | BigDecimal | The amount of money token taken out when a user unstakes |
| usdOffset | BigDecimal | The value of money token in USD taken out when a user unstakes |


## History
```Typescript
enum Timeframe {
    Day
}
```

| Field | Type | Description | 
|-------|------|-------------|
| id | ID | unique identifier |
| date | Int | date of the data |
| timeframe | TimeFrame | duration with which the data is gathered |
| moneyStaked | BigDecimal | amount of money staked |
| moneyStakedUSD | BigDecimal | value of money staked in USD |
| moneyharvested | BigDecimal | amount of money harvested through staking |
| moneyHarvestedUSD | BigDecimal | value of money harvested through staking in USD |
| xMoneyAge | BigDecimal | a measure of how long staking has been going on |
| xMoneyAgeDestroyed | BigDecimal | a measure of how long unstaking has been taking place. |
| xMoneyMinted | BigDecimal | amount of xMoney minted |
| xMoneyBurned | BigDecimal | amount of xMoney burned |
| xMoneySupply | BigDecimal | amount of xMoney in circulation |
| ratio | BigDecimal |  ratio of xMoney to money |