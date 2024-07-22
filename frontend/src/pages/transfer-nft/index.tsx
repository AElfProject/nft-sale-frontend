"use client";

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
import "./create-nft.scss";

import detectProvider from "@portkey/detect-provider";
import { Button } from "@/components/ui/button";
import { NFT_IMAGES } from "@/lib/constant";
// import useNFTSmartContract from "@/useNFTSmartContract";

const formSchema = z.object({
  address: z.string(),
  title: z.string(),
  symbol: z.string(),
});

const TransferNftPage = () => {
  const [provider, setProvider] = useState<IPortkeyProvider | null>(null);
  //   const nftContract = useNFTSmartContract(provider);

  const navigate = useNavigate();

  const location = useLocation();
  const [searchParams] = useSearchParams(location.search);
  const nftIndex = searchParams.get("nft-id");

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

  //Step D - Configure NFT Form
  const form = useForm<z.infer<typeof formSchema>>({});

  //Step E - Write Create NFT Logic
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values", values);
  }

  const nftDetails = NFT_IMAGES[nftIndex ? Number(nftIndex) : 0];

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div className="form-content">
          <h2 className="form-title">Transfer NFT</h2>
          <div className="nft-card">
            <img src={nftDetails} alt={"nft- image"} />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 proposal-form"
            >
              <div className="input-group">
                <FormField
                  control={form.control}
                  name="title"
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
