import { useAccount, useContractWrite } from "wagmi";
import * as lotteryContractJson from "./Lottery.json";
import React, { useState } from "react";

function BetComponent() {
  const account = useAccount();
  const userAddress = account?.address || "";

  const [times, setTimes] = useState("");
  const { write, isLoading, isSuccess, isError, data, error } =
    useContractWrite({
      address: "0xe64fdd883f2a39cac2211671a34e216eaacb2e34", // This should be the contract address for the lottery contract
      abi: lotteryContractJson.abi,
      functionName: "betMany",
    });

  const handleBet = async () => {
    try {
      await write({ args: [Number(times)] });
    } catch (err) {
      console.error("Error placing bets:", err);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={times}
        onChange={(e) => setTimes(e.target.value)}
        placeholder="Enter number of times to bet"
      />
      <button disabled={isLoading} onClick={handleBet}>
        Place Bet
      </button>
      {isLoading && (
        <div>Transaction is being processed. Check your wallet.</div>
      )}
      {isSuccess && <div>Transaction Successful: {JSON.stringify(data)}</div>}
      {isError && <div>Error: {error?.message || "An error occurred"}</div>}
    </div>
  );
}

export default BetComponent;
