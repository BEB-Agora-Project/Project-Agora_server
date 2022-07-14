const { Post, User, Comment, Board } = require("../models");

const { asyncWrapper } = require("../errors/async");
const { getUserId } = require("../utils/getUserId");
const { balanceCheck } = require("../utils/balanceCheck");
const { makeBoardPrice } = require("../config/rewardConfig");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");

module.exports = {
  makeBoard: asyncWrapper(async (req, res) => {
    const { boardname } = req.body;
    if (!boardname) {
      throw new CustomError(
        "게시판 이름을 적어주세요",
        StatusCodes.NOT_ACCEPTABLE
      );
    }

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
        "인가되지 않은 사용자입니다.",
        StatusCodes.UNAUTHORIZED
      );
    }

    const balance = await balanceCheck(userId);

    if (balance < makeBoardPrice) {
      throw new CustomError("잔액이 부족합니다", StatusCodes.PAYMENT_REQUIRED);
    }

    const userInfo = await User.findByPk(userId);

    let expectedToken = userInfo.expected_token;
    expectedToken -= makeBoardPrice;

    await userInfo.update({ expected_token: expectedToken });

    const createdBoard = await Board.create({
      boardname: boardname,
      user_id: userId,
    });

    return res.status(StatusCodes.CREATED).send(createdBoard);
  }),
  getBoards: async (req, res) => {
    const result = await Board.findAll();
    return res.status(200).send(result);
  },
};
