require("dotenv").config();
const MarketItem = require("../models/marketItem");
const User = require("../models/user");
const getUserId = require("../utils/getUserId");
const balanceCheck = require("../utils/balanceCheck");
const { nftBuy } = require("../utils/transactions");

module.exports = {
  nftList: async (req, res) => {
    const marketItems = await MarketItem.findAll();

    return res.send(marketItems);
  },
  nftBuy: async (req, res) => {
    const { tokenId } = req.body;
    const userId = await getUserId(req);

    const userInfo = await User.findByPk(userId);
    const nftInfo = await MarketItem.findOne({ where: { token_id: tokenId } });

    const nftPrice = nftInfo.price;
    const userAddress = userInfo.address;
    const userBalance = await balanceCheck(userId);

    if (nftPrice > userBalance) return res.send("Not enough balance");

    const parameters = [userAddress, tokenId, nftPrice];

    //토큰아이디 보내서 트랜잭션 실행
    res.send("Transaction Requested");

    await nftBuy(parameters);
    //실행후 subscriber가 DB에 반영
  },
};