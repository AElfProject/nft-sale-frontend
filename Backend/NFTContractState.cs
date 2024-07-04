using System.Collections.Generic;
using AElf.Sdk.CSharp.State;
using AElf.Types;

namespace AElf.Contracts.NFTMarketplace
{
    // The state class to access the blockchain state
    public class NFTMarketplaceState : ContractState
    {
        public BoolState Initialized { get; set; }
        public MappedState<long, NFT> NFTs { get; set; }
        public MappedState<Address, List<long>> NFTsByOwner { get; set; }
        public Int64State NFTCounter { get; set; }
    }
}
