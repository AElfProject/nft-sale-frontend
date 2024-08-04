import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
// @ts-ignore
import AElf from "aelf-sdk";
import { Buffer } from "buffer";
import { toast } from "react-toastify";

import { IPortkeyProvider } from "@portkey/provider-types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import detectProvider from "@portkey/detect-provider";
import { Button } from "@/components/ui/button";
import useNFTSmartContract from "@/hooks/useNFTSmartContract";
import "./create-nft.scss";

import { CustomToast, delay, removeNotification } from "@/lib/utils";

const formSchema = z.object({
  tokenName: z.string(),
  symbol: z.string(),
  totalSupply: z.string(),
  decimals: z.string(),
});

interface INftInput {
  symbol: string;
  tokenName: string;
  totalSupply: string;
  decimals: string;
  issuer: string;
  isBurnable: boolean;
  issueChainId: number;
  owner: string;
}

interface INftParams {
  tokenName: string;
  symbol: string;
  totalSupply: string;
}

interface INftValidateResult {
  parentChainHeight: string | number;
  signedTx: string;
  merklePath: { merklePathNodes: any };
}

const wallet = AElf.wallet.getWalletByPrivateKey(
  "4e83df2aa7c8552a75961f9ab9f2f06e01e0dca0203e383da5468bbbe2915c97"
);

