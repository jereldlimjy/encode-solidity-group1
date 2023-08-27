import { useContractWrite, usePublicClient } from "wagmi";
import * as lotteryJson from "./Lottery.json";
import { useEffect, useState } from "react";
import styles from "./instructionsComponent.module.css";

function OpenBetsComponent() {
  const { write, isLoading, isSuccess, data, isError, error } =
    useContractWrite({
      address: "0xe64fdD883F2a39cAC2211671a34E216eAaCB2E34",
      abi: lotteryJson.abi,
      functionName: "openBets",
    });

  const blockDetails = useBlock();
  const currentTimestamp = blockDetails?.timestamp;

  const [duration, setDuration] = useState("");

  const handleOpenBets = async () => {
    if (currentTimestamp) {
      try {
        const finalValue = Number(currentTimestamp) + Number(duration);
        write({ args: [finalValue] });
      } catch (err) {
        console.error("Error opening bets:", err);
      }
    }
  };

  return (
    <div>
      <input
        className={styles.numberInput}
        type="text"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Enter duration (seconds)"
      />
      <button
        className={styles.button}
        disabled={isLoading}
        onClick={handleOpenBets}
      >
        Open Bets
      </button>
      {isLoading && (
        <div>Transaction is being processed. Check your wallet.</div>
      )}
      {isSuccess && <div>Transaction Successful: {JSON.stringify(data)}</div>}
      {isError && <div>Error: {error?.message || "An error occurred"}</div>}
    </div>
  );
}

function useBlock() {
  const client = usePublicClient();
  const [block, setBlock] = useState<any>(null);

  useEffect(() => {
    async function fetchBlock() {
      try {
        const fetchedBlock = await client.getBlock();
        setBlock(fetchedBlock);
      } catch (error) {
        console.error("Error fetching block:", error);
      }
    }

    fetchBlock();
  }, [client]);

  return block;
}

export default OpenBetsComponent;
