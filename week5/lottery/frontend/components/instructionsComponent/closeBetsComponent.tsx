import { useContractWrite } from "wagmi";
import * as lotteryJson from "./Lottery.json";
import styles from "./instructionsComponent.module.css";

function CloseBetsComponent() {
  const { write, isLoading, isSuccess, data, isError, error } =
    useContractWrite({
      address: "0xe64fdD883F2a39cAC2211671a34E216eAaCB2E34",
      abi: lotteryJson.abi,
      functionName: "closeLottery",
    });

  const handleCloseBets = async () => {
    try {
      write();
    } catch (err) {
      console.error("Error closing bets:", err);
    }
  };

  return (
    <div>
      <button
        className={styles.button}
        disabled={isLoading}
        onClick={handleCloseBets}
      >
        Close Bets
      </button>
      {isLoading && (
        <div>Transaction is being processed. Check your wallet.</div>
      )}
      {isSuccess && <div>Transaction Successful: {JSON.stringify(data)}</div>}
      {isError && <div>Error: {error?.message || "An error occurred"}</div>}
    </div>
  );
}

export default CloseBetsComponent;
