## User

| Field | Type | Description |
|-------|------|-------------|
| id | ID | uses address as a unique identifier for each user |
| liquidityPositions | liquidityPosition[] | an array containing a user's various liquidity positions |

## Bundle

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| ethPrice | BigDecimal | price of ETH in USD |

## Factory

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| pairCount | BigInt | a count of all the pairs available for swaps |
| volumeUSD | BigDecimal | USD volume across all pairs |
| volumeETH | BigDecimal | ETH volume across all pairs |
| untrackedVolumeUSD | BigDecimal | USD volume across all pairs not tracked |
| liquidityUSD | BigDecimal | liquidity in all pairs calculated in USD |
| liquidityETH | BigDecimal | liquidity in all pairs calculated in ETH |
| txCount | BigInt | total number of transactions performed |
| tokenCount | BigInt | total number of token |
| userCount | BigInt | total number of user |
| pairs | Pair[] | referencing the Pair entity, an array of pairs |
| tokens | Token[] | referencing the Token entity, an array of tokens |
| hourData | HourData[] | referencing the HourData entity, an array of hourData |
| dayData | DayData[] | referencing the dayData entity |

## HourData

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unix timestamp at the start of an hour |
| date | Int | unix timestamp |
| factory | Factory | reference to the factory entity |
| volumeETH | BigDecimal | total volume in ETH across all pairs at that hour |
| volumeUSD | BigDecimal | total volume in USD across all pairs at that hour |
| untrackedVolume | BigDecimal | USD volume across all pairs not tracked at that hour |
| liquidityETH | BigDecimal | the amount of liquidity in all pairs in ETH at that hour|
| liquidityUSD | BigDecimal | the amount of liquidity across all pairs in USD at that hour |
| txCount | BigInt | the total number of transaction at that hour |

## DayData

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unix timestamp in seconds at the start of the day divided by the number of seconds in a day(86400) |
| data | Int | unix timestamp at the start of the day |
| factory | Factory | references the factory entity |
| volumeETH | BigDecimal | total volume in ETH across all pair that day |
| volumeUSD | BigDecimal | total volume in USD across all pair that day |
| untrackedVolume | BigDecimal | total volume in all pair not tracked that day |
| liquidityETH | BigDecimal | total liquidity in ETH in all pairs that day |
| liquidityUSD | BigDecimal | total liquidity in all pairs in USD that day |
| txCount | BigInt | total transaction count for the day |

## Token

| Field | Type | Description |
|-------|------|-------------|
| id | ID | token address |
| factory | Factory | references the Factory entity |
| symbol | String | token's symbol |
| name | String | token's name |
| decimals | BigInt | token's decimal |
| totalSupply | BigInt | token's total supply |
| volume | BigDecimal | token's volume across all pairs |
| volumeUSD | BigDecimal | token's volume calculated in USD across all pairs |
| untrackedVolumeUSD | BigDecimal | token's volume in USD not tracked |
| txCount | BigInt | count of all token's transactions across all pairs |
| liquidity | BigDecimal | token's liquidity across all pairs |
| derivedETH | BigDecimal | token's liquidity across all pairs calculated in ETH |
| whiteListPairs | Pair[] | references the Pair entity, array of token's pairs |
| hourData | TokenHourData[] | references the token's hour data entity, contains the token's trade data by the hour |
| dayData | TokenDayData[] | references the token's day data, comtains the token's trade data by day |
| basePairs | Pair[] | references the Pair entity, returns data where token is the base pair(token0) | 
| quotePairs | Pair[] | references the Pair entity, returns data where token is the quote pair(token1) |
| basePairDayData | PairDayData[] | references the PairDayData entity, array of basePairs data by days |
| quotePairsDayData | PairDayData[] | references the PairDayData entity, array of quotePairs data by days |

## TokenHourData

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unix timestamp in seconds of the starting hour |
| date | Int | unix timestamp |
| token | Token | references the token entity |
| volume | BigDecimal | token's total volume in all pair for the hour |
| volumeETH | BigDecimal | token's total volume in all pair for the hour, calculated in ETH |
| volumeUSD | BigDecimal | token's total volume in all pair for the hour, calculated in USD |
| txCount | BigInt | token's total transaction across all pairs by the hour |
| liquidity | BigDecimal | token's total liquidity across all pairs by the hour |
| liquidityETH | BigDecimal | token's total liquidity across all pairs by the hour, calculated in ETH |
| liquidityUSD | BigDecimal | token's total liquidity across all pairs by the hour, calculated in USD |
| priceUSD | BigDecimal | token's price by the hour calculated in USD |

