import "./HomeDAO.css";
import { NFT_IMAGES } from "./utils/constant";

function HomeDAO() {
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

  return (
    <div className="App">
      <div className="DAO-info container">
        <div className="left-aligned">
          <header className="app-header">
            <div className="title-container">
              <h1>Welcome to NFT MarketPlace</h1>

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
      </div>
      <div className="nft-collection-container">
        <h2>NFT Collection</h2>
        <div className="nft-collection">
          {NFT_IMAGES.map((image, index) => (
            <div className="nft-card" key={index}>
              <img src={image} alt={"nft- image" + index} />
              <div className="nft-info"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeDAO;
