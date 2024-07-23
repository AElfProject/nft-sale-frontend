import { IPortkeyProvider, IChain } from "@portkey/provider-types";
import { useEffect, useState } from "react";

const useNFTSmartContract = (provider: IPortkeyProvider | null) => {
  const [smartContract, setSmartContract] =
    useState<ReturnType<IChain["getContract"]>>();

  //Step A - Setup Portkey Wallet Provider
  useEffect(() => {
    (async () => {
      if (!provider) return null;

      try {
        // 1. get the sidechain tDVW using provider.getChain
        const chain = await provider?.getChain("tDVW");
        if (!chain) throw new Error("No chain");

        //Address of DAO Smart Contract
        //Replace with Address of Deployed Smart Contract
        const address = "wq2mtnQ7kmPqnWNQeyqPcv3n8A6wucmFrDsakYhqoK1MzV7BN";

        // 2. get the DAO contract
        const nftContract = chain?.getContract(address);
        setSmartContract(nftContract);
      } catch (error) {
        console.log(error, "====error");
      }
    })();
  }, [provider]);

  return smartContract;
};

export default useNFTSmartContract;
