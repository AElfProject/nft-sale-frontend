import { IPortkeyProvider, IChain } from "@portkey/provider-types";
import { useEffect, useState } from "react";

const useNFTSmartContract = (provider: IPortkeyProvider | null) => {
  const [mainChainSmartContract, setMainChainSmartContract] =
    useState<ReturnType<IChain["getContract"]>>();
  const [sideChainSmartContract, setSideChainSmartContract] =
    useState<ReturnType<IChain["getContract"]>>();

  // Step A - Setup Portkey Wallet Provider
  useEffect(() => {
    (async () => {
      if (!provider) return null;

      try {
        // 1. get the sidechain tDVW using provider.getChain
        const chain = await provider?.getChain("AELF");
        if (!chain) throw new Error("No chain");
        //Replace with Address of Deployed Smart Contract
        const address = "JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE";

        // 2. get the NFT MultiToken contract
        const contract = chain?.getContract(address);
        setMainChainSmartContract(contract);
      } catch (error) { 
        console.log(error, "====error");
      }
    })();
  }, [provider]);

  useEffect(() => {
    (async () => {
      if (!provider) return null;

      try {
        // 1. get the sidechain tDVW using provider.getChain
        const chain = await provider?.getChain("tDVW");
        if (!chain) throw new Error("No chain");
        //Replace with Address of Deployed Smart Contract
        const address = "ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx";

        // 2. get the NFT MultiToken contract
        const contract = chain?.getContract(address);
        setSideChainSmartContract(contract);
      } catch (error) { 
        console.log(error, "====error");
      }
    })();
  }, [provider]);

  return {mainChainSmartContract,sideChainSmartContract};
};

export default useNFTSmartContract;
