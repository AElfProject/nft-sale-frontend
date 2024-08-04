import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IPortkeyProvider } from "@portkey/provider-types";
import { toast } from "react-toastify";

import { eForestNftHoldApi, NFT_IMAGES } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import useNFTSmartContract from "@/hooks/useNFTSmartContract";
import "./home.scss";

interface Nft {
  nftSymbol: string;
  balance?: number; // Adding an optional balance property for clarity
}

const HomePage = ({
  provider,
  currentWalletAddress,
}: {
  provider: IPortkeyProvider | null;
  currentWalletAddress?: string;
}) => {
  const navigate = useNavigate();
  const [userNfts, setUserNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { sideChainSmartContract } = useNFTSmartContract(provider);

  // Function to get the balance of a specific NFT
  const getBalanceOfNft = async (values: {
    symbol: string;
    owner: string;
  }): Promise<number> => {
    // @ts-ignore
    const { data }: { data: { balance: number } } =
      await sideChainSmartContract?.callViewMethod("getBalance", values);
    return data.balance;
  };

  // Function to fetch balance information for an array of NFTs
  const fetchNftBalances = async (
    nfts: Nft[],
    ownerAddress: string
  ): Promise<Nft[]> => {
    const nftDataWithBalances = await Promise.all(
      nfts.map(async (nft) => {
        const balance = await getBalanceOfNft({
          symbol: nft.nftSymbol,
          owner: ownerAddress,
        });
        return { ...nft, balance };
      })
    );

    return nftDataWithBalances;
  };

  const fetchNftDetails = async () => {
    try {
      const response = await fetch(eForestNftHoldApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ChainList: ["tDVV"],
          hasListingFlag: false,
          hasAuctionFlag: false,
          hasOfferFlag: false,
          collectionIds: [],
          address: currentWalletAddress,
          sorting: "ListingTime DESC",
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();

      const newNftData = await fetchNftBalances(
        responseData.data.items,
        currentWalletAddress as string
      );

      setUserNfts(newNftData.reverse());
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Step G - Use Effect to Fetch Proposals
    if (currentWalletAddress && sideChainSmartContract) {
      fetchNftDetails();
    }
  }, [currentWalletAddress, sideChainSmartContract]);
  return (
    <div className="home-container">
      <div className="marketplace-info">
        <h1>NFTs</h1>
        <h3>Create and Transfer Non-Fungible Tokens with AELF</h3>
      </div>
      <div className="nft-collection-container">
        <div className="nft-collection-head">
          <h2>Your NFT Tokens</h2>
          <div className="button-wrapper">
            <Button
              className="header-button"
              disabled={!!(userNfts.length === 0)}
              onClick={() => navigate(`/create-nft?nft-create=true`)}
            >
              Create NFT
            </Button>
            <Button
              className="header-button"
              onClick={() =>
                currentWalletAddress
                  ? navigate("/create-nft")
                  : toast.warning("Please Connect Wallet First")
              }
            >
              Create NFT Collection
            </Button>
          </div>
        </div>

        {currentWalletAddress ? (
          <div className="nft-collection">
            {userNfts.length > 0 ? (
              userNfts.slice(0, 5).map((data, index) => (
                <div
                  className={
                    userNfts.length > 3 ? "nft-card around" : "nft-card"
                  }
                  key={index}
                >
                  <img src={NFT_IMAGES[index + 1]} alt={"nft- image" + index} />
                  <div className="nft-info">
                    <p>{data.nftSymbol}</p>
                  </div>

                  <div className="nft-info-row">
                    <span>Name:</span>
                    <span>{data.tokenName}</span>
                  </div>

                  <div className="nft-info-row">
                    <span>Collection Symbol:</span>
                    <span>{data.collectionSymbol}</span>
                  </div>

                  <div className="nft-info-row">
                    <span>Balance:</span>
                    <span>{data.balance}</span>
                  </div>

                  <div className="nft-info-row">
                    <span>Owner:</span>
                    <span>{data.realOwner.address}</span>
                  </div>

                  <div className="buy-container">
                    <Button
                      onClick={() =>
                        navigate(
                          `/transfer-nft?nft-index=${index + 1}&nft-symbol=${
                            data.nftSymbol
                          }`
                        )
                      }
                    >
                      Transfer NFT
                    </Button>
                  </div>
                </div>
              ))
            ) : loading ? (
              <div className="bordered-container">
                <strong>Loading...</strong>
              </div>
            ) : (
              <div className="bordered-container">
                <strong>
                  It's Look like you don't have any NFT on your wallet
                </strong>
              </div>
            )}
          </div>
        ) : (
          <div className="bordered-container">
            <strong>
              Please connect your Portkey Wallet and Create a new NFT Collection
              and NFT Tokens
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
