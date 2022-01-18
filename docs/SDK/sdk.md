# HodlValley SDK

This SDK gives you the ability to build applications on the hodlvalley platform.
It runs anywhere a javascript application can run.

## Installation
To install the SDK you can either use `npm` or `yarn`. To install simply run
```bash
yarn add @hodlvalley/sdk
```
Or 

```bash
npm install @hodlvalley/sdk
```

## Usage
After installation you need to use the SDk in your code. This can be done using the import statement of the ES6 syntax

```javascript
import { FACTORY_ADDRESS } from "@hodlvalley/sdk";

console.log(`This is the address of the factory contract on the Ropsten network: ${FACTORY_ADDRESS[3]}`);

// This is the address of the factory contract on the Ropsten network: 0x96F3aD81A8F1C688465F4818feEc33e483f821AE
```

## ABI (Application Binary Interface)

The ABIs for each contract is currently available in the `src` folder of the SDK and can be copied from there.

## ChainId
Returns the chain id of a network.

```javascript
import { ChainId } from "@hodlvalley/sdk";
  
console.log(`This is the chain id for mainnet: ${ChainId.MAINNET}`);

// This is the chain id for mainnet network: 1
```

## Address

The address for various smart contracts can be fetched from the SDk using the chainId as a key to specify the network. The address of a contract can be imported by first typing the name of the contract in uppercase letters and suffixing it with an `_ADDRESS`.

```javascript
import { MONEY_ADDRESS, ChainId } from "@hodlvalley/sdk";

console.log(MONEY_ADDRESS[ChainId.ROPSTEN]);

// 0xD224DC5E2005c315A944a4f9635dbecC4FE2C451
```

## Token
### Wrapped Tokens

The ERC-20 representation of a native token at a specific address on a specific chain. Known as a wrapped token. It instantiates the Token class.

#### Fetching the address of a WETH on ropsten.
```javascript
import { ChainId, WETH9 } from "@hodlvalley/sdk";

const address = WETH9[ChainId.MAINNET].address;

console.log(`The address of Wrapped Ether on the mainnet: ${address}`);

// Or

import { ChainId, WETH_ADDRESS } from "@hodlvalley/sdk";

const address = WETH_ADDRESS[ChainId.ROPSTEN];

console.log(`The address of Wrapped Ether on the mainnet: ${address}`);
```

#### create an ERC-20 representation of a native token at a specific address on a specific chain.

```javascript
// new Token(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string): Token

import { ChainId, Token } from "@hodlvalley/sdk";

const weth = new Token(
    ChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
)
const name = weth.name;

console.log(`The name of the token on the Ethereum mainnet: ${name}`);
```

#### check if a token is equal to another by ChainId and address

```javascript
import { ChainId, Token, WETH9 } from "@hodlvalley/sdk";

const weth = new Token(
    ChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
)

const WETH = WETH9[ChainId.MAINNET];

const isEqual = weth.equals(WETH);

console.log(isEqual);
//   true
```

## Pairs

Representation of a hodlvalley pair with data on each pair token

### Getting the address of a Pair.
The Pair class has a static method that accepts a pair of Token class instances and returns its would be pair address.

```javascript
import { ChainId, Token, Pair } from "@hodlvalley/sdk";

const token0 = new Token(
    ChainId.ROPSTEN,
    '0xD224DC5E2005c315A944a4f9635dbecC4FE2C451',
    18,
    'MONEY',
    'Money'
)

const token1 = new Token(
    ChainId.ROPSTEN,
    '0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1',
    18,
    'COIN',
    'Coin'
)

const address = Pair.getAddress(token0, token1);
console.log(address);

// 0x13F9A850188e04B5be5814DD88164CDd1dd40aE8
```

### Creating an instance of a Pair

To create an instance of a Pair a user has to first take an instance of a token and create an instance of a CurrencyAmount with the quantity of the token in the Pair. Then take the created CurrencyAmount class and pass as a parameter into the Pair class we are instantiating.

