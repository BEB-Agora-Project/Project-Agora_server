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
    if (!userId) return res.send("Please log in");

    await Comment.create({
      content: content,
      post_id: postId,
      user_id: userId,
    });

    return res.send("OK");
  },
  debateCommentVote: async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) return res.send("Please log in");

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
      return res.send(curVote);
    }
  },
  debateCommentEdit: async (req, res) => {
    const userId = await getUserId(req);
    const { content } = req.body;
    const commentId = req.params.id;
    if (!userId) return res.send("Please log in");

    const commentInfo = await Comment.findByPk(commentId);

    const commentUser = commentInfo.user_id;
    if (commentUser !== userId) return res.send("It's not your Comment");

    await commentInfo.update({
      content: content,
    });

    return res.send("Edited");
  },
  debatePostComments: async (req, res) => {
    const postId = req.params.id;
    const result = await Comment.findAll({ where: { post_id: postId } });
    return res.send(result);
  },
};
