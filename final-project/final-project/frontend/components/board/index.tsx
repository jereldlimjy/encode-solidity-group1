import { useState, useEffect } from "react";
import pinataSDK from "@pinata/sdk";
import { useAccount, useContractWrite } from "wagmi";
import etherBoardV2Json from "./EtherBoardV2.json";

interface NFT {
  id: string;
  message: string;
}

export default function Board() {
  const [message, setMessage] = useState<string>("");
  const [ipfsstatusMessage, setIpfsStatusMessage] = useState<string | null>(
    null
  );
  const [NFTs, setNFTs] = useState<NFT[]>([]);
  const [showMyNFTs, setShowMyNFTs] = useState(() => {
    return localStorage.getItem("showMyNFTs") === "true";
  });
  const [isFetchingNFTs, setIsFetchingNFTs] = useState<boolean>(true);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const { address } = useAccount();
  const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
  const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
  const ETHERBOARD_ADDRESS = "0xa1181e7eeA73969d87E53A144C9d519453f8921C";

  useEffect(() => {
    localStorage.setItem("showMyNFTs", showMyNFTs.toString());
  }, [showMyNFTs]);

  useEffect(() => {
    const getNFTs = async () => {
      setIsFetchingNFTs(true);
      let apiEndpoint = "http://localhost:3001/get-nfts";
      if (showMyNFTs && address) {
        apiEndpoint += `-by-owner?address=${address}`;
      }

      try {
        const res = await fetch(apiEndpoint);
        const NFTs = await res.json();
        setNFTs(NFTs);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
      } finally {
        setIsFetchingNFTs(false);
      }
    };

    getNFTs();
  }, [showMyNFTs, address]);

  const { write, isLoading, isSuccess, data } = useContractWrite({
    address: ETHERBOARD_ADDRESS,
    abi: etherBoardV2Json.abi,
    functionName: "safeMint",
  });

  async function handleMint() {
    setIsMinting(true);
    setIpfsStatusMessage("Uploading to IPFS...");

    const metadata = {
      message: message,
    };

    try {
      const result = await pinata.pinJSONToIPFS(metadata);
      setIpfsStatusMessage(
        `Successfully uploaded to IPFS with CID: ${result.IpfsHash}`
      );

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
      setIpfsStatusMessage("An error occurred, please try again!");
    } finally {
      setIsMinting(false);
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
        className="mt-4 bg-purple hover:bg-dark-purple text-white font-bold py-2 px-4 rounded disabled:bg-gray-300"
        onClick={handleMint}
        disabled={!message || !address || isLoading || isMinting}
      >
        Mint Message
      </button>
      <div className="mt-2 text-gray-600">{ipfsstatusMessage}</div>
      {isLoading && <div>Minting... (Tx approval required)</div>}
      {isSuccess && !isMinting && (
        <div>Minted successfully: {JSON.stringify(data)}</div>
      )}

      <hr className="border-1 rounded my-8 border-blue" />

      <label className="inline-flex items-center mt-3">
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-blue-600"
          checked={showMyNFTs}
          onChange={(e) => setShowMyNFTs(e.target.checked)}
        />
        <span className="ml-2 text-gray-700">Show only my NFTs</span>
      </label>

      {/* board */}
      <div className="bg-slate-light border-4 border-neon-blue rounded-md h-[500px] min-w-full p-4 overflow-y-auto">
        {NFTs.length ? (
          <ul>
            {NFTs.map((nft, index) => (
              <li
                key={index}
                className="rounded flex flex-col place-content-between"
              >
                <p>{nft.message}</p>
                <p>#{nft.id}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-lg">
              {isFetchingNFTs
                ? "Loading messages..."
                : "Board is looking empty... mint a message!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