```javascript
import { ChainId, Token, CurrencyAmount, Pair } from "@hodlvalley/sdk";

const token0 = new Token(
    ChainId.ROPSTEN,
    '0xD224DC5E2005c315A944a4f9635dbecC4FE2C451',
    18,
    'MONEY',
    'Money'
)

const token1 = new Token(
    ChainId.ROPSTEN,
    '0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1',
    18,
    'COIN',
    'Coin'
)

const currency0 = new CurrencyAmount(token0, 1000);
const currency1 = new CurrencyAmount(token1, 2000);

const pair = new Pair(currency0, currency1);
```

After creating an instance of a Pair more methods can be called on a pair to return other necessary data.

### involvesToken

Takes an instance of a token and finds out if it is in the pair. Returns a boolean.

```javascript
const pair = new Pair(currency0, currency1);

pair.involvesToken(token)
```

### token0Price
Returns the price of token0 in the pair based on the ratio between reserve1 and reserve0

```javascript
const pair = new Pair(currency0, currency1);

pair.token0price
```

### token1Price
Returns the price of token1 in the pair based on the ratio between reserve0 and reserve1

```javascript
const pair = new Pair(currency0, currency1);

pair.token1price
```

### getOutputAmount
Accepts an instance of a CurrencyAmount and outputs the maximum amount of tokens to be outputted based on current reserves and the Pair that is sure to exist if the trade is executed.

```javascript
const token2 = new Token(
    ChainId.ROPSTEN,
    '0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1',
    18,
    'COIN',
    'Coin'
)

const pair = new Pair(currency0, currency1);

const currency2 = new CurrencyAmount(token2, 2000000);

pair.getOutputAmount(currency2);
```

### getInputAmount
Accepts an instance of a CurrencyAmount and outputs the minimum amount of tokens to be inputted based on current reserves and the Pair that is sure to exist if the trade is executed.

```javascript
const token2 = new Token(
    ChainId.ROPSTEN,
    '0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1',
    18,
    'COIN',
    'Coin'
)

const pair = new Pair(currency0, currency1);

const currency2 = new CurrencyAmount(token2, 2000000);

pair.getInputAmount(currency2);
```

## Route

The Router smart contract allows for the swapping along a path specified. If the specified path does not exist, it looks for another path.

The Route class accepts one or more uniswap pairs with a specified input token and output token during initialisation. The input token and output token also exist in the pair. 

```javascript
import { ChainId, Token, CurrencyAmount, Pair, Route } from "@hodlvalley/sdk";

const token0 = new Token(
    ChainId.ROPSTEN,
    '0xD224DC5E2005c315A944a4f9635dbecC4FE2C451',
    18,
    'MONEY',
    'Money'
)

const token1 = new Token(
    ChainId.ROPSTEN,
    '0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1',
    18,
    'COIN',
    'Coin'
)

const currency0 = new CurrencyAmount(token0, 1000000000);
const currency1 = new CurrencyAmount(token1, 2000000000);

const pair = new Pair(currency0, currency1);
const pairs = [pair]

const route = new Route(pairs, token0, token1)
```
### Getting the full path from input to output token
Call the path property on the instance of the route. It returns an array of the instance of the tokens making the path.
```javascript
route.path

// [
//     {
//         "chainId":3,
//         "decimals":18,
//         "symbol":"MONEY",
//         "name":"Money",
//         "isNative":false,
//         "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//     },
//     {
//         "chainId":3,
//         "decimals":18,
//         "symbol":"COIN",
//         "name":"Coin",
//         "isNative":false,
//         "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//     }
// ]
```

