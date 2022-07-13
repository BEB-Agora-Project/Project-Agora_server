const Post = require("../models/Post");
const Debate = require("../models/Debate");
const User = require("../models/User");

const balanceCheck = require("../utils/balanceCheck");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");

const { debatePostReward, VotePrice } = require("../config/rewardConfig");
module.exports = {
  debatePostWrite: async (req, res) => {
    const { opinion, title, content } = req.body;
    const userId = await getUserId(req);
    if (!userId) return res.send("Please log in");

    const recentDebate = await Debate.findOne({
      order: [["created_at", "DESC"]],
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

    return res.send(result);
  },
  debatePostVote: async (req, res) => {
    const vote = req.query.vote;
    const postId = req.params.id;
    const userId = await getUserId(req);
    if (!userId) return res.send("Please log in");

    const postInfo = await Post.findByPk(postId);
    const userInfo = await User.findByPk(userId);

    let todayVoteCount = userInfo.today_vote_count;
    let expectedToken = userInfo.expected_token;

    const curBalance = await balanceCheck(userId);
    const votePrice = VotePrice ** todayVoteCount;
    if (curBalance < votePrice) return res.send("Not enough balance");

    let curVote;
    if (vote === "up") {
      curVote = postInfo.up;
      curVote++;
      await postInfo.update({ up: curVote });
      //upVote 반영
    } else {
      curVote = postInfo.down;
      curVote--;
      await postInfo.update({ down: curVote });
      //downVote 반영
    }

    todayVoteCount++;
    let reducedToken = expectedToken - votePrice;

    await userInfo.update({
      expected_token: reducedToken,
      today_vote_count: todayVoteCount,
    });

    return res.send("OK");
  },
  debatePostEdit: async (req, res) => {
    //response에 수정된 updatedAt 첨부
    const postId = req.params.id;
    const { opinion, title, content } = req.body;
    const postInfo = await Post.findByPk(postId);
    const result = await postInfo.update({
      opinion: opinion,
      title: title,
      content: content,
    });

    return result;
  },
  debatePostList: async (req, res) => {
    const opinion = req.query.opinion;
    const result = await Post.findAll({
      where: { opinion: opinion },
      order: [["id", "DESC"]],
    });
    return res.send(result);
  },
};
