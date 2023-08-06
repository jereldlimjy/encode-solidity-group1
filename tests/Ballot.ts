import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import exp from "constants";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.encodeBytes32String(array[index]));
  }
  return bytes32Array;
}

async function deployContract() {
  const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotContract = await ballotFactory.deploy(
    PROPOSALS.map(ethers.encodeBytes32String)
  );
  await ballotContract.waitForDeployment();
  return ballotContract;
}

describe("Ballot", async () => {
  let ballotContract: Ballot;
  let accounts: HardhatEthersSigner[];
  beforeEach(async () => {
    ballotContract = await loadFixture(deployContract);
    accounts = await ethers.getSigners();
  });
  describe("when the contract is deployed", async () => {
    /*
    beforeEach(async () => {
      ballotContract = await loadFixture(deployContract);
      accounts = await ethers.getSigners();
    });
    */
    it("has the provided proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.decodeBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }

      /*
      const ballotContract = await ballotFactory.deploy(
        PROPOSALS.map(ethers.encodeBytes32String)
      );
      */
    });
    it("has zero votes for all proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.eq(0);
      }
    });
    it("sets the deployer address as chairperson", async () => {
      const deployerAddress = accounts[0].address;

      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(deployerAddress);
    });
    it("sets the voting weight for the chairperson as 1", async () => {
      const deployerAddress = accounts[0].address;
      const chairpersonVoter = await ballotContract.voters(deployerAddress);
      expect(chairpersonVoter.weight).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    /*
    beforeEach(async () => {
      ballotContract = await loadFixture(deployContract);
      accounts = await ethers.getSigners();
    });
    */
    it("gives right to vote for another address", async () => {
      const recipientAddress = accounts[1].address;

      //chairperson giving rights to vote
      await ballotContract.giveRightToVote(recipientAddress);

      //checking the weight of recipient
      const recipientVoter = await ballotContract.voters(recipientAddress);
      expect(recipientVoter.weight).to.eq(1);
    });
    it("can not give right to vote for someone that has voted", async () => {
      const recipientAddress = accounts[1].address;

      // Give right to vote and make them vote
      await ballotContract.giveRightToVote(recipientAddress);
      await ballotContract.connect(accounts[1]).vote(0);

      //attempt to give right to vote again to the same address
      await expect(ballotContract.giveRightToVote(recipientAddress)).to.be
        .reverted;
    });

    it("can not give right to vote for someone that has already voting rights", async () => {
      const recipientAddress = accounts[1].address;

      // Give right to vote
      await ballotContract.giveRightToVote(recipientAddress);

      //attempt to give right to vote again
      await expect(ballotContract.giveRightToVote(recipientAddress)).to.be
        .reverted;
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    /*
    beforeEach(async () => {
      ballotContract = await loadFixture(deployContract);
      accounts = await ethers.getSigners();
    });
    */
    it("should register the vote", async () => {
      const voterAddress = accounts[1].address;
      const proposalIndex = 0;

      // Give right to vote and make them vote
      await ballotContract.giveRightToVote(voterAddress);
      await ballotContract.connect(accounts[1]).vote(proposalIndex);

      // Retrieve the proposal and check the vote count
      const proposal = await ballotContract.proposals(proposalIndex);
      expect(proposal.voteCount).to.eq(1);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    it("should transfer voting power", async () => {
      /*
      ballotContract = await loadFixture(deployContract);
      accounts = await ethers.getSigners();
    */

      const delegatorAddress = accounts[1].address;
      const delegateeAddress = accounts[2].address;

      // Give right to vote to both addresses
      await ballotContract.giveRightToVote(delegatorAddress);
      await ballotContract.giveRightToVote(delegateeAddress);

      // Connect to the delegator's account and delegate to the delegatee
      await ballotContract.connect(accounts[1]).delegate(delegateeAddress);

      // Retrieve the voters and check their weights
      const delegator = await ballotContract.voters(delegatorAddress);
      const delegatee = await ballotContract.voters(delegateeAddress);

      expect(delegator.delegate).to.eq(delegateeAddress); // check if the delegate is set properly
      expect(delegatee.weight).to.eq(2); // delegatee's weight should be incremented by 1
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("should revert", async () => {
      /*
      ballotContract = await loadFixture(deployContract);
      accounts = await ethers.getSigners();
    */

      const account2 = accounts[2].address;

      await expect(
        ballotContract.connect(accounts[1]).giveRightToVote(account2)
      ).to.be.reverted;
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      await expect(ballotContract.connect(accounts[1]).vote(0)).to.be.reverted;
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    it("should revert", async () => {
      await expect(
        ballotContract.connect(accounts[1]).delegate(accounts[2].address)
      ).to.be.reverted;
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    it("should return 0", async () => {
      // Check the winning proposal
      const winningProposal_ = await ballotContract.winningProposal();

      // Expect the winning proposal to be 0 since no votes have been cast
      expect(winningProposal_).to.equal(0);
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    it("should return 0", async () => {
      const voterAddress = accounts[1].address;

      // Give right to vote to the voter
      await ballotContract.giveRightToVote(voterAddress);

      // Voter casts a vote for the first proposal (index 0)
      await ballotContract.connect(accounts[1]).vote(0);

      // Check the winning proposal index
      const winningProposalIndex = await ballotContract.winningProposal();
      expect(winningProposalIndex).to.eq(0);
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    // Call the winnerName function
    it("should return name of proposal 0", async () => {
      const winnerName = await ballotContract.winnerName();
      expect(ethers.decodeBytes32String(winnerName)).to.eq(PROPOSALS[0]);
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    it("should return name of proposal 0", async () => {
      //cast vote on first proposal
      await ballotContract.connect(accounts[0]).vote(0);

      const winnerName = await ballotContract.winnerName();
      expect(ethers.decodeBytes32String(winnerName)).to.eq(PROPOSALS[0]);
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    // TODO
    it("should return the name of the winner proposal", async () => {
      //define 4 address, account[0] will be the deployer
      const account1 = accounts[1].address;
      const account2 = accounts[2].address;
      const account3 = accounts[3].address;
      const account4 = accounts[4].address;

      //give right to vote
      await ballotContract.giveRightToVote(account1);
      await ballotContract.giveRightToVote(account2);
      await ballotContract.giveRightToVote(account3);
      await ballotContract.giveRightToVote(account4);

      //cast 5 votes
      await ballotContract.connect(accounts[0]).vote(0);
      await ballotContract.connect(accounts[1]).vote(2);
      await ballotContract.connect(accounts[2]).vote(1);
      await ballotContract.connect(accounts[3]).vote(2);
      await ballotContract.connect(accounts[4]).vote(2);

      const winnerName = await ballotContract.winnerName();

      //winner should be propsal 3 with 3 votes
      expect(ethers.decodeBytes32String(winnerName)).to.eq(PROPOSALS[2]);
    });
  });
});
