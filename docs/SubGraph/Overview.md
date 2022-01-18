We do not want you having to run back and forth to the blockchain or interacting with the smart contract every time you need to find data from the Hodlvalley ecosystem. Therefore; we abstracted it, ensuring ease. The Hodlvalley subgraph provides you with public graphql APIs containing indexed and cached data running on the graph's protocol.

The Hodlvalley subgraph API returns data pertaining to the decentralized exchange, staking, farming, and data regarding what is stored in the reserve smart contract. The data is collected over time and is updated when a transaction takes place on Hodlvalley.


## Querying the Subgraph:

This tutorial will show the basics needed to query the Hodlvalley subgraph API for the data you want. An advantage of the subgraph API is that you can query the API for the exact data you need.

If you already understand how to query the subgraph API but need to do extra tasks like ordering, filtering, sorting etc., we advise you to skip to the bottom and follow the link below.

### Basics of querying the subgraph:

- Know your entities: Entities represent a model showing how data are organized and the relationship between them.

- Each entity contains a set of fields that store information about the entity and its value type.

With the aforementioned info in handquery the subgraph by doing the following: 

- start with an opening and closing brackets
```gql
    {}
```

- Open the curly brackets and type in the name of the entity you wish to query. For this example we will use the entity “pairs”.
```gql
    {
        pairs
    }
```

- Then, with another opening and closing brackets within it, we type in the name of the fields we are querying for. One field per line
```gql
    {
        pairs {
            id
            txCount
        }
    }
```

- If a field is a reference to an entity then we can have another set of opening and closing brackets and input the fields needed, as mentioned, within the opening and closing brackets. Note that `token0` references the `Token` entity.
```gql
    {
        pairs {
            id
            txCount
            token0 {
                id
            }
        }
    }
```

Finally, as mentioned above if you want to do more,  such as sorting, filtering, ordering etc., then follow the link to the graph protocol documentation [here](https://thegraph.com/docs/developer/graphql-api)
