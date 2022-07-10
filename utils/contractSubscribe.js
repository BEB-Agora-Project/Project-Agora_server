//컨트랙트 서브스크라이브 해서 이벤트 들어오면 DB에 반영하기
require("dotenv").config();
const Caver = require("caver-js");

const debateABI = require("../truffle/build/contracts/Debate.json").abi;
const erc1155ABI = require("../truffle/build/contracts/AgoraTokens.json").abi;
const { PROVIDER, ERC1155_ADDRESS, DEBATE_ADDRESS } = process.env;

const caver = new Caver(PROVIDER);

const ERC1155Contract = new caver.contract(erc1155ABI, ERC1155_ADDRESS);
const archiveContract = new caver.contract(debateABI, DEBATE_ADDRESS);

const options = { fromBlock: "latest" };
const callback = (err, event) => {
  if (!err) console.log(event);
  else console.log(err);
};

module.exports = {
  tokenReward: async () => {
    ERC1155Contract.events
      .MintedToken(options, callback)
      .on("connected", (subscriptionId) =>
        console.log("connected with ID", subscriptionId)
      )
      .on("data", (event) => console.log("event : ", event))
      .on("error", console.error);
    ERC1155Contract.events
      .BurnedToken(options, callback)
      .on("connected", (subscriptionId) =>
        console.log("connected with ID", subscriptionId)
      )
      .on("data", (event) => console.log("event : ", event))
      .on("error", console.error);
  },
  nftBuy: async () => {
    ERC1155Contract.events
      .UserNFTBuy(options, callback)
      .on("connected", (subscriptionId) =>
        console.log("connected with ID", subscriptionId)
      )
      .on("data", (event) => {
        console.log("event : ", event);
        //event 찍어보고 뭐들어오는지 보고 nft DB에 기록
      })
      .on("error", console.error);
    //블락 최신화..
  },
  archived: async () => {
    archiveContract.events
      .Archived(options, callback)
      .on("connected", (subscriptionId) =>
        console.log("connected with ID", subscriptionId)
      )
      .on("data", (event) => console.log("event : ", event))
      .on("error", console.error);
  },
};
