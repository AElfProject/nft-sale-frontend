import { useNavigate } from "react-router-dom";
import { MethodsBase, IPortkeyProvider } from "@portkey/provider-types";

import "./home.scss";
import { NFT_IMAGES } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import useNFTSmartContract from "@/hooks/useNFTSmartContract";
import { useEffect, useState } from "react";

const HomePage = ({ provider }: { provider: IPortkeyProvider | null }) => {
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

        const nftResponse = await nftContract?.callViewMethod(
          "GetNFTBalance",
          account
        );

        if (nftResponse && nftResponse.data && nftResponse.data.length > 0) {
          setUserNfts(nftResponse.data);
        }
        // setProposals(proposalResponse?.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNftDetails();
  }, []);
  return (
    <div className="home-container">
      <div className="dashboard-container container">
        <div className="dashboard-card">
          <h3>Total Available NFT</h3>
          <p>5 NFTs</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Transfer NFT</h3>
          <p>2 NFTs</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Received NFT</h3>
          <p>3 NFTs</p>
        </div>
      </div>
      <div className="nft-collection-container">
        <div className="nft-collection-head">
          <h2>Your NFT Collection</h2>
          <Button
            className="header-button"
            onClick={() => navigate("/create-nft")}
          >
            Create NFT
          </Button>
        </div>

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
      </div>
    </div>
  );
};

export default HomePage;
