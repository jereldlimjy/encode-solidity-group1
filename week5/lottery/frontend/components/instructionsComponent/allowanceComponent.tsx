import { useAccount, useContractRead, useContractWrite } from "wagmi";
import * as lotteryTokenJson from "./LotteryToken.json";
import React from "react";
import styles from "./instructionsComponent.module.css";

function AllowanceComponent() {
  const MAX_UINT256 =
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

  const account = useAccount();
  const userAddress = account?.address || "";

  const {
    data: allowanceData,
    isError,
    isLoading,
  } = useContractRead({
    address: "0x8837FAE5dD65C47eee7aa3D6E74e3F95ce6aa565",
    abi: lotteryTokenJson.abi,
    functionName: "allowance",
    args: [userAddress, "0xe64fdd883f2a39cac2211671a34e216eaacb2e34"],
  });

  const {
    write: approve,
    isLoading: isApproving,
    error: approveError,
  } = useContractWrite({
    address: "0x8837FAE5dD65C47eee7aa3D6E74e3F95ce6aa565",
    abi: lotteryTokenJson.abi,
    functionName: "approve",
  });

  const handleApprove = async () => {
    try {
      await approve({
        args: ["0xe64fdd883f2a39cac2211671a34e216eaacb2e34", MAX_UINT256],
      });
    } catch (err) {
      console.error("Error approving tokens:", err);
    }
  };

  let formattedAllowance = "0";

  if (typeof allowanceData === "bigint") {
    formattedAllowance = formatBigIntToDecimal(allowanceData);
  }

  return (
    <div>
      {isLoading ? (
        <div>Fetching allowance…</div>
      ) : isError ? (
        <div>Error fetching allowance</div>
      ) : (
        <>
          <div>Token allowance: {formattedAllowance}</div>
          <button
            className={styles.button}
            onClick={handleApprove}
            disabled={isApproving}
          >
            Approve Token Spending
          </button>
          {isApproving && <div>Transaction is being processed...</div>}
          {approveError && (
            <div>
              Error:{" "}
              {approveError?.message || "An error occurred during approval"}
            </div>
          )}
        </>
      )}
    </div>
  );
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

export default AllowanceComponent;
