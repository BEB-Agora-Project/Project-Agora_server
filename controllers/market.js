require("dotenv").config();
const MarketItem = require("../models/marketItem");
const User = require("../models/user");
const { Op } = require("sequelize");

const getUserId = require("../utils/getUserId");
const balanceCheck = require("../utils/balanceCheck");
const nftBuy = require("../utils/transactions");

const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");

module.exports = {
  itemList: async (req, res) => {
    const nftItems = await MarketItem.findAll({
      where: { token_id: { [Op.gt]: 0 } },
    });
    let normalItemList = ["1", "2"];
    const normalItems = await MarketItem.findAll({
      where: { token_id: 0, token_uri: { [Op.in]: normalItemList } },
      group: ["token_uri"],
    });
    //중복되는 일반 아이템들의 종류 구분할때는  먼저 tokenId 0으로 찾고나서 tokenURI "1", "2" 로 종류 구분해서 찾아오기
    const result = { nftItems: nftItems, normalItems: normalItems };
    return res.status(200).send(result);
  },
  itemBuy: async (req, res) => {
    const itemId = req.params.id;
    const userId = await getUserId(req);
    if (!userId)
      throw new CustomError(
        "로그인하지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );
    //tokenId는 아이템아이디 쿼리해서 얻기
    //토큰아이디 0이면 트랜잭션은 보내지 않는걸로 수정

    const userInfo = await User.findByPk(userId);
    const itemInfo = await MarketItem.findByPk(itemId);

    const tokenId = itemInfo.token_id;

    const itemPrice = itemInfo.price;
    const userAddress = userInfo.address;
    const userBalance = await balanceCheck(userId);
    let expectedToken = userInfo.expected_token;
    let currentToken = userInfo.current_token;

    expectedToken -= itemPrice;
    currentToken -= itemPrice;

    if (itemPrice > userBalance)
      throw new CustomError("잔액이 부족합니다", StatusCodes.UNAUTHORIZED);

    if (tokenId === 0) {
      //nft가 아닌 일반  item

      await itemInfo.update({
        sold: true,
        user_id: userId,
      });
      await userInfo.update({ expected_token: expectedToken });
    }
    res.status(102).send("Transaction Requested");
    if (tokenId > 0) {
      //item이 nft라는 뜻
      await itemInfo.update({ sold: true, user_id: userId });
      await userInfo.update({ current_token: currentToken });
      const parameters = [userAddress, tokenId, itemPrice];
      await nftBuy(parameters);
    }
  },
};
