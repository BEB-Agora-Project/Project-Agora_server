module.exports = {};
const {Comment,Reply} = require("../models");

const { asyncWrapper } = require("../errors/async");
const { getUserId } = require("../utils/getUserId");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");
const { textFilter } = require("../utils/filtering");

module.exports = {
  writeBoardPostCommentReply: asyncWrapper(async (req, res) => {
    const { content } = req.body;
    const commentId = req.params.comment_id;
    const userId = req.userId

    if (commentId === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const currentComment = await Comment.findOne({
      where: {
        id: commentId,
      },
    });
    if (!currentComment) {
      throw new CustomError(
        "존재하지 않는 댓글입니다.",
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }

    if (content && (await textFilter(content))) {
      throw new CustomError(
        "댓글 내용에 사용할 수 없는 문자열이 포함되어 있습니다.",
        StatusCodes.CONFLICT
      );
    }

    const newReply = await Reply.create({
      content: content,
      user_id: userId,
      comment_id: commentId,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ status: "success", data: { replyId: newReply.id } });
  }),
  editBoardPostCommentReply: asyncWrapper(async (req, res) => {
    const replyId = req.params.reply_id;
    const { content } = req.body;
    if (content === undefined || replyId === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const userId = req.userId
    const replyData = await Reply.findByPk(replyId);

    if (!replyData) {
      throw new CustomError(
        "존재하지 않는 댓글입니다.",
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }

    if (!replyData.user_id === userId) {
      throw new CustomError(
        "본인의 코멘트가 아닙니다.",
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }
    if (await textFilter(content)) {
      throw new CustomError(
        "댓글 내용에 사용할 수 없는 문자열이 포함되어 있습니다.",
        StatusCodes.CONFLICT
      );
    }

    await replyData.update({
      content: content,
    });
    res.status(StatusCodes.OK).send({ message: "ok" });
  }),



  deleteBoardPostCommentReply: asyncWrapper(async (req, res) => {
    const replyId = req.params.reply_id;
    if (!replyId) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const userId = req.userId
    const replyData = await Reply.findByPk(replyId);
    const replyUserId = replyData.user_id;

    if (!replyData) {
      throw new CustomError(
        `댓글번호 ${replyId} 가 존재하지 않습니다.`,
        StatusCodes.NOT_FOUND
      );
    }

    if (replyUserId !== userId) {
      throw new CustomError(
        `댓글 작성자가 아닙니다.`,
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }
    // db에 저장
    await Reply.destroy({
      where: { id: replyId },
    });
    // await mintToken(userInfo.address, 1);
    res.status(StatusCodes.ACCEPTED).send({ message: "ok" });
  }),
};