### Getting the ordered pairs tha make up the route
Call the pair property on the instance of the route. Returns an array of the Pairs.
```javascript
route.pairs

// [
//     {
//         "liquidityToken":{
//             "chainId":3,
//             "decimals":18,
//             "symbol":"UNI-V2",
//             "name":"Uniswap V2",
//             "isNative":false,
//             "isToken":true,"address":"0x13F9A850188e04B5be5814DD88164CDd1dd40aE8"
//         },
//         "tokenAmounts":[
//             {
//                 "numerator":[926258176,1],
//                 "denominator":[1],
//                 "currency":{
//                     "chainId":3,
//                     "decimals":18,
//                     "symbol":"COIN",
//                     "name":"Coin",
//                     "isNative":false,
//                     "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//                 },
//                 "decimalScale":[660865024,931322574]
//             },
//             {
//                 "numerator":[1000000000],
//                 "denominator":[1],
//                 "currency":{
//                     "chainId":3,
//                     "decimals":18,
//                     "symbol":"MONEY",
//                     "name":"Money",
//                     "isNative":false,
//                     "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//                 },
//                 "decimalScale":[660865024,931322574]
//             }
//         ]
//     }
// ]
```

### Getting the input token
Call the input property, to return the input token.
```javascript
route.input

// {
//     address: "0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//     chainId: 3
//     decimals: 18
//     isNative: false
//     isToken: true
//     name: "Money"
//     symbol: "MONEY"
// }
```

### Getting the output token
Call the output property, to return the output token.
```javascript
route.output

// {
//     address: "0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//     chainId: 3
//     decimals: 18
//     isNative: false
//     isToken: true
//     name: "Coin"
//     symbol: "COIN"
// }
``` 

### Getting the mid price along the route
The `midPrice` method returns the current mid price along the route as an instance of the price object.
```javascript
route.midPrice

// {
//     "numerator":[926258176,1],
//     "denominator":[1000000000],
//     "baseCurrency":{
//         "chainId":3,
//         "decimals":18,
//         "symbol":"MONEY",
//         "name":"Money",
//         "isNative":false,
//         "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//     },
//     "quoteCurrency":{
//         "chainId":3,
//         "decimals":18,
//         "symbol":"COIN",
//         "name":"Coin",
//         "isNative":false,
//         "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//     },
//     "scalar":{
//         "numerator":[660865024,931322574],
//         "denominator":[660865024,931322574]
//     }
// }
```

### Getting the chainId of the route instance.
This returns a number specifying the chainId.
```javascript
route.chainId

// 3
```

## JSBI
Enables the conversion of javascript numbers to BigInt. Helps with arithmetic computations and logical operations on BigInt.

```javascript
import { JSBI } from "jsbi"

// converting a number to BigInt and outputting
console.log(JSBI.BigInt('2'))

// [2, sign: false]
```
## BigintIsh
A type that is use to ensure a value is an instance of JSBI, BigInt, or string.

```javascript
import { BigintIsh } from "@hodlvalley/sdk";

// type BigintIsh = string | number | JSBI
```

## Percent

The percent class inherits from the Fraction class. It creates a percent instance needed for use as slippage tolerance value.

```javascript
import { Percent } from "@hodlvalley/sdk";

new Percent(60, 100)
```

## Trade
The trade class returns information about a particular trade in a route

## TradeType
This is an enum that contains the various types of trades available on the system.

The trade types it contains are:
- `EXACT_INPUT` which returns zero(0)
- `EXACT_OUTPUT` which returns one(1)

