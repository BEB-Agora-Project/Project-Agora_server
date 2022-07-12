//트랜잭션 객체를 만드는것을 모듈화, 컨트랙트 주소와 필요한 인자들을 받아서 트랜잭션 객체를 뱉음
//트랜 잭션을 보내는것을 모듈화, lock 이용하기
//트랜잭션 보내고 나서 event subscribe로 DB 덮어씌우는 모듈, 지금은 딱히 NFT 구매말고 없다.
require("dotenv").config();
const { Mutex } = require("async-mutex");
const Caver = require("caver-js");
const {
  SERVER_ADDRESS,
  SERVER_PRIVATE_KEY,
  DEBATE_ADDRESS,
  ERC1155_ADDRESS,
  PROVIDER,
} = process.env;
const debateABI = require("../truffle/build/contracts/Debate.json").abi;
const erc1155ABI = require("../truffle/build/contracts/AgoraTokens.json").abi;
let nonce = 0;

const caver = new Caver(PROVIDER);
const mutex = new Mutex();

function findMethod(ABI, methodName) {
  for (let i = 0; i < ABI.length; i++) {
    if (ABI[i].name === methodName) return [ABI[i]];
  }
}

async function sendTx(ABI, contractAddress, methodName, parameters) {
  let _nonce = await caver.rpc.klay.getTransactionCount(
    SERVER_ADDRESS,
    "pending"
  );

  _nonce = caver.utils.hexToNumber(_nonce);

  nonce = nonce > _nonce ? nonce : _nonce;
  console.log(nonce);

  nonce = caver.utils.numberToHex(nonce);

  const methodABI = findMethod(ABI, methodName); //ABI에서 원하는 method를 골라야됨
  const ABIencoded = caver.abi.encodeFunctionCall(methodABI, parameters);
  const options = {
    from: SERVER_ADDRESS,
    to: contractAddress,
    gas: "100000",
    nonce: nonce,
    input: ABIencoded,
  };

  const Tx = await caver.transaction.smartContractExecution.create(options);
  const signedTx = await Tx.sign(SERVER_PRIVATE_KEY);
  const rawSignedTx = signedTx.getRawTransaction();
  const receipt = await caver.rpc.klay.sendRawTransaction(rawSignedTx);

  nonce = caver.utils.hexToNumber(nonce);
  nonce++;
  return receipt;
}

module.exports = {
  tokenSettlement: async (mintList, burnList) => {
    //토큰 보상을 받아야하는사람들 처리
    await mutex.runExclusive(async () => {
      //runExclusive always release locks
      //Below code prevents nonce hell

      //parameters엔 업데이트 명단 들어감
      const result = await sendTx(
        erc1155ABI,
        ERC1155_ADDRESS,
        "tokenMint",
        mintList
      );
    });

    //토큰을 많이써서 토큰을 태워야 하는사람들 처리
    await mutex.runExclusive(async () => {
      const result = await sendTx(
        erc1155ABI,
        ERC1155_ADDRESS,
        "tokenBurn",
        burnList
      );
    });

    //update DB expectedToken + currentToken => currentToken, expectedToken = 0
    //DB업데이트는 스케쥴러로 빼자, 여기서는 클레이튼 트랜잭션만 담당.
  },
  nftBuy: async (buyInfo) => {
    await mutex.runExclusive(async () => {
      //buyInfo엔 구매자, 토큰아이디, 가격 들어감
      const result = await sendTx(
        erc1155ABI,
        ERC1155_ADDRESS,
        "buyNFT",
        buyInfo
      );
    });
  },
  archiveDebate: async () => {
    await mutex.runExclusive(async (archivePost) => {
      //runExclusive always release lock
      //parameters는 DB에서 가장 최신 debate post 가져와서 해쉬화 해주도록 한다!
      const parameters = archivePost;

      const result = await sendTx(
        debateABI,
        DEBATE_ADDRESS,
        "archiving",
        parameters
      );

      //우승자에게 토큰 지급도 한다.. -> scheduler에서 DB에만 기록해뒀다가 나중에 TokenSettlement로 정산하도록
    });
  },
};
