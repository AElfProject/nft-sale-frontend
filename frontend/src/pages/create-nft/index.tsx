"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { MethodsBase, IPortkeyProvider } from "@portkey/provider-types";
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
// import useNFTSmartContract from "@/useNFTSmartContract";

const formSchema = z.object({
  name: z.string(),
  symbol: z.string(),
});

interface INftInput {}

const CreateNftPage = ({
  currentWalletAddress,
}: {
  currentWalletAddress: string;
}) => {
  const [provider, setProvider] = useState<IPortkeyProvider | null>(null);
  const nftContract = useNFTSmartContract(provider);
  const [hash, setHash] = useState<any>();
  const navigate = useNavigate();

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

  const createNewNft = async (nftName: string, symbol: string) => {
    //Step F - Write Vote Yes Logic
    try {
      const createNtfInput: INftInput = {
        name: nftName,
        symbol: symbol,
      };
console.log("createNtfInput",createNtfInput)
      await nftContract?.callSendMethod(
        "CreateNFTToken",
        currentWalletAddress,
        createNtfInput
      );
      alert("New Nft Created");
      setHash(true);
    } catch (error:any) {
      console.error(error.message, "=====error");
      if(error.message.includes("You closed")){
         alert("You Rejected Transaction")
      }
    }
  };

  //Step D - Configure NFT Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
    },
  });

  //Step E - Write Create NFT Logic
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values", values);
    createNewNft(values.name,values.symbol)
  }

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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NFT Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Title for Proposal"
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
              <div className="button-container">
                <button
                  type="button"
                  className="return-btn"
                  onClick={handleReturnClick}
                >
                  Return
                </button>
                <Button type="submit" className="submit-btn">
                  Create
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
