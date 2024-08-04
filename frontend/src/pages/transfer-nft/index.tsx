import { useState, useEffect } from "react";
import { IPortkeyProvider } from "@portkey/provider-types";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import "./transfer-nft.scss";

import detectProvider from "@portkey/detect-provider";
import { Button } from "@/components/ui/button";
import { NFT_IMAGES } from "@/lib/constant";
import useNFTSmartContract from "@/hooks/useNFTSmartContract";
import { toast } from "react-toastify";
import { removeNotification } from "@/lib/utils";

const formSchema = z.object({
  address: z.string(),
  amount: z.number(),
  memo: z.string(),
});

const TransferNftPage = ({
  currentWalletAddress,
}: {
  currentWalletAddress: string;
}) => {
  const [provider, setProvider] = useState<IPortkeyProvider | null>(null);
  const [nftBalance, setNftBalance] = useState(0);
  const { sideChainSmartContract } = useNFTSmartContract(provider);
  const navigate = useNavigate();

  const location = useLocation();
  const [searchParams] = useSearchParams(location.search);
  const nftSymbol = searchParams.get("nft-symbol");
  const nftIndex = searchParams.get("nft-index");

  const getBalanceOfNft = async (symbol: string) => {
    // @ts-ignore
    const { data }: { data: { balance: number } } =
      await sideChainSmartContract?.callViewMethod("getBalance", {
        symbol: symbol,
        owner: currentWalletAddress,
      });
    setNftBalance(Number(data.balance));
  };

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
    if (nftSymbol && sideChainSmartContract) {
      getBalanceOfNft(nftSymbol);
    }
  }, [nftSymbol,sideChainSmartContract]);

  //Step D - Configure NFT Form
  const form = useForm<z.infer<typeof formSchema>>({});
  
  const transferNftToOtherAccount = async (values: {
    address: string;
    amount: number;
    memo: string;
  }) => {
    if(Number(values.amount) > nftBalance){
      toast.error("Amount must be Less than or Equal to Supply Balance");
      return
    }
    //Step F - Write NFT Transfer Logic
    const transferNFTLoadingId = toast.loading(
      "Transfer Transaction Executing"
    );
    try {
      const transferNtfInput = {
        to: values.address,
        symbol: nftSymbol,
        amount: +values.amount,
        memo: values.memo,
      };
      await sideChainSmartContract?.callSendMethod(
        "Transfer",
        currentWalletAddress,
        transferNtfInput
      );
      toast.update(transferNFTLoadingId, {
        render: "NFT Transferred Successfully!",
        type: "success",
        isLoading: false,
      });
      removeNotification(transferNFTLoadingId);
      handleReturnClick();
    } catch (error: any) {
      console.error(error.message, "=====error");
      toast.error(error.message);
    }
  };

  //Step E - Write Create NFT Logic
  function onSubmit(values: z.infer<typeof formSchema>) {
    transferNftToOtherAccount(values);
  }

  const nftDetails = NFT_IMAGES[nftIndex ? Number(nftIndex) : 0];

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div className="form-content">
          <h2 className="form-title">Transfer NFT</h2>
          <div className="nft-card">
            <img src={nftDetails} alt={"nft- image"} />
            <div className="nft-details">
              <p>Symbol: <strong>{nftSymbol}</strong></p>
              <p>Supply Balance: <strong>{nftBalance}</strong></p>
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 proposal-form"
            >
              <div className="input-group">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address ( Receiver )</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the wallet address of receiver"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="input-group">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the Amount"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="input-group">
                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>memo</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the memo" {...field} />
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
                  Cancel
                </button>
                <Button type="submit" className="submit-btn">
                  Transfer NFT
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default TransferNftPage;
