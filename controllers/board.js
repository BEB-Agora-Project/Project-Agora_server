const {Post, User, Comment, Board} = require("../models");

const {asyncWrapper} = require("../errors/async");
const {getUserId} = require("../utils/getUserId");
const {balanceCheck} = require("../utils/balanceCheck");
const {makeBoardPrice} = require("../config/rewardConfig");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");
const {pagingSize} = require("../config/pagingConfig");

module.exports = {
    makeBoard: asyncWrapper(async (req, res) => {
        const {boardname} = req.body;
        if (!boardname) {
            throw new CustomError(
                "게시판 이름을 적어주세요",
                StatusCodes.BAD_REQUEST
            );
        }

        const userId = await getUserId(req);
        if (!userId) {
            throw new CustomError("로그인이 필요합니다.", StatusCodes.UNAUTHORIZED);
        }

        const balance = await balanceCheck(userId);

        if (balance < makeBoardPrice) {
            throw new CustomError("잔액이 부족합니다", StatusCodes.PAYMENT_REQUIRED);
        }

        const userInfo = await User.findByPk(userId);

        let expectedToken = userInfo.expected_token;
        expectedToken -= makeBoardPrice;

        await userInfo.update({expected_token: expectedToken});

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

    getBoardRecents: asyncWrapper(async (req, res) => {
        const result = await Board.findAll({
            order: [["id", "ASC"]],
            include: [
                {
                    model: Post,
                    limit: pagingSize,
                    order: [["id","DESC"]],
                    include:[{ model: User, attributes: ["username", "profile_image", "badge"] }]
                },
            ],

        });
        console.log(result)
        res.status(200).json({
            status: "success",
            data: result
        });
    }),

};
