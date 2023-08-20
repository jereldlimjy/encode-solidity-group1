"use client";

import { useEffect, useState } from "react";
import styles from "./vote.module.css";
import { ethers } from "ethers";
import { useAccount, useContractWrite } from "wagmi";
import * as tokenizedBallotJson from "./TokenizedBallot.json";

export default function Vote() {
  const { address, isDisconnected } = useAccount();
  const [proposals, setProposals] = useState<
    Array<{ name: string; voteCount: string }>
  >([]);
  const [tokenizedBallotAddress, setTokenizedBallotAddress] = useState<
    string | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:3001/get-proposals")
      .then((res) => res.json())
      .then((data) => {
        setProposals(data.result);
      });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("http://localhost:3001/get-tokenized-ballot-address")
      .then((res) => res.json())
      .then((data) => {
        setTokenizedBallotAddress(data.address);
      });
  });

  return (
    <div className={styles.container}>
      <Table loading={loading} proposals={proposals} />
      <CastVotes
        proposals={proposals}
        address={address}
        isDisconnected={isDisconnected}
        contractAddress={tokenizedBallotAddress}
      />
      <DelegateVotes />
      <MintTokens />
    </div>
  );
}

function Table({
  loading,
  proposals,
}: {
  loading: boolean;
  proposals: Array<{ name: string; voteCount: string }>;
}) {
  if (loading) return <h2>Loading...</h2>;
  if (!proposals) return <h2>No results available :(</h2>;

  return (
    <div>
      <h1>Results</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Proposal Name</th>
            <th>Vote Units</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal, index) => (
            <tr key={index}>
              <td>{proposal.name}</td>
              <td>{ethers.formatEther(proposal.voteCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CastVotes({
  proposals,
  address,
  isDisconnected,
  contractAddress,
}: {
  proposals: Array<{ name: string; voteCount: string }>;
  address: string | undefined;
  isDisconnected: boolean;
  contractAddress: string | undefined;
}) {
  const [selectedProposal, setSelectedProposal] = useState<number>(0);
  const [voteAmount, setVoteAmount] = useState<string>("");
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: tokenizedBallotJson.abi,
    functionName: "vote",
    args: [
      selectedProposal.toString(),
      ethers.parseUnits(voteAmount || "0").toString(),
    ],
  });

  const handleChange = (event: any) => {
    setSelectedProposal(event.target.value);
  };

  const handleClick = async () => {
    if (
      !contractAddress ||
      selectedProposal >= proposals.length ||
      !address ||
      isDisconnected
    )
      return;

    write();
  };

  const handleAmountChange = (event: any) => {
    setVoteAmount(event.target.value);
  };

  return (
    <div className={styles.castVotesContainer}>
      <h1 className={styles.title}>Cast Votes</h1>

      <select
        className={styles.select}
        value={selectedProposal}
        onChange={handleChange}
      >
        {proposals.map((proposal, index) => (
          <option value={index} className={styles.option}>
            {proposal.name}
          </option>
        ))}
      </select>

      <input
        className={styles.numberInput}
        type="number"
        onChange={handleAmountChange}
        value={voteAmount}
        placeholder="Vote Amount (in ETH)"
      />

      <button className={styles.button} onClick={handleClick}>
        Cast Votes
      </button>

      {isLoading && <span>Casting votes...</span>}
      {isSuccess && <span>Successfully casted votes!</span>}
    </div>
  );
}

function DelegateVotes() {
  return <h1>Delegate Votes</h1>;
}

function MintTokens() {
  return <h1>Mint Tokens</h1>;
}
