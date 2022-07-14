require("dotenv").config();

const { Comment, Post } = require("../models");
const { getUserId } = require("../utils/getUserId");

module.exports = {
  debateCommentWrite: async (req, res) => {
    const { content } = req.body;
    const postId = req.params.post_id;

    const post = await Post.findByPk(postId);
    if (post === null) return res.send(404).send("존재하지 않는 포스트입니다");
    const userId = await getUserId(req);
    if (!userId) return res.status(401).send("로그인하지 않은 사용자입니다");

    const result = await Comment.create({
      content: content,
      post_id: postId,
      user_id: userId,
    });

    return res.status(201).send(result);
  },
  debateCommentVote: async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).send("로그인하지 않은 사용자입니다");

    const postId = req.params.post_id;
    const commentId = req.params.comment_id;
    const vote = req.query.vote;
    let curVote;

    const postInfo = await Post.findByPk(postId);
    if (postInfo === null) {
      return res.status(404).send("존재하지 않는 포스트입니다");
    }
    const commentInfo = await Comment.findByPk(commentId);
    if (commentInfo === null) {
      return res.status(404).send("존재하지 않는 코멘트입니다");
    }
    if (vote === "up") {
      curVote = commentInfo.up;
      curVote++;
      await commentInfo.update({
        up: curVote,
      });
      return res.status(200).send({ curVote: curVote });
    } else if (vote === "down") {
      curVote = commentInfo.down;
      curVote--;
      await commentInfo.update({
        down: curVote,
      });
      return res.status(200).send({ curVote: curVote });
    } else {
      return res.status(400).send("올바르지 않은 요청입니다.");
    }
  },
  debateCommentEdit: async (req, res) => {
    const userId = await getUserId(req);
    const { content } = req.body;
    const commentId = req.params.comment_id;
    const postId = req.params.post_id;

    if (!userId) return res.status(401).send("로그인하지 않은 사용자입니다");

    const postInfo = await Post.findByPk(postId);
    if (postInfo === null) {
      return res.status(404).send("존재하지 않는 포스트입니다");
    }

    const commentInfo = await Comment.findByPk(commentId);
    if (commentInfo === null) {
      return res.status(404).send("존재하지 않는 코멘트입니다");
    }
    const commentUser = commentInfo.user_id;
    if (commentUser !== userId) {
      return res.status(403).send("본인 코멘트가 아닙니다");
    }

    const result = await commentInfo.update({
      content: content,
    });

    return res.status(200).send(result);
  },
  debatePostComments: async (req, res) => {
    const postId = req.params.post_id;
    const result = await Comment.findAll({ where: { post_id: postId } });
    if (result === null) {
      return res.status(204).send("아직 코멘트가 없습니다");
    }
    return res.status(200).send(result);
  },
};
