"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IPortkeyProvider, MethodsBase } from "@portkey/provider-types";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import "./CreateProposal.css";
import useDAOSmartContract from "./useDAOSmartContract";
import detectProvider from "@portkey/detect-provider";

interface IProposalInput {
  creator: string;
  title: string;
  description: string;
  voteThreshold: number;
}

const formSchema = z.object({
  address: z.string(),
  title: z.string(),
  description: z.string(),
  voteThreshold: z.coerce.number(),
});

export default function CreateProposal() {
  const [provider, setProvider] = useState<IPortkeyProvider | null>(null);
  const [createProposalInput, setCreateProposalInput] =
    useState<IProposalInput>();
  const DAOContract = useDAOSmartContract(provider);

  const navigate = useNavigate();
  const location = useLocation();

  const { currentWalletAddress } = location.state;

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

  //Step D - Configure Proposal Form
  const form = useForm<z.infer<typeof formSchema>>({});

  //Step E - Write Create Proposal Logic
  function onSubmit(values: z.infer<typeof formSchema>) {}

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div className="form-content">
          <h2 className="form-title">Create Proposal</h2>
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
                      <FormLabel>Title</FormLabel>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter Proposal Description"
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
                  name="voteThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vote Threshold</FormLabel>
                      <FormControl>
                        <Input placeholder="Set Vote Threshold" {...field} />
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
                <button type="submit" className="submit-btn">
                  Submit
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
