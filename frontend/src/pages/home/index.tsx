import { useNavigate } from "react-router-dom";
import { MethodsBase, IPortkeyProvider } from "@portkey/provider-types";

import "./home.scss";
import { NFT_IMAGES } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import useNFTSmartContract from "@/hooks/useNFTSmartContract";
import { useEffect, useState } from "react";

const HomePage = ({
  provider,
  currentWalletAddress,
}: {
  provider: IPortkeyProvider | null;
  currentWalletAddress?: string;
}) => {
  const navigate = useNavigate();
  const nftContract = useNFTSmartContract(provider);
  const [userNfts, setUserNfts] = useState<any[]>([]);

  useEffect(() => {
    // Step G - Use Effect to Fetch Proposals
    const fetchNftDetails = async () => {
      try {
        const accounts = await provider?.request({
          method: MethodsBase.ACCOUNTS,
        });

        if (!accounts) throw new Error("No accounts");

        const account = accounts?.tDVW?.[0];

        if (!account) throw new Error("No account");

        // const nftResponse = await nftContract?.callViewMethod(
        //   "GetNativeTokenInfo",
        //   account
        // );
        // console.log("nftResponse", nftResponse);

        // if (nftResponse && nftResponse.data && nftResponse.data.length > 0) {
        //   setUserNfts(nftResponse.data);
        // }
        // setProposals(proposalResponse?.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNftDetails();
  }, []);
  return (
    <div className="home-container">
      <div className="marketplace-info">
        <h1>NFTs</h1>
        <h3>Create and Transfer Non-Fungible Tokens with AELF</h3>
      </div>
      <div className="nft-collection-container">
        <div className="nft-collection-head">
          <h2>Your NFT Collections</h2>
          <Button
            className="header-button"
            onClick={() =>
              currentWalletAddress
                ? navigate("/create-nft")
                : alert("Please Connect Wallet First")
            }
          >
            Create NFT Collection
          </Button>
        </div>

        {currentWalletAddress ? (
          <div className="nft-collection">
            {NFT_IMAGES.slice(0, 5).map((image, index) => (
              <div className="nft-card" key={index}>
                <img src={image} alt={"nft- image" + index} />
                <div className="nft-info"></div>
                <div className="buy-container">
                  <Button
                    onClick={() => navigate(`/transfer-nft?nft-id=${index}`)}
                  >
                    Transfer NFT
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bordered-container">
            <strong>
              Please connect your Portkey Wallet and Create a new NFT Collection and
              NFT Tokens
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
