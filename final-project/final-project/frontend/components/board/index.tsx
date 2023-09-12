import { useState, useEffect } from "react";
import pinataSDK from "@pinata/sdk";
import { useAccount, useContractWrite } from "wagmi";
import * as etherBoardV2Json from "./EtherBoardV2.json";

interface NFT {
  id: string;
  message: string;
}

export default function Board() {
  const [message, setMessage] = useState<string>("");
  const [cid, setCid] = useState<string | null>(null);
  const [ipfsstatusMessage, setipfsStatusMessage] = useState<string | null>(
    null
  );
  const [NFTs, setNFTs] = useState<NFT[]>([]);
  const { address } = useAccount();
  const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
  const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
  const ETHERBOARD_ADDRESS = "0xa1181e7eeA73969d87E53A144C9d519453f8921C";

  useEffect(() => {
    const getNFTs = async () => {
      try {
        const res = await fetch("http://localhost:3001/get-nfts");
        const NFTs = await res.json();
        setNFTs(NFTs);
      } catch (err) {}
    };

    getNFTs();
  });

  const { write, isLoading, isSuccess, data } = useContractWrite({
    address: ETHERBOARD_ADDRESS,
    abi: etherBoardV2Json.abi,
    functionName: "safeMint",
  });

  async function handleMint() {
    setipfsStatusMessage("Uploading to IPFS...");

    const metadata = {
      message: message,
    };

    try {
      const result = await pinata.pinJSONToIPFS(metadata);
      setipfsStatusMessage(
        `Successfully uploaded to IPFS with CID: ${result.IpfsHash}`
      );
      setCid(result.IpfsHash);

      console.log("Initiating NFT Minting...");
      const nftURI = `https://ipfs.io/ipfs/${result.IpfsHash}`;
      if (!address) {
        console.error("Account is not defined");
        return;
      }
      write({
        args: [address, nftURI, message],
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div>
      <textarea
        className="block border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue w-full sm:w-1/2"
        rows={4}
        placeholder="Type your message here!"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        className="mt-4 bg-purple hover:bg-dark-purple text-white font-bold py-2 px-4 rounded"
        onClick={handleMint}
        disabled={!message || !address || isLoading}
      >
        Mint Message
      </button>
      <div className="mt-2 text-gray-600">{ipfsstatusMessage}</div>
      {isLoading && <div>Minting...</div>}
      {isSuccess && <div>Minted successfully: {JSON.stringify(data)}</div>}
      <hr className="border-1 rounded my-8 border-blue" />
    </div>
  );
}
