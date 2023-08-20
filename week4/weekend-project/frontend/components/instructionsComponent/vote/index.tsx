"use client";

import { useEffect, useState } from "react";
import styles from "./vote.module.css";
import { ethers } from "ethers";
export default function Vote() {
  return (
    <div className={styles.container}>
      <Table />
    </div>
  );
}

function Table() {
  const [data, setData] = useState<Array<{ name: string; voteCount: string }>>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:3001/get-proposals")
      .then((res) => res.json())
      .then((data) => {
        setData(data.result);
      });
    setLoading(false);
  }, []);

  if (loading) return <h2>Loading...</h2>;
  if (!data) return <h2>No results available :(</h2>;

  return (
    <div>
      <h1>Results</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Proposal Name</th>
            <th>Vote Units</th>
          </tr>
        </thead>
        <tbody>
          {data.map((proposal, index) => (
            <tr key={index}>
              <td>{proposal.name}</td>
              <td>{ethers.formatEther(proposal.voteCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
