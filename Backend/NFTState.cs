using AElf.Sdk.CSharp.State;
using AElf.Types;
using Google.Protobuf.WellKnownTypes;

namespace AElf.Contracts.nft_contract
{
    // The state class is access the blockchain state
    public partial class nft_contractState : ContractState
    {
        public BoolState Initialized { get; set; }
        public SingletonState<Address> Owner { get; set; }
        public MappedState<long, NFTToken> NFTTokens { get; set; }
        public MappedState<Address, Int64Value> NFTBalances { get; set; }
        public Int64State TokenCounter { get; set; }
    }
    public class NFTToken
    {
        public string Name { get; set; }
        public string Symbol { get; set; }
        public Address Owner { get; set; }
    }
}
