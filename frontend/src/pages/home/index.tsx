import { useNavigate } from "react-router-dom";
import "./home.scss";
import { NFT_IMAGES } from "@/lib/constant";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  // const voteYes = async (index: number) => {
  //   //Step F - Write Vote Yes Logic
  // };

  // const voteNo = async (index: number) => {
  //   try {
  //     const accounts = await provider?.request({
  //       method: MethodsBase.ACCOUNTS,
  //     });

  //     if (!accounts) throw new Error("No accounts");

  //     const account = accounts?.tDVW?.[0];

  //     if (!account) throw new Error("No account");

  //     const createVoteInput: IVoteInput = {
  //       voter: account,
  //       proposalId: index,
  //       vote: false,
  //     };

  //     await nftContract?.callSendMethod(
  //       "VoteOnProposal",
  //       account,
  //       createVoteInput
  //     );
  //     alert("Voted on Proposal");
  //     setHasVoted(true);
  //   } catch (error) {
  //     console.error(error, "=====error");
  //   }
  // };

  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* <div className="marketplace-info container">
        <div className="left-aligned">
          <header className="app-header">
            <div className="title-container">
              <h1>Welcome to NFT Create & Transfer Platform</h1>

              <p className="subtitle">
                NFT MarketPlace aims to empower developers with the foundation
                of how NFT MarketPlace work
              </p>

              <p className="collaboration-message">
                🚀 Brought to you by Aelf Developer Community
              </p>
            </div>
            <div className="container"></div>
            <div className="header"></div>
          </header>
        </div>
      </div> */}
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