const CreateNftPage = ({
  currentWalletAddress,
}: {
  currentWalletAddress: string;
}) => {
  const [provider, setProvider] = useState<IPortkeyProvider | null>(null);
  const { mainChainSmartContract, sideChainSmartContract } =
    useNFTSmartContract(provider);
  const [transactionStatus, setTransactionStatus] = useState<boolean>(false);
  const [isNftCollectionCreated, setIsNftCollectionCreated] =
    useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(location.search);
  const isNftCreate = searchParams.get("nft-create");

  const mainchain_from_chain_id = 9992731;
  const sidechain_from_chain_id = 1931928;

  const tdvw = new AElf(
    new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
  );

  const handleReturnClick = () => {
    navigate("/");
  };

  const init = async () => {
    try {
      setProvider(await detectProvider());
    } catch (error) {
      console.log(error, "=====error");
    }
  };



  useEffect(() => {
    if (!provider) init();
  }, [provider]);

  useEffect(() => {
    if (isNftCreate) {
      setIsNftCollectionCreated(true);
    }
  }, [isNftCreate]);

  const getTokenContract = async (aelf: any, wallet: any) => {
    console.log(`Getting token contract for`, aelf.currentProvider.host);
    const tokenContractName = "AElf.ContractNames.Token";

    // get chain status
    const chainStatus = await aelf.chain.getChainStatus();
    // get genesis contract address
    const GenesisContractAddress = chainStatus.GenesisContractAddress;
    // get genesis contract instance
    const zeroContract = await aelf.chain.contractAt(
      GenesisContractAddress,
      wallet
    );
    // Get contract address by the read only method `GetContractAddressByName` of genesis contract
    const tokenContractAddress =
      await zeroContract.GetContractAddressByName.call(
        AElf.utils.sha256(tokenContractName)
      );

    return await aelf.chain.contractAt(tokenContractAddress, wallet);
  };

  // step - 3
  function hexStringToByteArray(hexString: string) {
    const byteArray = [];
    for (let i = 0; i < hexString.length; i += 2) {
      byteArray.push(parseInt(hexString.substr(i, 2), 16));
    }
    return byteArray;
  }

  // step - 3
  const getMerklePathByTxId = async (aelf: any, txId: string) => {
    let VALIDATE_MERKLEPATH;
    try {
      VALIDATE_MERKLEPATH = await aelf.chain.getMerklePathByTxId(txId);
    } catch (err) {
      console.log(err);
    }

    VALIDATE_MERKLEPATH.MerklePathNodes =
      VALIDATE_MERKLEPATH.MerklePathNodes.map(
        ({ Hash, IsLeftChildNode }: any) => ({
          hash: Hash,
          isLeftChildNode: IsLeftChildNode,
        })
      );

    return {
      merklePathNodes: VALIDATE_MERKLEPATH.MerklePathNodes,
    };
  };

  const getCrossChainContract = async (aelf: any, wallet: any) => {
    console.log(`Getting cross chain contract for`, aelf.currentProvider.host);
    const crossChainContractName = "AElf.ContractNames.CrossChain";

    // get chain status
    const chainStatus = await aelf.chain.getChainStatus();
    // get genesis contract address
    const GenesisContractAddress = chainStatus.GenesisContractAddress;
    // get genesis contract instance
    const zeroContract = await aelf.chain.contractAt(
      GenesisContractAddress,
      wallet
    );
    // Get contract address by the read only method `GetContractAddressByName` of genesis contract
    const crossChainContractAddress =
      await zeroContract.GetContractAddressByName.call(
        AElf.utils.sha256(crossChainContractName)
      );

    return await aelf.chain.contractAt(crossChainContractAddress, wallet);
  };

  // step - 2
  const validateTokenInfoExist = async (
    values: INftInput,
    validateLoadingId: any
  ) => {
    try {
      const aelf = new AElf(
        new AElf.providers.HttpProvider("https://aelf-test-node.aelf.io")
      );

      const validateInput = {
        symbol: values.symbol,
        tokenName: values.tokenName,
        totalSupply: values.totalSupply,
        decimals: values.decimals,
        issuer: currentWalletAddress,
        isBurnable: true,
        issueChainId: sidechain_from_chain_id,
        owner: currentWalletAddress,
      };
      const aelfTokenContract = await getTokenContract(aelf, wallet);

      const signedTx =
        aelfTokenContract.ValidateTokenInfoExists.getSignedTx(validateInput);

      const { TransactionId: VALIDATE_TXID } = await aelf.chain.sendTransaction(
        signedTx
      );

      let VALIDATE_TXRESULT = await aelf.chain.getTxResult(VALIDATE_TXID);
      console.log(VALIDATE_TXRESULT, "VALIDATE_TXRESULT");

      // if SideChain index has a MainChain height greater than validateTokenInfoExist's
      let heightDone = false;
      const tdvwCrossChainContract = await getCrossChainContract(tdvw, wallet);

      while (!heightDone) {
        const sideIndexMainHeight = (
          await tdvwCrossChainContract.GetParentChainHeight.call()
        ).value;
        if (
          sideIndexMainHeight >= VALIDATE_TXRESULT.Transaction.RefBlockNumber
        ) {
          VALIDATE_TXRESULT = await aelf.chain.getTxResult(VALIDATE_TXID);
          heightDone = true;
        }
      }

      console.log("VALIDATE_TXRESULT", VALIDATE_TXRESULT);

      toast.update(validateLoadingId, {
        render: "Validating Token Successfully Executed",
        type: "success",
        isLoading: false,
      });
      removeNotification(validateLoadingId);

      const crossChainLoadingId = toast.loading(
        "Creating Collection on SideChain..."
      );

      const merklePath = await getMerklePathByTxId(aelf, VALIDATE_TXID);

      const tdvwTokenContract = await getTokenContract(tdvw, wallet);

      const byteArray = hexStringToByteArray(signedTx);

      const CROSS_CHAIN_CREATE_TOKEN_PARAMS = {
        fromChainId: mainchain_from_chain_id,
        parentChainHeight: "" + VALIDATE_TXRESULT.BlockNumber,
        // @ts-ignore
        transactionBytes: Buffer.from(byteArray, "hex").toString("base64"),
        merklePath,
      };
      const signedTx2 =
        await tdvwTokenContract.CrossChainCreateToken.getSignedTx(
          CROSS_CHAIN_CREATE_TOKEN_PARAMS
        );

      let done = false;

      while (!done) {
        try {
          await delay(10000);
          const { TransactionId } = await tdvw.chain.sendTransaction(signedTx2);
          const txResult = await tdvw.chain.getTxResult(TransactionId);

          if (txResult.Status === "SUCCESS" || txResult.Status === "MINED") {
            done = true;
            setIsNftCollectionCreated(true);
            toast.update(crossChainLoadingId, {
              render: "Collection was Created Successfully On SideChain",
              type: "success",
              isLoading: false,
            });
            removeNotification(crossChainLoadingId);
            toast.info("You Can Create NFT now");
            setTransactionStatus(false);
          }
        } catch (err: any) {
          console.log(err);
          if (err.Error.includes("Cross chain verification failed.")) {
            console.log("Exit.");
            done = true;
          }
        }
      }
      return "success";
    } catch (error: any) {
      console.error(error, "=====error in validateTokenInfoExist");
      toast.error(`error in validateTokenInfoExist ${error.message}`);
      return "error";
    }
  };

  // step - 1
  const createNftCollection = async (values: {
    tokenName: string;
    symbol: string;
    totalSupply: string;
    decimals: string;
  }) => {
    try {
      const createNtfInput: INftInput = {
        tokenName: values.tokenName,
        symbol: values.symbol,
        totalSupply: values.totalSupply,
        decimals: values.decimals,
        issuer: currentWalletAddress,
        isBurnable: true,
        issueChainId: sidechain_from_chain_id,
        owner: currentWalletAddress,
      };

      const result = await mainChainSmartContract?.callSendMethod(
        "Create",
        currentWalletAddress,
        createNtfInput
      );
      console.log("========= result of createNewNft =========", result);
      return createNtfInput;
    } catch (error: any) {
      console.error(error.message, "=====error");
      toast.error(error.message);
      return "error";
    }
  };

  //Step D - Configure NFT Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenName: "",
      symbol: "",
      totalSupply: "",
      decimals: "",
    },
  });

  const issueNftOnSideChain = async (values: {
    symbol: string;
    amount: string;
    memo: string;
  }) => {
    try {
      const createSideChainNFTLoadingId = toast.loading(
        "Issuing NFT on SideChain..."
      );
      const issueNftInput = {
        symbol: values.symbol,
        amount: values.amount,
        memo: values.memo,
        to: currentWalletAddress,
      };
      const result = await sideChainSmartContract?.callSendMethod(
        "Issue",
        currentWalletAddress,
        issueNftInput
      );
      console.log("========= result of createNewNft =========", result);

      toast.update(createSideChainNFTLoadingId, {
        render: "NFT Issue Successfully Executed",
        type: "success",
        isLoading: false,
      });
      removeNotification(createSideChainNFTLoadingId);
      toast.success("You Got NFT On Wallet!");
      handleReturnClick();
      return "success";
    } catch (error: any) {
      console.error(error.message, "=====error");
      toast.error(error.message);
      setTransactionStatus(false);
      return "error";
    }
  };

  const createNFTOnMainChain = async (values: {
    tokenName: string;
    symbol: string;
    totalSupply: string;
  }) => {
    let createMainChainNFTLoadingId;

    try {
      createMainChainNFTLoadingId = toast.loading(
        "Creating NFT on MainChain..."
      );
      const createNtfMainChainInput = {
        tokenName: values.tokenName,
        symbol: values.symbol,
        totalSupply: values.totalSupply,
        issuer: currentWalletAddress,
        isBurnable: true,
        issueChainId: sidechain_from_chain_id,
        owner: currentWalletAddress,
        externalInfo: {},
      };

      const resultMainchain = await mainChainSmartContract?.callSendMethod(
        "Create",
        currentWalletAddress,
        createNtfMainChainInput
      );
      console.log(
        "========= result of createNewNft =========",
        resultMainchain
      );

      toast.update(createMainChainNFTLoadingId, {
        render: "NFT Created Successfully on MainChain",
        type: "success",
        isLoading: false,
      });
      removeNotification(createMainChainNFTLoadingId);
      return "success";
    } catch (error: any) {
      console.log("=====error", error);
      if (!createMainChainNFTLoadingId) {
        return "error";
      }
      toast.update(createMainChainNFTLoadingId, {
        render: error.message,
        type: "error",
        isLoading: false,
      });
      removeNotification(createMainChainNFTLoadingId,5000);
      return "error";
    }
  };

  const validateNftToken = async (values: INftParams) => {
    try {
      const validateNFTLoadingId = toast.loading(
        <CustomToast
          title="Transaction is getting validated on aelf blockchain. Please wait!"
          message="Validation means transaction runs through a consensus algorithm to be selected or rejected. Once the status changes process will complete. It usually takes some time in distributed systems."
        />
      );

      const aelf = new AElf(
        new AElf.providers.HttpProvider("https://aelf-test-node.aelf.io")
      );

      const validateInput = {
        symbol: values.symbol,
        tokenName: values.tokenName,
        totalSupply: values.totalSupply,
        issuer: currentWalletAddress,
        isBurnable: true,
        issueChainId: sidechain_from_chain_id,
        owner: currentWalletAddress,
        externalInfo: {},
      };
      const aelfTokenContract = await getTokenContract(aelf, wallet);

      const signedTx =
        aelfTokenContract.ValidateTokenInfoExists.getSignedTx(validateInput);

      const { TransactionId: VALIDATE_TXID } = await aelf.chain.sendTransaction(
        signedTx
      );

      await delay(3000);

      let VALIDATE_TXRESULT = await aelf.chain.getTxResult(VALIDATE_TXID);
      console.log(VALIDATE_TXRESULT, "VALIDATE_TXRESULT");

      await delay(3000);

      const tdvw = new AElf(
        new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
      );

      // if SideChain index has a MainChain height greater than validateTokenInfoExist's
      let heightDone = false;
      const tdvwCrossChainContract = await getCrossChainContract(tdvw, wallet);

      while (!heightDone) {
        const sideIndexMainHeight = (
          await tdvwCrossChainContract.GetParentChainHeight.call()
        ).value;
        if (
          sideIndexMainHeight >= VALIDATE_TXRESULT.Transaction.RefBlockNumber
        ) {
          VALIDATE_TXRESULT = await aelf.chain.getTxResult(VALIDATE_TXID);
          console.log(VALIDATE_TXRESULT, "VALIDATE_TXRESULT=====2");
          heightDone = true;
        }
      }

      const merklePath = await getMerklePathByTxId(aelf, VALIDATE_TXID);

      toast.update(validateNFTLoadingId, {
        render: "Validating NFT Successfully Executed",
        type: "success",
        isLoading: false,
      });
      removeNotification(validateNFTLoadingId);
      return {
        parentChainHeight: VALIDATE_TXRESULT.BlockNumber,
        signedTx: signedTx,
        merklePath: merklePath,
      };
    } catch (error) {
      console.log("error======", error);
      return "error";
    }
  };

  const createNftTokenOnSideChain = async (values: INftValidateResult) => {
    try {
      const createSideChainNFTLoadingId = toast.loading(
        "Creating NFT on SideChain..."
      );

      const CROSS_CHAIN_CREATE_TOKEN_PARAMS = {
        fromChainId: mainchain_from_chain_id,
        parentChainHeight: values.parentChainHeight,
        transactionBytes: Buffer.from(values.signedTx, "hex").toString(
          "base64"
        ),
        merklePath: values.merklePath,
      };

      await sideChainSmartContract?.callSendMethod(
        "CrossChainCreateToken",
        currentWalletAddress,
        CROSS_CHAIN_CREATE_TOKEN_PARAMS
      );

      toast.update(createSideChainNFTLoadingId, {
        render: "NFT Created Successfully On SideChain",
        type: "success",
        isLoading: false,
      });
      removeNotification(createSideChainNFTLoadingId);
      return "success";
    } catch (error) {
      console.log("error====", error);
      return "error";
    }
  };

  const createNftToken = async (values: INftParams) => {
    try {
      const mainChainResult = await createNFTOnMainChain(values);

      if (mainChainResult === "error") {
        setTransactionStatus(false);
        return;
      }
      await delay(3000);

      const validateNFTData: INftValidateResult | "error" =
        await validateNftToken(values);

      if (validateNFTData === "error") {
        setTransactionStatus(false);
        return;
      }

      const sideChainResult = await createNftTokenOnSideChain(validateNFTData);

      if (sideChainResult === "error") {
        setTransactionStatus(false);
        return;
      }

      await issueNftOnSideChain({
        symbol: values.symbol,
        amount: values.totalSupply,
        memo: "We are issuing nftToken",
      });
      setTransactionStatus(false);
    } catch (error: any) {
      console.error(error, "=====error");
      setTransactionStatus(false);
      toast.error(error);
      return "error";
    }
  };

  //Step E - Write Create NFT Logic
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setTransactionStatus(true);
    // Logic for only create
    if (isNftCollectionCreated) {
      // create NFT
      await createNftToken(values);
    } else {
      // create NFT Collection
      const createLoadingId = toast.loading("Creating NFT Collection..");

      const createResult = await createNftCollection(values);

      toast.update(createLoadingId, {
        render: "NFT Collection Created Successfully On MainChain",
        type: "success",
        isLoading: false,
      });
      removeNotification(createLoadingId);

      if (createResult === "error") {
        setTransactionStatus(false);
        return;
      }
      const validateLoadingId = toast.loading(
        <CustomToast
          title="Transaction is getting validated on aelf blockchain. Please wait!"
          message="Validation means transaction runs through a consensus algorithm to be selected or rejected. Once the status changes process will complete. It usually takes some time in distributed systems."
        />
      );
      await validateTokenInfoExist(createResult, validateLoadingId);
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div className="form-content">
          <h2 className="form-title">Create a New NFT</h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 proposal-form"
            >
              <div className="input-group">
                <FormField
                  control={form.control}
                  name="tokenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Token Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="input-group">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Symbol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="input-group">
                <FormField
                  control={form.control}
                  name="totalSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Supply</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Total Supply" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {!isNftCollectionCreated && (
                <div className="input-group">
                  <FormField
                    control={form.control}
                    name="decimals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decimals</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Decimals" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <div className="button-container">
                <Button
                  type="button"
                  className="return-btn"
                  disabled={!!transactionStatus}
                  onClick={handleReturnClick}
                >
                  Return
                </Button>
                <Button
                  type="submit"
                  className="submit-btn"
                  disabled={!!transactionStatus}
                >
                  Create {isNftCollectionCreated ? "NFT" : "Collection"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateNftPage;