## TokenDayData

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unix timestamp in seconds of the starting day |
| date | Int | unix timestamp |
| token | Token | references the token entity |
| volume | BigDecimal | token's total volume in all pair for the day |
| volumeETH | BigDecimal | token's total volume in all pair for the day, calculated in ETH |
| volumeUSD | BigDecimal | token's total volume in all pair for the day, calculated in USD |
| txCount | BigInt | token's total transaction across all pairs by the day |
| liquidity | BigDecimal | token's total liquidity across all pairs by the day |
| liquidityETH | BigDecimal | token's total liquidity across all pairs by the day, calculated in ETH |
| liquidityUSD | BigDecimal | token's total liquidity across all pairs by the day, calculated in USD |
| priceUSD | BigDecimal | token's price by the day calculated in USD |

## Pair

| Field | Type | Description |
|-------|------|-------------|
| id | ID | pool's address |
| factory | Factory | references the Factory entity |
| name | String | name of the pair |
| token0 | Token | references the Token entity |
| token1 | Token | references the Token entity |
| reserve0 | BigDecimal | the reserve of token0 |
| reserve1 | bigDecimal | the reserve of token1 |
| totalSupply | BigDecimal | total supply of liquidity pool tokens |
| reserveETH | BigDecimal | total reserve in pair calculted in ETH |
| reserveUSD | BigDecimal | total reserve in pair calculated in USD | 
| trackedReserveETH | BigDecimal | tracked reserve in pair calculated in ETH |
| token0Price | BigDecimal | price of token 0 |
| token1Price | BigDecimal | price of token 1 |
| volumeToken0 | BigDecimal | amount of token0 swapped in the pool |
| volumeToken1 | BigDecimal | amount of token1 swapped in the pool |
| volumeUSD | BigDecimal | sum of all token swapped in a pool calculated in USD |
| untrackedVolumeUSD | BigDecimal | Sum of all token swapped in a pair not tracked |
| txCount | BigInt | total number of transactions in a pool |
| liquidityProviderCount | BigInt | numbers of liquidity providers for a pool |
| liquidityPositions | LiquidityPosition[] | an array of refereces to the LiquidityPosition entity. |
| dayData | PairDayData[] | an array of references to the PairDayData entity |
| hourData | PairHourData[] | an array of references to the PairHourData entity|
| mints | Mint[] | an array of references to the Mint entity |
| burns | Burn[] | an array of references to the Burn entity |
| swaps | Swap[] | an array of references to the Swap entity |
| timestamp | BigInt | the time the pair was created |
| block | BigInt | the block number the pair creation was mined in |

## PairHourData

| Field | Type | Description |
|-------|------|-------------|
| id | ID | concatenation of pair id and the timestamp at the start of the hour |
| date | Int | hour start timestamp |
| pair | Pair | references the entity pair |
| reserve0 | BigDecimal | token0 reserve in the pool at the specified hour |
| reserve1 | BigDecimal | token1 reserve in the pool at the specified hour |
| reserveUSD | BigDecimal | total reserve in pair calculated in USD at the specified hour |
| volumeToken0 | BigDecimal | amount of swapped token0 in the pool at the specified hour |
| volumeToken1 | BigDecimal | amount of swapped token1 in the pool at the specified hour |
| volumeUSD | BigDecimal | sum of all swapped tokens in the pool at the specified hour calculated in USD |
| txCount | BigInt | count of all transactions in the pool at the specified hour |

## PairDayData

| Field | Type | Description |
|-------|------|-------------|
| id | ID | concatenation of pair id and the timestamp at the start of the day |
| date | Int | timestamp at start of day |
| pair | Pair | references the entity pair |
| token0 | Token | references the token entity |
| token1 | Token | references the token entity |
| reserve0 | BigDecimal | token0 reserve in the pool on the specified day |
| reserve1 | BigDecimal | token1 reserve in the pool on the specified day |
| totalSupply | BigDecimal | total supply of liquidity tokens distributed to liquidity providers for a pool for a day |
| reserveUSD | BigDecimal | total reserve in pair calculated in USD on the specified day |
| volumeToken0 | BigDecimal | amount of swapped token0 in the pool on the specified day |
| volumeToken1 | BigDecimal | amount of swapped token1 in the pool on the specified day |
| volumeUSD | BigDecimal | sum of all swapped tokens in the pool on the specified day calculated in USD |
| txCount | BigInt | count of all transactions in the pool at the specified hour |