## exactIn
Giving an instance of a Route class, containing the input token and the output token and an instance currencyAmount class for the input token and the exact number of tokens. This method returns the trades between the input and output token.
```javascript
import { ChainId, Token, CurrencyAmount, Pair, Route, Trade } from "@hodlvalley/sdk";

const token0 = new Token(
    ChainId.ROPSTEN,
    '0xD224DC5E2005c315A944a4f9635dbecC4FE2C451',
    18,
    'MONEY',
    'Money'
)

const token1 = new Token(
    ChainId.ROPSTEN,
    '0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1',
    18,
    'COIN',
    'Coin'
)

const currency0 = new CurrencyAmount(token0, 1000000000);
const currency1 = new CurrencyAmount(token1, 2000000000);

const pair = new Pair(currency0, currency1);
const pairs = [pair]

const route = new Route(pairs, token0, token1)

const trade = Trade.exactIn(route, new CurrencyAmount(token0, 10000000))

// {
//     "route":{
//         "_midPrice":{
//             "numerator":[926258176,1],
//             "denominator":[1000000000],
//             "baseCurrency":{
//                 "chainId":3,
//                 "decimals":18,
//                 "symbol":"MONEY",
//                 "name":"Money",
//                 "isNative":false,
//                 "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"},"quoteCurrency":{
//                     "chainId":3,
//                     "decimals":18,
//                     "symbol":"COIN",
//                     "name":"Coin",
//                     "isNative":false,
//                     "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//                 },
//                 "scalar":{
//                     "numerator":[660865024,931322574],
//                     "denominator":[660865024,931322574]}},
//                     "pairs":[{
//                         "liquidityToken":{
//                             "chainId":3,
//                             "decimals":18,
//                             "symbol":"UNI-V2",
//                             "name":"Uniswap V2",
//                             "isNative":false,
//                             "isToken":true,"address":"0x13F9A850188e04B5be5814DD88164CDd1dd40aE8"
//                         },
//                         "tokenAmounts":[{
//                             "numerator":[926258176,1],
//                             "denominator":[1],
//                             "currency":{
//                                 "chainId":3,
//                                 "decimals":18,
//                                 "symbol":"COIN",
//                                 "name":"Coin",
//                                 "isNative":false,
//                                 "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//                             },
//                             "decimalScale":[660865024,931322574]
//                         },
//                         {
//                             "numerator":[1000000000],
//                             "denominator":[1],
//                             "currency":{
//                                 "chainId":3,
//                                 "decimals":18,
//                                 "symbol":"MONEY",
//                                 "name":"Money",
//                                 "isNative":false,
//                                 "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//                             },
//                             "decimalScale":[660865024,931322574]
//                         }]
//                     }],
//                     "path":[
//                         {
//                             "chainId":3,
//                             "decimals":18,
//                             "symbol":"MONEY",
//                             "name":"Money",
//                             "isNative":false,
//                             "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//                         },
//                         {
//                             "chainId":3,
//                             "decimals":18,
//                             "symbol":"COIN",
//                             "name":"Coin",
//                             "isNative":false,
//                             "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//                         }
//                     ],
//                     "input":{
//                         "chainId":3,
//                         "decimals":18,
//                         "symbol":"MONEY",
//                         "name":"Money",
//                         "isNative":false,
//                         "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//                     },
//                     "output":{
//                         "chainId":3,
//                         "decimals":18,
//                         "symbol":"COIN",
//                         "name":"Coin",
//                         "isNative":false,
//                         "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//                     }
//                 },
//                 "tradeType":0,
//                 "inputAmount":{
//                     "numerator":[10000000],
//                     "denominator":[1],
//                     "currency":{
//                         "chainId":3,
//                         "decimals":18,
//                         "symbol":"MONEY",
//                         "name":"Money",
//                         "isNative":false,
//                         "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//                     },
//                     "decimalScale":[660865024,931322574]
//                 },
//                 "outputAmount":{
//                     "numerator":[19743160],
//                     "denominator":[1],
//                     "currency":{
//                         "chainId":3,
//                         "decimals":18,
//                         "symbol":"COIN",
//                         "name":"Coin",
//                         "isNative":false,
//                         "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//                     },
//                     "decimalScale":[660865024,931322574]
//                 },
//                 "executionPrice":{
//                     "numerator":[19743160],
//                     "denominator":[10000000],
//                     "baseCurrency":{
//                         "chainId":3,
//                         "decimals":18,
//                         "symbol":"MONEY",
//                         "name":"Money",
//                         "isNative":false,
//                         "isToken":true,"address":"0xD224DC5E2005c315A944a4f9635dbecC4FE2C451"
//                     },
//                     "quoteCurrency":{
//                         "chainId":3,
//                         "decimals":18,
//                         "symbol":"COIN",
//                         "name":"Coin",
//                         "isNative":false,
//                         "isToken":true,"address":"0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1"
//                     },
//                     "scalar":{
//                         "numerator":[660865024,931322574],
//                         "denominator":[660865024,931322574]
//                     }
//                 },
//                 "priceImpact":{
//                     "numerator":[538968064,202706287,222773],"denominator":[335544320,815794754,17347234],"isPercent":true
//                 }
//             }
//         }
//     }
// }                   
```

