import { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import * as etherBoardV2Json from "./EtherBoardV2.json";

export default function OwnedNFTs() {
  const { address } = useAccount();
  const ETHERBOARD_ADDRESS = "0xa1181e7eeA73969d87E53A144C9d519453f8921C";
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [nftDetails, setNftDetails] = useState<any[]>([]);
  const [manualFetch, setManualFetch] = useState(false);

  const balanceOf = useContractRead({
    address: ETHERBOARD_ADDRESS,
    abi: etherBoardV2Json.abi,
    functionName: "balanceOf",
  });

  useEffect(() => {
    if (balanceOf.data && typeof balanceOf.data === "number") {
      const fetchTokenIdsAndDetails = async () => {
        console.log("Fetching Token IDs and Details...");
        const balance = balanceOf.data;
        console.log("Balance:", balance);

        const ids: number[] = [];
        const details: { tokenId: number; message: string }[] = [];

        for (let i = 0; i < (balance as number); i++) {
          const tokenIdResponse = await useContractRead({
            address: ETHERBOARD_ADDRESS,
            abi: etherBoardV2Json.abi,
            functionName: "tokenOfOwnerByIndex",
            args: [address, i],
          });
          console.log(`Token ID Response for index ${i}:`, tokenIdResponse);
          if (
            tokenIdResponse.data &&
            typeof tokenIdResponse.data === "number"
          ) {
            const tokenId = tokenIdResponse.data;
            ids.push(tokenId);

            const messageResponse = await useContractRead({
              address: ETHERBOARD_ADDRESS,
              abi: etherBoardV2Json.abi,
              functionName: "getMessageByTokenId",
              args: [tokenId],
            });

            if (
              messageResponse.data &&
              typeof messageResponse.data === "string"
            ) {
              details.push({ tokenId, message: messageResponse.data });
            }
          }
        }

        setTokenIds(ids);
        setNftDetails(details);
      };

      fetchTokenIdsAndDetails();

      // Reset manualFetch after running the logic
      if (manualFetch) setManualFetch(false);
    }
  }, [balanceOf.data, address, manualFetch]);

  return (
    <div>
      <h2>Your NFTs:</h2>
      <button onClick={() => setManualFetch(true)}>Fetch NFTs</button>
      <ul>
        {nftDetails.map((nft, index) => (
          <li key={index}>
            <div>
              <strong>Token ID:</strong> {nft.tokenId}
            </div>
            <div>
              <strong>Message:</strong> {nft.message}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
