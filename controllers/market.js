require("dotenv").config();
const { Nftitem, Normalitem, Normalitemlist, User } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");

const { getUserId } = require("../utils/getUserId");
const { balanceCheck } = require("../utils/balanceCheck");
const { nftBuy } = require("../utils/transactions");
const { asyncWrapper } = require("../errors/async");
module.exports = {
  getNFTItemList: async (req, res) => {
    const nfts = await Nftitem.findAll({ where: { sold: false } });

    const arr = await Promise.all(
      nfts.map(async (el) => {
        const res = await axios.get(el.dataValues.token_uri);
        const metaData = res.data;
        return metaData;
      })
    );

    const result = [];
    for (let i = 0; i < nfts.length; i++) {
      result.push(Object.assign(arr[i], nfts[i].dataValues));
    }
    return res.status(200).send(result);
  },
  buyNFTItem: asyncWrapper(async (req, res) => {
    const { nftId } = req.body;
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).send("로그인하지 않은 사용자입니다");
    }
    const nftInfo = await Nftitem.findByPk(nftId);
    const userInfo = await User.findByPk(userId);

    let currentToken = userInfo.current_token;
    const price = nftInfo.price;
    const tokenId = nftInfo.token_id;
    const sold = nftInfo.sold;
    const userAddress = userInfo.address;

    if (sold) {
      return res.status(405).send("이미 팔린 NFT 입니다.");
    }

    if (currentToken < price) {
      return res.status(402).send("컨트랙트에 보유중인 토큰이 부족합니다.");
    }

    //item이 nft라는 뜻

    const parameters = [userAddress, tokenId, price];
    await nftBuy(parameters);

    //전역변수에서 nft구매가 성공했는지 실패했는지 subscriber를 통해 받아와 저장하고 그결과를 참조합니다.
    console.log("트랜잭션 실행 전", global.nft);
    if (global.nft === "실패") {
      console.log("컨트롤러 NFT 구매 실패");
      global.nft = "초기화";
      return res.send("구매에 실패했습니다");
    } else if (global.nft === "성공") {
      console.log("컨트롤러 NFT 구매 성공");
      global.nft = "초기화";
      return res.send("구매에 성공했습니다");
    }
  }),
  getNormalItemList: async (req, res) => {
    const result = await Normalitem.findAll();
    return res.status(200).send(result);
  },
  buyNormalItem: async (req, res) => {
    const { itemId } = req.body;

    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).send("로그인하지 않은 사용자입니다");
    }

    const itemInfo = await Normalitem.findByPk(itemId);
    const price = itemInfo.price;

    if (!itemInfo) {
      return res.status(404).send("존재하지 않는 아이템입니다");
    }

    const curBalance = await balanceCheck(userId);

    if (curBalance < price) {
      return res.status(402).send("잔액이 부족합니다.");
    }

    const userInfo = await User.findByPk(userId);

    let expectedToken = userInfo.expected_token;

    expectedToken -= price;

    const itemName = itemInfo.itemname;

    await userInfo.update({ expected_token: expectedToken, badge: itemName });
    await Normalitemlist.create({
      normal_item_id: itemId,
      user_id: userId,
    });

    return res.status(200).send("샀습니다");
  },
};
