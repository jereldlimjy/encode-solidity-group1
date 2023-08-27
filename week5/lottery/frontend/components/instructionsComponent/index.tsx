import styles from "./instructionsComponent.module.css";
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  useBlockNumber,
  usePublicClient,
} from "wagmi";
import { useEffect, useMemo, useState } from "react";
import * as lotteryJson from "./Lottery.json";
import * as lotteryTokenJson from "./LotteryToken.json";
import { parseEther } from "viem";
import CloseBetsComponent from "./closeBetsComponent";
import OpenBetsComponent from "./openBetsComponent";
import AllowanceComponent from "./allowanceComponent";
import BetComponent from "./betComponent";

export default function InstructionsComponent() {
  return (
    <div className={styles.container}>
      <header className={styles.header_container}>
        <div className={styles.header}>
          <h1>
            <span>Group-1 Lottery dApp</span>
          </h1>
        </div>
      </header>
      <p className={styles.get_started}>
        <PageBody></PageBody>
      </p>
    </div>
  );
}

function PageBody() {
  return (
    <div>
      <LotteryState></LotteryState>
      <LotteryInfo></LotteryInfo>
      <PurchaseToken></PurchaseToken>
      <OpenBetsComponent></OpenBetsComponent>
      <CloseBetsComponent></CloseBetsComponent>
      <AllowanceComponent></AllowanceComponent>
      <BetComponent></BetComponent>
    </div>
  );
}

function LotteryInfo() {
  const { address, isConnecting, isDisconnected } = useAccount();

  if (address)
    return (
      <div>
        <WalletBalance address={address}></WalletBalance>
        <TokenName></TokenName>
        <TokenBalance address={address}></TokenBalance>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function LotteryState() {
  const [closingTimeDate, setClosingTimeDate] = useState<Date | null>(null);

  // Use the hook to get the current block number
  const blockNumberResponse = useBlockNumber();
  const currentBlock = blockNumberResponse.data;

  // Fetch the lottery state
  const lotteryStateResponse = useContractRead({
    address: "0xe64fdD883F2a39cAC2211671a34E216eAaCB2E34", // Update this with your contract's address
    abi: lotteryJson.abi, // Update this with your contract's ABI
    functionName: "betsOpen",
  });

  const lotteryState = useMemo(() => {
    if (lotteryStateResponse.data) {
      return <span className={styles.open}>open</span>;
    } else {
      return <span className={styles.closed}>closed</span>;
    }
  }, [lotteryStateResponse.data]);

  // Fetch the lottery's closing time
  const closingTimeResponse = useContractRead({
    address: "0xe64fdD883F2a39cAC2211671a34E216eAaCB2E34", // Update this with your contract's address
    abi: lotteryJson.abi, // Update this with your contract's ABI
    functionName: "betsClosingTime",
  });

  useEffect(() => {
    if (closingTimeResponse.data) {
      setClosingTimeDate(new Date(Number(closingTimeResponse.data) * 1000));
    }
  }, [closingTimeResponse.data]);

  return (
    <div>
      <p>The lottery is currently {lotteryState}</p>
      {currentBlock ? (
        <p>The current block number is {currentBlock.toString()}</p>
      ) : null}
      {closingTimeDate && (
        <p>
          The lottery should close at {closingTimeDate.toLocaleDateString()} :{" "}
          {closingTimeDate.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

function WalletBalance(params: { address: any }) {
  const { data, isError, isLoading } = useBalance({ address: params.address });
  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div>
      ETH Balance: {data?.formatted} {data?.symbol}
    </div>
  );
}

function TokenName() {
  const { data, isError, isLoading } = useContractRead({
    address: "0x8837FAE5dD65C47eee7aa3D6E74e3F95ce6aa565",
    abi: lotteryTokenJson.abi,
    functionName: "symbol",
  });

  const symbol = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>You need {symbol} token to play the lottery</div>;
}

// My own custom function to convert bigint to decimals

function formatBigIntToDecimal(bigintValue: bigint, decimals: number = 18) {
  let balanceStr = bigintValue.toString();

  // Ensure the balance string has enough zeroes for decimals
  while (balanceStr.length < decimals + 1) {
    balanceStr = "0" + balanceStr;
  }

  // Insert a decimal point
  const integerPart = balanceStr.slice(0, -decimals);
  const decimalPart = balanceStr.slice(-decimals);

  // You can further truncate or round the decimal part if you wish
  // For now, this will return the full precision
  return integerPart + "." + decimalPart;
}

function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useContractRead({
    address: "0x8837FAE5dD65C47eee7aa3D6E74e3F95ce6aa565",
    abi: lotteryTokenJson.abi,
    functionName: "balanceOf",
    args: [params.address],
  });

  const balance = typeof data === "bigint" ? formatBigIntToDecimal(data) : "0";
  //const balance = typeof data === "number" ? data : 0;

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return <div>Token balance: {balance}</div>;
}

function PurchaseToken() {
  const { write, isLoading, isSuccess, data, isError, error } =
    useContractWrite({
      address: "0xe64fdD883F2a39cAC2211671a34E216eAaCB2E34",
      abi: lotteryJson.abi,
      functionName: "purchaseTokens",
    });

  const handlePurchase = async () => {
    try {
      write({ value: parseEther("0.01") });
      // You can specify other transaction details if necessary, like gasPrice, gasLimit, etc.
    } catch (error) {
      console.error("Error while purchasing tokens:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <div>
      <button
        className={styles.button}
        disabled={isLoading}
        onClick={handlePurchase}
      >
        Purchase Tokens
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
