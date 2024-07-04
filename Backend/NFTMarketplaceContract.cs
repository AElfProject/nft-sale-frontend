using System.Linq;
using AElf.CSharp.Core;
using AElf.Sdk.CSharp;
using AElf.Types;
using Google.Protobuf.WellKnownTypes;

namespace AElf.Contracts.NFTMarketplace
{
    public class NFTMarketplaceContract : NFTMarketplaceContractContainer.NFTMarketplaceContractBase
    {
        public override Empty Initialize(Empty input)
        {
            Assert(!State.Initialized.Value, "Already initialized.");

            State.NFTCounter.Value = 0;
            State.Initialized.Value = true;

            return new Empty();
        }

        public override Empty CreateNFT(CreateNFTInput input)
        {
            var nftId = State.NFTCounter.Value;
            State.NFTCounter.Value++;

            var nft = new NFT
            {
                Id = nftId,
                Creator = Context.Sender,
                Owner = Context.Sender,
                Name = input.Name,
                Description = input.Description,
                Price = input.Price,
                OnSale = true
            };

            State.NFTs[nftId] = nft;
            var ownerNFTs = State.NFTsByOwner[Context.Sender] ?? new List<long>();
            ownerNFTs.Add(nftId);
            State.NFTsByOwner[Context.Sender] = ownerNFTs;

            return new Empty();
        }

        public override Empty BuyNFT(BuyNFTInput input)
        {
            var nft = State.NFTs[input.NftId];
            Assert(nft.OnSale, "NFT is not for sale.");
            Assert(Context.Sender != nft.Owner, "Cannot buy your own NFT.");
            Assert(Context.TransactionContext.Transaction.To.Value == nft.Price.Value, "Incorrect price sent.");

            // Transfer funds
            var transferResult = Context.SendInline(Context.Sender, Context.TransactionContext.Transaction.To.Value, nft.Price);
            Assert(transferResult.Status == TransactionResultStatus.Mined, "Transfer failed.");

            // Transfer ownership
            var ownerNFTs = State.NFTsByOwner[nft.Owner];
            ownerNFTs.Remove(input.NftId);
            State.NFTsByOwner[nft.Owner] = ownerNFTs;

            nft.Owner = Context.Sender;
            nft.OnSale = false;
            State.NFTs[input.NftId] = nft;

            var newOwnerNFTs = State.NFTsByOwner[Context.Sender] ?? new List<long>();
            newOwnerNFTs.Add(input.NftId);
            State.NFTsByOwner[Context.Sender] = newOwnerNFTs;

            return new Empty();
        }

        public override NFTList GetListOfNFTsOnSale(Empty input)
        {
            var nftList = new NFTList();
            foreach (var nft in State.NFTs)
            {
                if (nft.Value.OnSale)
                {
                    nftList.Nfts.Add(nft.Value);
                }
            }
            return nftList;
        }

        public override NFTList GetListOfAllNFTs(Empty input)
        {
            var nftList = new NFTList();
            foreach (var nft in State.NFTs)
            {
                nftList.Nfts.Add(nft.Value);
            }
            return nftList;
        }

        public override NFTList GetListOfNFTOfAnAddress(Address input)
        {
            var nftList = new NFTList();
            var ownerNFTs = State.NFTsByOwner[input] ?? new List<long>();
            foreach (var nftId in ownerNFTs)
            {
                nftList.Nfts.Add(State.NFTs[nftId]);
            }
            return nftList;
        }

        public override NFT GetDetailsOfAnNFT(Int64Value input)
        {
            return State.NFTs[input.Value];
        }
    }
}
