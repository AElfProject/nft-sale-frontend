using AElf.Contracts.MultiToken;
using AElf.Sdk.CSharp;
using AElf.Types;
using Google.Protobuf.WellKnownTypes;

namespace AElf.Contracts.nft_contract
{
    // Contract class must inherit the base class generated from the proto file
    public class nft_contract : nft_contractContainer.nft_contractBase
    {
        private const string TokenContractAddress = "ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx"; // tDVW token contract address

        public override Empty Initialize(Empty input)
        {
            Assert(State.Initialized.Value == false, "Already initialized.");
            State.Initialized.Value = true;
            State.Owner.Value = Context.Sender;
            State.TokenContract.Value = Address.FromBase58(TokenContractAddress);

            return new Empty();
        }

        public override Int64Value CreateNFTToken(CreateNFTTokenInput input)
        {
            // Increment the token counter
            State.TokenCounter.Value += 1;
            var tokenId = State.TokenCounter.Value;

            // Create the new NFT token
            State.NFTTokens[tokenId] = new NFTToken
            {
                Name = input.Name,
                Symbol = input.Symbol,
                Owner = Context.Sender
            };

            // Fire an event for the creation of the NFT token
            Context.Fire(new NFTCreated { NftId = tokenId });

            return new Int64Value { Value = tokenId };
        }

        public override Empty TransferNFT(TransferNFTInput input)
        {
            var nft = State.NFTTokens[input.TokenId];
            Assert(nft != null, "Token does not exist.");
            Assert(nft.Owner == Context.Sender, "Not the owner.");
            nft.Owner = input.To;
            State.NFTTokens[input.TokenId] = nft;
            Context.Fire(new NFTTransferred { TokenId = input.TokenId, From = Context.Sender, To = input.To });
            return new Empty();
        }

        public override Empty BurnNFT(Int64Value input)
        {
            var nft = State.NFTTokens[input.Value];
            Assert(nft != null, "Token does not exist.");
            Assert(nft.Owner == Context.Sender, "Not the owner.");
            State.NFTTokens.Remove(input.Value);
            Context.Fire(new NFTBurned { TokenId = input.Value, Owner = Context.Sender });
            return new Empty();
        }

        public override NFTDetails GetNFTDetails(Int64Value input)
        {
            var nft = State.NFTTokens[input.Value];
            Assert(nft != null, "Token does not exist.");
            return new NFTDetails
            {
                TokenId = input.Value,
                Name = nft.Name,
                Symbol = nft.Symbol,
                Owner = nft.Owner
            };
        }

        public override Int64Value GetNFTBalance(Address input)
        {
            return State.NFTBalances[input] ?? new Int64Value { Value = 0 };
        }

        public override StringValue GetOwner(Int64Value input)
        {
            var nft = State.NFTTokens[input.Value];
            Assert(nft != null, "Token does not exist.");
            return new StringValue { Value = nft.Owner.ToString() };
        }
    }
}