## exactOut
Giving an instance of a Route class, containing the input token and the output token and an instance currencyAmount class for the output token and the exact number of tokens. This method returns the trades between the input and output token.

```javascript
import { ChainId, Token, CurrencyAmount, Pair, Route, Trade } from "@hodlvalley/sdk";

const token0 = new Token(
    ChainId.ROPSTEN,
    '0xD224DC5E2005c315A944a4f9635dbecC4FE2C451',
    18,
    'MONEY',
    'Money'
)

const token1 = new Token(
    ChainId.ROPSTEN,
    '0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1',
    18,
    'COIN',
    'Coin'
)

const currency0 = new CurrencyAmount(token0, 1000000000);
const currency1 = new CurrencyAmount(token1, 2000000000);

const pair = new Pair(currency0, currency1);
const pairs = [pair]

const route = new Route(pairs, token0, token1)

const trade = Trade.exactIn(route, new CurrencyAmount(token1, 10000000))

//  Results are similar to the one above.
```

## Getting the minimum amount that must be received for a specific slippage tolerance.

Returns an instance of a CurrencyAmount class.
Uses the `minimumAmountOut` method.
Accepts the slippage tolerance as a parameter.

```javascript
import { ChainId, Token, CurrencyAmount, Pair, Percent, Route, Trade, TradeType } from "@hodlvalley/sdk";

const token0 = new Token(
    ChainId.ROPSTEN,
    '0xD224DC5E2005c315A944a4f9635dbecC4FE2C451',
    18,
    'MONEY',
    'Money'
)

const token1 = new Token(
    ChainId.ROPSTEN,
    '0x212e4Ff4f9003eF018632A288cbF4Bb92962B3B1',
    18,
    'COIN',
    'Coin'
)

const currency0 = new CurrencyAmount(token0, 1000000000);
const currency1 = new CurrencyAmount(token1, 2000000000);

const currency2 = new CurrencyAmount(token1, 2000000);

const pair = new Pair(currency0, currency1);
const pairs = [pair]

const route = new Route(pairs, token0, token1)

const trade = new Trade(route, currency2, TradeType.EXACT_OUTPUT);

trade.minimumAmountOut(new Percent(60, 100))
```

### Getting the maximum amount of input tokens that must be spent on the trade for the specified slippage tolerance.

Returns an instance of a CurrencyAmount class.
Uses the `maximumAmountIn` method.
Accepts the slippage tolerance as a parameter.

```javascript

trade.maximumAmountIn(new Percent(60, 100))
```

### Getting the worse execution price after accounting for slippage

Returns an instance of the Price class.
Uses the `worstExecutionPrice` method.
Accepts the slippage tolerance as a parameter.

```javascript

trade.worstExecutionPrice(new Percent(60, 100))
```

## Errors

### InsufficientReservesError

Use to show that the desired amount of output token is not available in the Pair
```javascript
import { InsufficientReservesError } from "@hodlvalley/sdk";
```

### InsufficientInputAmountError

Use to show that the amount of input token sent is not sufficient to purchase any unit of output token.

```javascript
import { InsufficientInputAmountError } from "@hodlvalley/sdk";
```