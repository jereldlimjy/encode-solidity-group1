import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { decodeBytes32String, toNumber } from "ethers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3", "Proposal 4"];

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

  describe("when the contract is deployed", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("has the provided proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.decodeBytes32String(proposal.name)).to.equal(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.equal(0);
      }
    });

    it("sets the voting weight for the chairperson as 1", async () => {
      const deployerAddress = accounts[0].address;
      const chairpersonVoter = await ballotContract.voters(deployerAddress);
      expect(chairpersonVoter.weight).to.equal(1);
    });

    it("sets the deployer address as chairperson", async () => {
      const deployerAddress = accounts[0].address;
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.equal(deployerAddress);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("gives right to vote for another address", async () => {
      const voterAddress = accounts[1].address;
      await ballotContract.giveRightToVote(voterAddress);
      const voter = await ballotContract.voters(voterAddress);
      expect(voter.weight).to.equal(1);
    });

    it("can not give right to vote for someone that has voted", async () => {
      const deployerAddress = accounts[0].address;
      await ballotContract.vote(0);
      await expect(
        ballotContract.giveRightToVote(deployerAddress)
      ).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that has already voting rights", async () => {
      const deployerAddress = accounts[0].address;
      await expect(ballotContract.giveRightToVote(deployerAddress)).to.be
        .reverted;
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should register the vote", async () => {
      const voterAddress = accounts[1].address;
      await ballotContract.giveRightToVote(voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      const voteCount = (await ballotContract.proposals(0)).voteCount;
      expect(voteCount).to.equal(1);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should transfer voting power", async () => {
      const deployerAddress = accounts[0].address;
      const voterAddress = accounts[1].address;
      await ballotContract.giveRightToVote(voterAddress);
      await ballotContract.connect(accounts[1]).delegate(deployerAddress);
      const chairperson = await ballotContract.voters(deployerAddress);
      expect(chairperson.weight).to.equal(2);
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should revert", async () => {
      await expect(
        ballotContract.connect(accounts[1]).giveRightToVote(accounts[2].address)
      ).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should revert", async () => {
      await expect(
        ballotContract.connect(accounts[1]).vote(0)
      ).to.be.revertedWith("Has no right to vote");
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should revert", async () => {
      await expect(
        ballotContract.connect(accounts[1]).delegate(accounts[2].address)
      ).to.be.revertedWith("You have no right to vote");
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should return 0", async () => {
      expect(await ballotContract.winningProposal()).to.be.equal(0);
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should return 0", async () => {
      // cast 1 vote for first proposal
      await ballotContract.vote(0);
      expect(await ballotContract.winningProposal()).to.be.equal(0);
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should return name of proposal 0", async () => {
      expect(
        decodeBytes32String(await ballotContract.winnerName())
      ).to.be.equal(PROPOSALS[0]);
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should return name of proposal 0", async () => {
      await ballotContract.vote(0);
      expect(
        decodeBytes32String(await ballotContract.winnerName())
      ).to.be.equal(PROPOSALS[0]);
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    beforeEach(async () => {
      ballotContract = await deployContract();
      accounts = await ethers.getSigners();
    });

    it("should return the name of the winner proposal", async () => {
      const proposalsLen = PROPOSALS.length;
      let highestVoteCount = 0;
      let proposalNameWithHigestVotes = PROPOSALS[0];

      // have 5 accounts vote randomly
      for (let i = 0; i < 5; i++) {
        const currAccount = accounts[i];
        const randomIndex = Math.floor(Math.random() * proposalsLen);

        // give right to vote
        if (i > 0) {
          await ballotContract.giveRightToVote(currAccount);
        }

        await ballotContract.connect(currAccount).vote(randomIndex);
      }

      // get highest voteCount
      for (let i = 0; i < proposalsLen; i++) {
        const proposal = await ballotContract.proposals(i);
        if (proposal.voteCount > highestVoteCount) {
          highestVoteCount = toNumber(proposal.voteCount);
          proposalNameWithHigestVotes = proposal.name;
        }
      }

      expect(await ballotContract.winnerName()).to.be.equal(
        proposalNameWithHigestVotes
      );
    });
  });
});
