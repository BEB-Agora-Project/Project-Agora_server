//컨트랙트 서브스크라이브 해서 이벤트 들어오면 DB에 반영하기
require("dotenv").config();
const Caver = require("caver-js");

const debateABI = require("../truffle/build/contracts/Debate.json").abi;
const erc1155ABI = require("../truffle/build/contracts/AgoraTokens.json").abi;
const { WS_PROVIDER, ERC1155_ADDRESS, DEBATE_ADDRESS } = process.env;

const caver = new Caver(WS_PROVIDER);

const ERC1155Contract = new caver.contract(erc1155ABI, ERC1155_ADDRESS);
const archiveContract = new caver.contract(debateABI, DEBATE_ADDRESS);

const options = { fromBlock: "latest" };
const callback = (err, event) => {
  if (!err) console.log(event);
  else console.log(err);
};

//이벤트마다 콜백 작성해서 콜백함수 안에서 event객체로 DB 업데이트

module.exports = {
  tokenReward: async () => {
    ERC1155Contract.events.MintedToken(options, callback);

    ERC1155Contract.events.BurnedToken(options, callback);
  },
  nftBuy: async () => {
    ERC1155Contract.events.UserNFTBuy(options, callback);
  },
  archived: async () => {
    archiveContract.events.Archived(options, callback);
  },
};
