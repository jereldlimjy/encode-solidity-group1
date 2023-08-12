import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

export default function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}
