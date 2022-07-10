require("dotenv").config();
const Market = require("../models/market");
const User = require("../models/user");
const getUserId = require("../utils/getUserId");
const balanceCheck = require("../utils/balanceCheck");
const { nftBuy } = require("../utils/transactions");

module.exports = {
  nftList: async (req, res) => {
    const marketItems = await Market.findAll();

    return res.send(marketItems);
  },
  nftBuy: async (req, res) => {
    const { tokenId } = req.body;
    const userId = await getUserId(req);

    const userInfo = await User.findByPk(userId);
    const nftInfo = await Market.findOne({ where: { tokenId: tokenId } });

    const nftPrice = nftInfo.price;
    const userAddress = userInfo.address;
    const userBalance = await balanceCheck(userId);

    if (nftPrice > userBalance) return res.send("Not enough balance");

    //토큰아이디 보내서 트랜잭션 실행
    res.send("Transaction Requested");

    await nftBuy(userAddress, tokenId, nftPrice);
    //실행후 subscriber가 DB에 반영
  },
};
