require("dotenv").config();

const Comment = require("../models/Comment");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");

const getUserId = require("../utils/getUserId");

module.exports = {
  debateCommentWrite: async (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = await getUserId(req);
    if (!userId)
      throw new CustomError(
        "로그인하지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );

    const result = await Comment.create({
      content: content,
      post_id: postId,
      user_id: userId,
    });

    return res.status(201).send(result);
  },
  debateCommentVote: async (req, res) => {
    const userId = await getUserId(req);
    if (!userId)
      throw new CustomError(
        "로그인하지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );

    const commentId = req.params.id;
    const vote = req.query.vote;
    let curVote;

    const commentInfo = await Comment.findByPk(commentId);

    if (vote === "up") {
      curVote = commentInfo.up;
      curVote++;
      await commentInfo.update({
        up: curVote,
      });
      return res.send(curVote);
    } else {
      curVote = commentInfo.down;
      curVote--;
      await commentInfo.update({
        down: curVote,
      });
      return res.status(200).send(curVote);
    }
  },
  debateCommentEdit: async (req, res) => {
    const userId = await getUserId(req);
    const { content } = req.body;
    const commentId = req.params.id;
    if (!userId)
      throw new CustomError(
        "로그인하지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );

    const commentInfo = await Comment.findByPk(commentId);

    const commentUser = commentInfo.user_id;
    if (commentUser !== userId)
      throw new CustomError(
        "본인의 코멘트가 아닙니다",
        StatusCodes.UNAUTHORIZED
      );

    const result = await commentInfo.update({
      content: content,
    });

    return res.status(200).send(result);
  },
  debatePostComments: async (req, res) => {
    const postId = req.params.id;
    const result = await Comment.findAll({ where: { post_id: postId } });
    return res.status(200).send(result);
  },
};
