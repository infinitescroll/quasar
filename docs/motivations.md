# Motivations

Referencing IPFS content from smart contract event logs is a popular pattern we've seen implemented across ethereum applications. In order for this to architecture to work, applications must ensure the IPFS content is available to those who request it.

The obvious solution is to host an IPFS node that acts as a "pinning node" to ensure content is readily available. This solution works, but it doesn't account for _who_ can pin to this node.

| **Strategy** | **Pros** | **Cons** |
|-------------------------------------|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| A public pinning node | Do not have to worry about managing permissions. | Legal and economic implications if people pin large amounts of data to the node or illegal content. |
| A private (permissioned) pinning node | Avoid legal and economic risks. | Managing API keys. Will not work for sites that do not require a "log in" functionality (like an Aragon DAO). |
| **A smart contract based pinning node** | Flexible permission systems. No management of API keys. | A lot of boilerplate. |

Using smart contracts to determine who can pin data, or what data can get pinned, allows any smart contract developer to create their own pinning permissions. For example, anyone could easily build a permission system that permits holders of your token to pin to your IPFS node. This isn't possible with traditional metohds.

The second motivation behind Quasar is to enable smart contracts themselves to pin data. Obviously smart contracts running in the EVM cannot make requests to an IPFS node. This is an especially handy use case when running a DAO if, for example, you'd like your DAO to pin the results of a monthly reoccuring vote.

## Future

We can imagine a future where Quasar is used to help IPFS node providers accept and validate pin requests in ETH or any ERC20 token - a system that would work similarly to Filecoin without requiring use of a new, non-native token. This would be relatively easy to build with the infrastructure found inside this repo.
