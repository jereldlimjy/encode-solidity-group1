import { useAccount, useContractRead } from "wagmi";
import * as lotteryContractJson from "./Lottery.json";
import React from "react";

function fetchPrizeComponent() {
  const account = useAccount();
  const userAddress = account?.address || "";

  const { data, isError, isLoading } = useContractRead({
    address: "0xe64fdd883f2a39cac2211671a34e216eaacb2e34", // Address of the lottery contract
    abi: lotteryContractJson.abi,
    functionName: "prize",
    args: [userAddress],
  });

  let formattedPrize = "0";
  if (typeof data === "bigint") {
    formattedPrize = formatBigIntToDecimal(data); // Assuming 'ether' is the standard 18 decimals. Adjust if different.
  }

  if (isLoading) return <div>Fetching prize…</div>;
  if (isError) return <div>Error fetching prize</div>;

  return <div>Your prize: {formattedPrize} DGL</div>;
}

function formatBigIntToDecimal(
  value: bigint,
  decimals = 18,
  displayDecimals = 2
): string {
  const scaleFactor = BigInt(`1${"0".repeat(decimals)}`);
  const integerPart = value / scaleFactor;
  const fractionalPart = value % scaleFactor;
  const formattedFraction = fractionalPart
    .toString()
    .padStart(decimals, "0")
    .substr(0, displayDecimals);
  return `${integerPart}.${formattedFraction}`;
}

export default fetchPrizeComponent;
