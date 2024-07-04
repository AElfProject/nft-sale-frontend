import { PropsWithChildren, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IPortkeyProvider, MethodsBase } from "@portkey/provider-types";
import detectProvider from "@portkey/detect-provider";
// import useDAOSmartContract from "@/useDAOSmartContract";

const ProfileButton = (props: PropsWithChildren) => (
  <svg
    {...props}
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="User">
      <g>
        <path d="M17.438,21.937H6.562a2.5,2.5,0,0,1-2.5-2.5V18.61c0-3.969,3.561-7.2,7.938-7.2s7.938,3.229,7.938,7.2v.827A2.5,2.5,0,0,1,17.438,21.937ZM12,12.412c-3.826,0-6.938,2.78-6.938,6.2v.827a1.5,1.5,0,0,0,1.5,1.5H17.438a1.5,1.5,0,0,0,1.5-1.5V18.61C18.938,15.192,15.826,12.412,12,12.412Z"></path>
        <path d="M12,9.911a3.924,3.924,0,1,1,3.923-3.924A3.927,3.927,0,0,1,12,9.911Zm0-6.847a2.924,2.924,0,1,0,2.923,2.923A2.926,2.926,0,0,0,12,3.064Z"></path>
      </g>
    </g>
  </svg>
);

const Header = ({
  isConnected,
  currentWalletAddress,
  setIsConnected,
  setCurrentWalletAddress,
}: {
  isConnected: boolean;
  currentWalletAddress: string | undefined;
  setIsConnected: (val: boolean) => void;
  setCurrentWalletAddress: (val: string) => void;
}) => {
  const [provider, setProvider] = useState<IPortkeyProvider | null>(null);
  //   const nftContract = useDAOSmartContract(provider);

  const connect = async (walletProvider?: IPortkeyProvider) => {
    //Step B - Connect Portkey Wallet
    const accounts = await (walletProvider
      ? walletProvider
      : provider
    )?.request({
      method: MethodsBase.REQUEST_ACCOUNTS,
    });
    console.log("accounts", accounts);
    const account = accounts?.tDVV && accounts?.tDVV[0];
    console.log("account", account);
    if (account) {
      setCurrentWalletAddress(account);
      setIsConnected(true);
    }
    // alert("Successfully connected");
  };

  const init = async () => {
    try {
      const walletProvider = await detectProvider({ providerName: "Portkey" });
      setProvider(walletProvider);
      if (walletProvider) {
        setIsConnected(walletProvider.isConnected());
      }
      try {
        //Fetch Accounts
        const accounts = await walletProvider?.request({
          method: MethodsBase.ACCOUNTS,
        });
        if (!accounts) throw new Error("No accounts");

        const account = accounts?.tDVV?.[0];

        if (!account) throw new Error("No account");
        console.log("accounts", accounts);
        connect(walletProvider as IPortkeyProvider);
        // const proposalResponse = await nftContract?.callViewMethod<IProposals>(
        //   "GetAllProposals",
        //   ""
        // );
        // setProposals(proposalResponse?.data);
        // alert("Fetched proposals");
      } catch (error) {
        console.error(error, "===error");
      }
    } catch (error) {
      console.log(error, "=====error");
    }
  };

  useEffect(() => {
    if (!provider) init();
  }, [provider]);

  return (
    <div className="header">
      <div className="container">
        <div className="logo">
          <img src="/src/assets/aelf_logo.png" alt="Aelf Logo" />
        </div>
        <div className="search-bar"></div>
        <div className="right-wrapper">
          <Button onClick={() => connect()} className="header-button">
            {isConnected
              ? currentWalletAddress?.slice(0, 5) +
                "....." +
                currentWalletAddress?.slice(-5)
              : "Connect Wallet"}
          </Button>
          {isConnected && <ProfileButton />}
        </div>
      </div>
    </div>
  );
};

export default Header;
