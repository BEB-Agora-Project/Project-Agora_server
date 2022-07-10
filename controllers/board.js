const {board, user, comment} = require('../models');

const {isAuthorized} = require('../middleware/webToken')
// const {mintToken} = require('./smartContract')
const {asyncWrapper} = require("../errors/async");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes")
module.exports = {
    write: asyncWrapper(async (req, res) => {
        if (req.body.title === undefined || req.body.content === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.",StatusCodes.CONFLICT);
        }
        const decoded = await isAuthorized(req)
        const userInfo = await user.findOne({
            where: {id: decoded.id},
        });
        const userId = userInfo.id
        if (!decoded) {
            throw new CustomError("인가되지 않은 사용자입니다.", StatusCodes.UNAUTHORIZED);
        }
        const {title, content} = req.body;
        // req.body에 필요한 값들이 없으면 Bad Request 에러 응답
        if (!title || !content) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.", StatusCodes.CONFLICT);
        }
        const newBoard = new board({
            title,
            content,
            userId
        });
        try {
            // db에 저장
            const createdBoard = await newBoard.save();
            // await mintToken(userInfo.address, 5);
            res.status(StatusCodes.CREATED).json({status: "success", data: {boardId: createdBoard.id}});
        } catch (err) {
            throw new Error(err);
        }
    }),

    edit : asyncWrapper(async (req, res) => {
        if (req.body.title === undefined || req.body.content === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.",StatusCodes.CONFLICT);
        }
        const decoded = await isAuthorized(req)
        const userInfo = await user.findOne({
            where: {id: decoded.id},
        });
        const userId = userInfo.id
        const boardData = await board.findOne({
            where: {id: req.params.id},
        });
        if (!boardData) {
            throw new CustomError(`글번호 ${req.params.id} 가 존재하지 않습니다.`,StatusCodes.CONFLICT);
        }



        if(!boardData.userId===userId){
            throw new CustomError(`올바른 사용자가 아닙니다`,StatusCodes.CONFLICT);
        }
        const {title,content} = req.body;
        await boardData.update({
            title:title,
            content: content
        });
        res.status(StatusCodes.OK).json({status: "success", data: {boardId: boardData.id}});
    }),

    /*
  Writing ID를 받아서 해당 writing에 대한 정보를 응답
*/
    getWritingById: asyncWrapper(async (req, res) => {
        //전달받은 id를 가진 writing을 찾아옴
        const boardData = await board.findOne({
            where: {id: req.params.id},
        });
        await board.increment({hit: 1}, {where: {id: req.params.id}})
        //해당 id를 가진 writing 없으면 에러 응답
        if (!boardData) {
            throw new CustomError(`글번호 ${req.params.id} 가 존재하지 않습니다.`, StatusCodes.CONFLICT);
        }
        const {id, title, content, hit, createdAt, updatedAt, userId} = boardData;
        const {userName} = await user.findOne({
            where: {id: boardData.userId},
        });
        // db에 comments가 유저의 object id로 저장이 되어있기 때문에
        // 응답으로 보내줄 때는 유저의 id와 닉네임을 추가해서 보내준다.
        const boardComments = await comment.findAll({
            include: [
                {
                    model: user,
                    attributes: ['userName']
                }
            ],
            where: {boardId: boardData.id},
            });

        res.status(200).json({
            status: "success",
            data: {
                id,
                title,
                content,
                hit,
                createdAt,
                updatedAt,
                userName,
                boardComments,
            },
        });
    }),

    getAllWriting: asyncWrapper(async (req, res) => {
        const writings = await board.findAll();
        // Array에 map을 돌 때 콜백함수가 비동기면 일반적인 방법으로는 구현이 안됨
        // 그래서 Promise.all을 사용함
        const data = await Promise.all(
            writings.map(
                async ({id, title, createdAt, updatedAt, hit, userId}) => {
                    const {userName} = await user.findOne({
                        where: {id: userId},
                    });
                    const comments = await comment.findAndCountAll({
                        where: {boardId: id},
                    });
                    const commentsCount= comments.count
                    return {
                        id,
                        title,
                        userName,
                        hit,
                        commentsCount,
                        createdAt,
                        updatedAt
                    };
                }
            )
        );
        res.status(200).json({
            status: "success",
            data,
        });
    }),

    commentToWriting : asyncWrapper(async (req, res) => {
        if (req.body.content === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.",StatusCodes.CONFLICT);
        }
        const {content} = req.body;
        const boardData = await board.findOne({
            where: {id: req.params.id},
        });
        const boardId = boardData.id
        const decoded = await isAuthorized(req)
        const userInfo = await user.findOne({
            where: {id: decoded.id},
        });
        if (!boardData) {
            throw new CustomError(`글번호 ${boardId} 가 존재하지 않습니다.`,StatusCodes.CONFLICT);
        }
        const newComment = new comment({
            content,
            userId: decoded.id,
            boardId
        });
        try {
            // db에 저장
            const createdComment = await newComment.save();
            // await mintToken(userInfo.address, 1);
            res.status(StatusCodes.CREATED).json({status: "success", data: {commentId: createdComment.id}});
        } catch (err) {
            throw new Error(err);
        }
    }),
    deleteToWriting : asyncWrapper(async (req, res) => {

        const boardData = await board.findOne({
            where: {id: req.params.id},
        });
        const boardId = boardData.id
        const boardUserId = boardData.userId
        const decoded = await isAuthorized(req)
        const userInfo = await user.findOne({
            where: {id: decoded.id},
        });
        if (!boardData) {
            throw new CustomError(`글번호 ${boardId} 가 존재하지 않습니다.`,StatusCodes.CONFLICT);
        }
        if (boardUserId!==userInfo.id) {
            throw new CustomError(`게시글 작성자가 아닙니다.`,StatusCodes.CONFLICT);
        }
        try {
            // db에 저장
            await  board.destroy(
                {
                    where: {id:boardId}
                }
            )
            // await mintToken(userInfo.address, 1);
            res.status(StatusCodes.OK).send({message: "ok"});
        } catch (err) {
            throw new Error(err);
        }
    }),
    deleteToComment : asyncWrapper(async (req, res) => {
        const commentData = await board.findOne({
            where: {id: req.params.id},
        });
        const commentId = commentData.id
        const commentUserId = commentData.userId
        const decoded = await isAuthorized(req)
        const userInfo = await user.findOne({
            where: {id: decoded.id},
        });
        if (!commentData) {
            throw new CustomError(`댓글번호 ${commentId} 가 존재하지 않습니다.`,StatusCodes.CONFLICT);
        }
        if (commentUserId!==userInfo.id) {
            throw new CustomError(`댓글 작성자가 아닙니다.`,StatusCodes.CONFLICT);
        }
        try {
            // db에 저장
            await  comment.destroy(
                {
                    where: {id:commentId}
                }
            )
            // await mintToken(userInfo.address, 1);
            res.status(StatusCodes.OK).send({message: "ok"});
        } catch (err) {
            throw new Error(err);
        }
    }),


}