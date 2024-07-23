using AElf.Contracts.Consensus.AEDPoS;
using AElf.Contracts.MultiToken;

namespace AElf.Contracts.nft_contract
{
    public partial class nft_contractState
    {
        internal TokenContractContainer.TokenContractReferenceState TokenContract { get; set; }
        internal AEDPoSContractContainer.AEDPoSContractReferenceState ConsensusContract { get; set; }
    }
}