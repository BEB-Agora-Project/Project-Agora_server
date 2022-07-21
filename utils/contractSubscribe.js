//컨트랙트 서브스크라이브 해서 이벤트 들어오면 DB에 반영하기
require("dotenv").config();
const { Nftitem, User } = require("../models");

const Caver = require("caver-js");

const debateABI = require("../truffle/build/contracts/Debate.json").abi;
const erc1155ABI = require("../truffle/build/contracts/AgoraTokens.json").abi;
const { WS_PROVIDER, ERC1155_ADDRESS, DEBATE_ADDRESS } = process.env;

const caver = new Caver(WS_PROVIDER, { reconnect: { auto: true } });

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
  nftBuyEvent: async () => {
    ERC1155Contract.events.UserNFTBuy(options, async (err, event) => {
      if (!err) {
        global.nft = "성공";

        const buyerAddress = event.returnValues.buyer;
        const price = event.returnValues.price;
        const tokenId = event.returnValues.tokenId;

        const userInfo = await User.findOne({
          where: { address: buyerAddress },
        });

        const userId = userInfo.id;
        let currentToken = userInfo.current_token;
        currentToken -= price;

        await userInfo.update({ current_token: currentToken });
        await Nftitem.update(
          { price: price, user_id: userId, sold: true },
          { where: { token_id: tokenId } }
        );

        console.log("성공", event.returnValues);
      } else console.log(err);
    });

    ERC1155Contract.events.UserNFTFail(options, async (err, event) => {
      if (!err) {
        global.nft = "실패";

        const buyerAddress = event.returnValues.buyer;
        const price = event.returnValues.price;

        const userInfo = await User.findOne({
          where: { address: buyerAddress },
        });

        let currentToken = userInfo.current_token;
        currentToken -= price;

        await userInfo.update({ current_token: currentToken });
        console.log("실패", event.returnValues);
        //이벤트 객체를 인자로 받아 리턴하는 함수 작성.
      } else console.log(err);
    });
  },
  archived: async () => {
    archiveContract.events.Archived(options, callback);
  },
};

// {
//   address: '0xe665B9B9d68E6d413Fe74DD2B6751cd1ee5281DF',
//   blockNumber: 96722979,
//   transactionHash: '0xfb0ece76f9e2344774a4889b40be36d39cb23cbce32a6c54751f313ee9818b03',
//   transactionIndex: 0,
//   blockHash: '0x63f132d6402905b8710ca4b44a81ae0681187a72d8793ce12331fafae154cfa3',
//   logIndex: 2,
//   id: 'log_d526a1f9',
//   returnValues: Result {
//     '0': '0x411b1a53ABaA8fD1e9d8B13f6395905Edd18d7a6',
//     '1': '2',
//     '2': '1000',
//     buyer: '0x411b1a53ABaA8fD1e9d8B13f6395905Edd18d7a6',
//     tokenId: '2',
//     price: '1000'
//   },
//   event: 'UserNFTBuy',
//   signature: '0xe27ae26b1b18b38f4b5f8f8ea52860363020cab672d4bc787da0be4cf62eb4d1',
//   raw: {
//     data: '0x000000000000000000000000411b1a53abaa8fd1e9d8b13f6395905edd18d7a6000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000003e8',
//     topics: [
//       '0xe27ae26b1b18b38f4b5f8f8ea52860363020cab672d4bc787da0be4cf62eb4d1'
//     ]
//   }
// }
