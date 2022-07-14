const { Post, Debate, User } = require("../models");
const { balanceCheck } = require("../utils/balanceCheck");
const { asyncWrapper } = require("../errors/async");

const { getUserId } = require("../utils/getUserId");

const { debatePostReward, VotePrice } = require("../config/rewardConfig");
const { StatusCodes } = require("http-status-codes");
module.exports = {
  debatePostWrite: asyncWrapper(async (req, res) => {
    const { opinion, title, content } = req.body;
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).send("로그인하지 않은 사용자입니다");
    }

    const recentDebate = await Debate.findOne({
      order: [["id", "DESC"]],
    });
    const debateId = recentDebate.id;

    const result = await Post.create({
      opinion: opinion,
      title: title,
      content: content,
      user_id: userId,
      board_id: null,
      debate_id: debateId,
    });

    const userInfo = await User.findByPk(userId);
    let curToken = userInfo.expected_token;
    curToken += debatePostReward;
    //하루에 한번만 글쓰는 기능 없음

    await userInfo.update({
      expected_token: curToken,
    });

    return res.status(201).send(result);
  }),
  debatePostVote: async (req, res) => {
    const vote = req.query.vote;
    const postId = req.params.post_id;
    const userId = await getUserId(req);
    if (!userId) return res.status(401).send("로그인하지 않은 사용자입니다");

    const postInfo = await Post.findByPk(postId);
    if (postInfo === null) {
      return res.status(404).send("존재하지 않는 포스트입니다");
    }
    const userInfo = await User.findByPk(userId);

    let todayVoteCount = userInfo.today_vote_count;
    let expectedToken = userInfo.expected_token;

    const curBalance = await balanceCheck(userId);
    const votePrice = VotePrice ** todayVoteCount;
    if (curBalance < votePrice) {
      return res.status(402).send("잔액이 부족합니다");
    }
    let curVote;
    if (vote === "up") {
      curVote = postInfo.up;
      curVote++;
      await postInfo.update({ up: curVote });
      //upVote 반영
    } else if (vote === "down") {
      curVote = postInfo.down;
      curVote++;
      await postInfo.update({ down: curVote });
      //downVote 반영
    } else {
      return res.status(400).send("올바르지 않은 요청입니다");
    }

    todayVoteCount++;
    let reducedToken = expectedToken - votePrice;

    await userInfo.update({
      expected_token: reducedToken,
      today_vote_count: todayVoteCount,
    });

    return res.status(200).send({ curVote: curVote });
  },
  debatePostEdit: async (req, res) => {
    //response에 수정된 updatedAt 첨부
    const userId = await getUserId(req);
    if (!userId) return res.status(401).send("로그인하지 않은 사용자입니다");

    const postId = req.params.post_id;

    const { opinion, title, content } = req.body;
    const postInfo = await Post.findByPk(postId);
    if (postInfo === null) {
      return res.status(404).send("존재하지 않는 포스트입니다");
    }

    if (postInfo.user_id !== userId) {
      return res.status(403).send("본인의 포스트가 아닙니다");
    }
    const result = await postInfo.update({
      opinion: opinion,
      title: title,
      content: content,
    });

    return res.status(200).send(result);
  },
  debatePosts: async (req, res) => {
    const opinion = req.query.opinion;

    const result = await Post.findAll({
      where: { opinion: opinion },
      order: [["id", "DESC"]],
      include: [{ model: User, attributes: ["username"] }],
    });

    if (result === null) {
      return res.status(204).send("아직 포스트가 존재하지 않습니다");
    }
    return res.status(200).send(result);
  },
  debatePost: async (req, res) => {
    const postId = req.params.post_id;
    if (!postId) return res.status(404).send("not found");
    const result = await Post.findByPk(postId);
    return res.status(200).send(result);
  },
};
