"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
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
import "./create-nft.scss";

import detectProvider from "@portkey/detect-provider";
import { Button } from "@/components/ui/button";
import useNFTSmartContract from "@/hooks/useNFTSmartContract";
import AElf from "aelf-sdk";
import { Buffer } from "buffer";

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

const wallet = AElf.wallet.getWalletByPrivateKey(
  "4e83df2aa7c8552a75961f9ab9f2f06e01e0dca0203e383da5468bbbe2915c97"
);

const CreateNftPage = ({
  currentWalletAddress,
}: {
  currentWalletAddress: string;
}) => {
  const [provider, setProvider] = useState<IPortkeyProvider | null>(null);
  const {
    mainChainSmartContract,
    sideChainSmartContract,
    crossChainSmartContract,
  } = useNFTSmartContract(provider);
  const [transactionDetails, setTransactionBytes] = useState<any>("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionId, setTransactionId] = useState<any>("");
  const [isNftCollectionCreated, setIsNftCollectionCreated] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const merkelApiUrl =
    "https://aelf-test-node.aelf.io/api/blockChain/merklePathByTransactionId?transactionId=";

  const mainchain_from_chain_id = 9992731;
  const sidechain_from_chain_id = 1931928;

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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

  // step - 5
  const createTokenOnCrossChain = async (
    parentChainHeight: any,
    merklePath: any
  ) => {
    try {
      setTransactionStatus("Creating Token on CrossChain");
      // Convert transaction object to JSON string
      const jsonString = JSON.stringify(transactionDetails);

      // Convert JSON string to byte array
      const byteObj = new TextEncoder().encode(jsonString);
      const byteArray = Object.values(byteObj);
      console.log(byteArray);
      const data = {
        fromChainId: mainchain_from_chain_id,
        parentChainHeight: parentChainHeight,
        transactionBytes: byteArray,
        merklePath: merklePath,
      };
      console.log("sending data", data);
      const result = await sideChainSmartContract?.callSendMethod(
        "CrossChainCreateToken",
        currentWalletAddress,
        data
      );
      console.log(
        "========= result of createTokenOnCrossChain =========",
        result
      );
      return "success";
    } catch (error) {
      setTransactionStatus("");
      console.error(error, "=====error in createTokenOnCrossChain");
      return "error";
    }
  };

  // step - 4
  const getMarkelPath = async () => {
    try {
      setTransactionStatus("Fetching Markel Path");
      const response = await fetch(merkelApiUrl + transactionId);
      const json = await response.json();
      console.log("========= result of getMarkelPath =========", json);
      return json.MerklePathNodes;
    } catch (error) {
      setTransactionStatus("");
      console.error(error, "=====error in getMarkelPath");
      return "error";
    }
  };

  // step - 3
  const GetParentChainHeight = async () => {
    try {
      setTransactionStatus("Fetching Parent Chain Height");
      console.log("sideChainSmartContract", sideChainSmartContract);
      const result = await sideChainSmartContract?.callViewMethod(
        "GetParentChainHeight",
        ""
      );
      console.log("========= result of GetParentChainHeight =========", result);
      return result ? (result.data.value as string) : "";
    } catch (error: any) {
      console.error(error, "=====error in GetParentChainHeight");
      return "error";
    }
  };

  function hexStringToByteArray(hexString: string) {
    const byteArray = [];
    for (let i = 0; i < hexString.length; i += 2) {
      byteArray.push(parseInt(hexString.substr(i, 2), 16));
    }
    return byteArray;
  }

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
  const validateTokenInfoExist = async (values: INftInput) => {
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
      console.log("aelfTokenContract", aelfTokenContract);
      const signedTx =
        aelfTokenContract.ValidateTokenInfoExists.getSignedTx(validateInput);
      console.log(signedTx, "signedTx");
      const { TransactionId: VALIDATE_TXID } = await aelf.chain.sendTransaction(
        signedTx
      );
      console.log(VALIDATE_TXID, "VALIDATE_TXID");
      let VALIDATE_TXRESULT = await aelf.chain.getTxResult(VALIDATE_TXID);
      console.log(VALIDATE_TXRESULT, "VALIDATE_TXRESULT");
      // await delay(3000);
      // const merklePath = await getMerklePathByTxId(aelf, VALIDATE_TXID);
      // console.log(merklePath, "merklePath");
      // await delay(30000);
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
        console.log(
          sideIndexMainHeight,
          VALIDATE_TXRESULT.Transaction.RefBlockNumber,
          sideIndexMainHeight >= VALIDATE_TXRESULT.Transaction.RefBlockNumber,
          "xxxxx"
        );
      }
      console.log("VALIDATE_TXRESULT", VALIDATE_TXRESULT);

      const merklePath = await getMerklePathByTxId(aelf, VALIDATE_TXID);
      console.log(merklePath, "merklePath");

      const tdvwTokenContract = await getTokenContract(tdvw, wallet);

      const byteArray = hexStringToByteArray(signedTx);

      const CROSS_CHAIN_CREATE_TOKEN_PARAMS = {
        fromChainId: 9992731,
        parentChainHeight: "" + VALIDATE_TXRESULT.BlockNumber,
        // @ts-ignore
        transactionBytes: Buffer.from(byteArray, "hex").toString("base64"),
        merklePath,
      };
      setTransactionStatus("Creating Collection on SideChain..");
      const signedTx2 =
        await tdvwTokenContract.CrossChainCreateToken.getSignedTx(
          CROSS_CHAIN_CREATE_TOKEN_PARAMS
        );

      let done = false,
        count = 0;

      while (!done) {
        try {
          await delay(10000);
          console.log(`Retrying #${++count}...`);
          const { TransactionId } = await tdvw.chain.sendTransaction(signedTx2);
          const txResult = await tdvw.chain.getTxResult(TransactionId);

          console.log(txResult);
          if (txResult.Status === "SUCCESS" || txResult.Status === "MINED") {
            done = true;
            setIsNftCollectionCreated(true);
            alert("Cross Chain Verification Successful");
            alert("Create a NFT Token now");
            setTransactionStatus("");
          }
        } catch (err: any) {
          console.log(err);
          if (err.Error.includes("Cross chain verification failed.")) {
            console.log("Exit.");
            done = true;
          }
        }
      }

      // const result = await mainChainSmartContract?.callSendMethod(
      //   "ValidateTokenInfoExists",
      //   currentWalletAddress,
      //   validateInput
      // );
      // setTransactionBytes(result?.data && result.data.Transaction);
      // setTransactionId(result?.data && result.data.TransactionId);
      // console.log(
      //   "========= result of validateTokenInfoExist =========",
      //   result
      // );
      // alert("NFT Validation Successful");
      return "success";
    } catch (error: any) {
      console.error(error, "=====error in validateTokenInfoExist");
      alert(`error in validateTokenInfoExist ${error.message}`);
      return "error";
    }
  };

  // step - 1
  const createAndValidateNewNftCollection = async (values: {
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
      console.log("createNtfInput", createNtfInput);
      const result = await mainChainSmartContract?.callSendMethod(
        "Create",
        currentWalletAddress,
        createNtfInput
      );
      console.log("========= result of createNewNft =========", result);
      alert("NFT Collection Created Successfully");
      return createNtfInput;
    } catch (error: any) {
      console.error(error.message, "=====error");
      alert(error.message);
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

  //Step E - Write Create NFT Logic
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isNftCollectionCreated) {
      setTransactionStatus("Creating NFT Token...");
      await createNftTokenOnSideChain(values);
      return;
    }
    setTransactionStatus("Creating NFT Collection..");
    const createResult = await createAndValidateNewNftCollection(values);
    if (createResult === "error") {
      return;
    }
    setTransactionStatus("Validating Token Info..");
    const validationTokenResult = await validateTokenInfoExist(createResult);
    if (validationTokenResult === "error") {
      return;
    }
    // const chainHightResult = await GetParentChainHeight();
    // if (chainHightResult === "error") {
    //   return;
    // }
    // const markelResult = await getMarkelPath();
    // if (markelResult === "error") {
    //   return;
    // }
    // const crossChainNftResult = await createTokenOnCrossChain(
    //   chainHightResult,
    //   markelResult
    // );
    // if (crossChainNftResult === "error") {
    //   return;
    // }
  };

  const issueNftOnSideChain = async (values: {
    symbol: string;
    amount: string;
    memo: string;
  }) => {
    try {
      const issueNftInput = {
        symbol: values.symbol,
        amount: values.amount,
        memo: values.memo,
        to: currentWalletAddress,
      };
      console.log("issueNftInput", issueNftInput);
      const result = await mainChainSmartContract?.callSendMethod(
        "Issue",
        currentWalletAddress,
        issueNftInput
      );
      console.log("========= result of createNewNft =========", result);
      alert("NFT Token Issue Successfully");
      return "success";
    } catch (error: any) {
      console.error(error.message, "=====error");
      alert(error.message);
      return "error";
    }
  };

  const createNftTokenOnSideChain = async (values: {
    tokenName: string;
    symbol: string;
    totalSupply: string;
    decimals: string;
  }) => {
    try {


      // const createNtfMainChainInput: INftInput = {
      //   tokenName: values.tokenName,
      //   symbol: values.symbol,
      //   totalSupply: values.totalSupply,
      //   decimals: values.decimals,
      //   issuer: currentWalletAddress,
      //   isBurnable: true,
      //   issueChainId: sidechain_from_chain_id,
      //   owner: currentWalletAddress,
      //   externalInfo:{
      //     value:{
      //       __nft_image_url:"https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/334602109/original/dd46665b41931c95f8b80b8e5437183aa10d2857/create-ai-art-using-your-concept-with-leonardo-ai.png"
      //     }
      //   }
      // };
      // console.log("createNtfInput", createNtfMainChainInput);
      // const resultMainchain = await mainChainSmartContract?.callSendMethod(
      //   "Create",
      //   currentWalletAddress,
      //   createNtfMainChainInput
      // );
      // console.log("========= result of createNewNft =========", resultMainchain);
      // alert("NFT Token Created Successfully on mainchain");

      // await delay(30000);
      setTransactionStatus("Validating NFT Token Info..");
      const tdvw = new AElf(
        new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
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
        externalInfo:{
          value:{
            __nft_image_url:"https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/334602109/original/dd46665b41931c95f8b80b8e5437183aa10d2857/create-ai-art-using-your-concept-with-leonardo-ai.png"
          }
        }
      };
      const aelfTokenContract = await getTokenContract(tdvw, wallet);
      console.log("validateInput", validateInput);
      const signedTx =
        aelfTokenContract.ValidateTokenInfoExists.getSignedTx(validateInput);
      console.log(signedTx, "signedTx");
      const { TransactionId: VALIDATE_TXID } = await tdvw.chain.sendTransaction(
        signedTx
      );
      console.log(VALIDATE_TXID, "VALIDATE_TXID");
      let VALIDATE_TXRESULT = await tdvw.chain.getTxResult(VALIDATE_TXID);
      console.log(VALIDATE_TXRESULT, "VALIDATE_TXRESULT");
      // await delay(3000);
      // const merklePath = await getMerklePathByTxId(aelf, VALIDATE_TXID);
      // console.log(merklePath, "merklePath");
      // await delay(30000);

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
          VALIDATE_TXRESULT = await tdvw.chain.getTxResult(VALIDATE_TXID);
          console.log(VALIDATE_TXRESULT, "VALIDATE_TXRESULT=====2");
          heightDone = true;
        }
        console.log(
          sideIndexMainHeight,
          VALIDATE_TXRESULT.Transaction.RefBlockNumber,
          sideIndexMainHeight >= VALIDATE_TXRESULT.Transaction.RefBlockNumber,
          "xxxxx"
        );
      }
      console.log("VALIDATE_TXRESULT", VALIDATE_TXRESULT);


      setTransactionStatus("Creating NFT Token on SideChain..");

      const createNtfInput = {
        tokenName: values.tokenName,
        symbol: values.symbol.replace("0","1"),
        totalSupply: values.totalSupply,
        decimals: values.decimals,
        issuer: currentWalletAddress,
        isBurnable: true,
        issueChainId: sidechain_from_chain_id,
        owner: currentWalletAddress,
        externalInfo:{
          value:{
            __nft_image_url:"https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/334602109/original/dd46665b41931c95f8b80b8e5437183aa10d2857/create-ai-art-using-your-concept-with-leonardo-ai.png"
          }
        }
      };
      console.log("createNtfInput", createNtfInput);
      const result = await sideChainSmartContract?.callSendMethod(
        "Create",
        currentWalletAddress,
        createNtfInput
      );
      console.log("========= result of createNewNft =========", result);
      alert("NFT Token Created Successfully");
      await issueNftOnSideChain({
        symbol: values.symbol,
        amount: values.totalSupply,
        memo: "We are issuing nftToken",
      });
      setTransactionStatus("");
      return createNtfInput;
    } catch (error: any) {
      console.error(error, "=====error");
      setTransactionStatus("");
      const txnId =error.TransactionId;
      const response = await fetch("https://aelf-test-node.aelf.io/api/blockChain/transactionResult?transactionId=" + txnId);
      const json = await response.json();
      console.log("========= result of getMarkelPath =========", json);
      alert(error);
      return "error";
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
              <div className="button-container">
                <button
                  type="button"
                  className="return-btn"
                  onClick={handleReturnClick}
                >
                  Return
                </button>
                <Button type="submit">{transactionStatus || "Create"}</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateNftPage;
