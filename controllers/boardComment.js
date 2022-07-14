module.exports = {};
const { Post, User, Comment } = require("../models");

const { isAuthorized } = require("../middleware/webToken");
const { asyncWrapper } = require("../errors/async");
const { getUserId } = require("../utils/getUserId");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");

module.exports = {
  writeBoardPostComment: asyncWrapper(async (req, res) => {
    const { content } = req.body;
    const postId = req.params.post_id;

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
        "인가되지 않은 사용자입니다.",
        StatusCodes.UNAUTHORIZED
      );
    }

    if (content === undefined || postId === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    }
    const postData = await Post.findByPk(postId);

    const newComment = await Comment.create({
      content: content,
      user_id: userId,
      post_id: postId,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ status: "success", data: { commentId: newComment.id } });
  }),
  editBoardPostComment: asyncWrapper(async (req, res) => {
    const commentId = req.params.comment_id;
    const { content } = req.body;
    if (content === undefined || commentId === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    }

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
        "인가되지 않은 사용자입니다.",
        StatusCodes.UNAUTHORIZED
      );
    }
    const commentData = await Comment.findByPk(commentId);

    if (!commentData.user_id === userId) {
      throw new CustomError(`올바른 사용자가 아닙니다`, StatusCodes.CONFLICT);
    }
    await commentData.update({
      content: content,
    });
    res.status(StatusCodes.OK).send({ message: "ok" });
  }),

  /*
Writing ID를 받아서 해당 writing에 대한 정보를 응답
*/

  deleteBoardPostComment: asyncWrapper(async (req, res) => {
    const commentId = req.params.comment_id;
    if (!commentId) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    }

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
        "인가되지 않은 사용자입니다.",
        StatusCodes.UNAUTHORIZED
      );
    }
    const commentData = await Comment.findByPk(commentId);
    const commentUserId = commentData.user_id;

    if (!commentData) {
      throw new CustomError(
        `댓글번호 ${commentId} 가 존재하지 않습니다.`,
        StatusCodes.CONFLICT
      );
    }

    if (commentUserId !== userId) {
      throw new CustomError(`댓글 작성자가 아닙니다.`, StatusCodes.CONFLICT);
    }
    // db에 저장
    await Comment.destroy({
      where: { id: commentId },
    });
    // await mintToken(userInfo.address, 1);
    res.status(StatusCodes.ACCEPTED).send({ message: "ok" });
  }),
  getBoardPostComments: asyncWrapper(async (req, res) => {
    const postId = req.params.post_id;
    if (!postId) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    }
    const comments = await Comment.findAll({ where: { post_id: postId } });

    return res.status(StatusCodes.OK).send(comments);
  }),
};
