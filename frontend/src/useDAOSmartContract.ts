import { IPortkeyProvider, IChain } from "@portkey/provider-types";
import { useEffect, useState } from "react";

function useDAOSmartContract(provider: IPortkeyProvider | null) {
  const [smartContract, setSmartContract] =
    useState<ReturnType<IChain["getContract"]>>();

  //Step A - Setup Portkey Wallet Provider
  useEffect(() => {});

  return smartContract;
}

export default useDAOSmartContract;