## LiquidityPosition

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| user | User | references the user entity |
| pair | Pair | references the pair entity |
| liquidityTokenBalance | BigDecimal | amount of liquidity token remaining |
| snapshots | LiquidityPositionSnapshot[] | an array containing references to the LiquidityPositionSnapshot entity |
| block | Int | the block number the liquidity position belonged to |
| timestamp | Int | the time the position was created |

## LiquidityPositionSnapshot

| Field | Type | Description |
|-------|------|-------------|
| id | ID | unique identifier |
| liquidityPosition | LiquidityPosition | references LiquidityPosition entity |
| timestamp | Int | time the snapshot was taken |
| block | Int | block transaction was mined |
| user | User | references the user entity |
| pair | Pair | references the Pair entity |
| token0PriceUSD | BigDecimal | price of token0 in USD |
| token1PriceUSD | BigDecimal | price of token1 in USD |
| reserve0 | BigDecimal | reserve of token0 |
| reserve1 | BigDecimal | reserve of token1 |
| reserveUSD | BigDecimal | total reserve in pair calculated in USD |
| liquidityTokenTotalSupply | BigDecimal | total amount of liquidity token |
| liquidityTokenBalance | BigDecimal | amount of liquidity token available in the pool |

## transaction 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | transaction hash |
| blockNumber | BigInt | the  block the transaction was mined in |
| timestamp | time the transaction occured |
| mints | Mint(optional)[] | an array of incomplete mints which may be empty, it references the Mint entity |
| burns | Burn(optional)[] | an array of incomplete burns which may be empty, it references the Burn entity |
| swaps | Swap(optional)[] | an array of incomplete swaps which may be empty, it references the Swap entity |

## mint 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | index of mint in the transaction mint array |
| transactions | Transaction | references the Transaction entity |
| timestamp | BigInt | timestamp of when transaction occurred |
| pair | Pair | references the Pair entity |
| to | Bytes | recipient address |
| liquidity | BigDecimal | amount of liquidity tokens minted |
| sender | Bytes | address initiating the liquidity provision |
| amount0 | BigDecimal | amount of token0 provided |
| amount1 | BigDecimal | amount of token1 provided |
| logIndex | BigInt | index gotten when the transaction event is emitted |
| amountUSD | BigDecimal | amount of all provided token calculated in USD |
| feeTo | Bytes(optional) | address where the liquidity fee will be sent if fee is on |
| feeLiquidity | BigDecimal | amount of liquidity fee to be sent if fee is on |

## Burn 

| Field | Type | Description |
|-------|------|-------------|
| id | ID | index of burn in transaction burns array |
| transaction | Transaction | references the Transaction entity |
| timestamp | BigInt | time the transaction occurred |
| pair | Pair | references the pair transaction |
| liquidity | BigDecimal | amount of liquidity tokens to be burnt |
| sender | Bytes | address initiating the burning |
| amount0 | BigDecimal | amount of token0 removed |
| amount1 | BigDecimal | amount of token1 removed |
| to | Bytes | recipient address |
| logIndex | BigInt | index gotten when the transaction event is emitted |
| amountUSD | BigDecimal | amount of all removed token calculated in USD |
| complete | Boolean | signifies if the burning process was completed(mark false in terms of ETH) |
| feeTo | Bytes(optional) | address where the liquidity fee will be sent if fee is on |
| feeLiquidity | BigDecimal | amount of liquidity fee to be sent if fee is on |

## Swap

| Field | Type | Description |
|-------|------|-------------|
| id | ID | index of swap in transaction swaps array |
| transaction | Transaction | references the Transaction entity |
| timestamp | BigInt | time the transaction occurred |
| pair | Pair | references the pair transaction |
| sender | Bytes | address initiating the swapping |
| amount0In | BigDecimal | amount of token0 provided |
| amount1In | BigDecimal | amount of token1 provided |
| amount0Out | BigDecimal | amount of token0 gotten |
| amount1Out | BigDecimal | amount of token1 gotten |
| to | Bytes | recipient address |
| logIndex | BigInt | index gotten when the transaction event is emitted |
| amountUSD | BigDecimal | amount of all provided tokens calculated in USD |
