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
const debateABI = require("./truffle/build/contracts/Debate.json").abi;
const erc1155ABI = require("./truffle/build/contracts/AgoraTokens.json").abi;
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
  const ABIencoded = caver.abi.encodeFunctionCall(methodABI[0], parameters);
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
//sendTx 함수 테스트
async function test() {
  await mutex.runExclusive(async () => {
    //buyInfo엔 구매자, 토큰아이디, 가격 들어감
    const buyInfo = [SERVER_ADDRESS, 2, 300];
    const result = await sendTx(erc1155ABI, ERC1155_ADDRESS, "buyNFT", buyInfo);

    return result;
  });
}

//subscribe 테스트
const caver1 = new Caver("wss://public-node-api.klaytnapi.com/v1/baobab/ws");
const ERC1155Contract = new caver1.contract(erc1155ABI, ERC1155_ADDRESS);
const options = { fromBlock: "latest" };
const callback = (err, event) => {
  if (!err) {
    //이벤트가 들어올때마다 콜백함수가 재실행됩니다. 계획대로 DB관련해 액션을 해도 됩니다.
    console.log("event");
    console.log("test");
  } else console.log(err);
};

async function listen() {
  ERC1155Contract.events.UserNFTBuy(options, callback);
}
/*
subscribe returns
{
  address: '0x7b22F47F09A5BEEd5763AD103725F34Cdb0E17Db',
  blockNumber: 96036023,
  transactionHash: '0x607ab9552865b0f8dc128eb54b0eef9df2bcb403e6dc796acd92f72d4a618aba',
  transactionIndex: 0,
  blockHash: '0x1f5404071b4ffa1efd4240987ef1adce9fa94a472d8d26468363cfeaf3ed3960',
  logIndex: 2,
  id: 'log_03a0f7ef',
  returnValues: Result {
    '0': '0x411b1a53ABaA8fD1e9d8B13f6395905Edd18d7a6',
    '1': '2',
    '2': '100',
    buyer: '0x411b1a53ABaA8fD1e9d8B13f6395905Edd18d7a6',
    tokenId: '2',
    price: '100'
  },
  event: 'UserNFTBuy',
  signature: '0xe27ae26b1b18b38f4b5f8f8ea52860363020cab672d4bc787da0be4cf62eb4d1',
  raw: {
    data: '0x000000000000000000000000411b1a53abaa8fd1e9d8b13f6395905edd18d7a600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000064',
    topics: [
      '0xe27ae26b1b18b38f4b5f8f8ea52860363020cab672d4bc787da0be4cf62eb4d1'
    ]
  }
}
 */

//nonce, mutext 테스트 잘 작동합니다
for (let i = 0; i < 10; i++) {
  test();
}
listen();

//cron scheduler TEST
const cron = require("node-cron");

const timezone = { timezone: "Asia/Tokyo" };

// cron.schedule("58 16 * * *", () => console.log(1), timezone);
