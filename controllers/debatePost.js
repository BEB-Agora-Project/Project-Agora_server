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
    if (!userId) {
      throw new CustomError(
        "로그인하지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );
    }

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

    return res.status(201).send(result);
  },
  debatePostVote: async (req, res) => {
    const vote = req.query.vote;
    const postId = req.params.id;
    const userId = await getUserId(req);
    if (!userId)
      throw new CustomError(
        "로그인하지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );

    const postInfo = await Post.findByPk(postId);
    if (postInfo === null) {
      throw CustomError("존재하지 않는 포스트입니다.", StatusCodes.NOT_FOUND);
    }
    const userInfo = await User.findByPk(userId);

    let todayVoteCount = userInfo.today_vote_count;
    let expectedToken = userInfo.expected_token;

    const curBalance = await balanceCheck(userId);
    const votePrice = VotePrice ** todayVoteCount;
    if (curBalance < votePrice)
      throw new CustomError("잔액이 부족합니다", StatusCodes.UNAUTHORIZED);

    let curVote;
    if (vote === "up") {
      curVote = postInfo.up;
      curVote++;
      await postInfo.update({ up: curVote });
      //upVote 반영
    } else if (vote === "down") {
      curVote = postInfo.down;
      curVote--;
      await postInfo.update({ down: curVote });
      //downVote 반영
    } else {
      throw new CustomError(
        "올바르지 않은 요청입니다",
        StatusCodes.NOT_ACCEPTABLE
      );
    }

    todayVoteCount++;
    let reducedToken = expectedToken - votePrice;

    await userInfo.update({
      expected_token: reducedToken,
      today_vote_count: todayVoteCount,
    });

    return res.status(200).send(curVote);
  },
  debatePostEdit: async (req, res) => {
    //response에 수정된 updatedAt 첨부
    const userId = await getUserId(req);
    if (!userId)
      throw new CustomError(
        "로그인하지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );

    const postId = req.params.id;

    const { opinion, title, content } = req.body;
    const postInfo = await Post.findByPk(postId);
    if (postInfo === null) {
      throw new CustomError(
        "존재하지 않는 포스트입니다.",
        statuscodes.NOT_FOUND
      );
    }

    if (postInfo.user_id !== userId)
      throw new CustomError(
        "본인의 포스트가 아닙니다",
        StatusCodes.UNAUTHORIZED
      );
    const result = await postInfo.update({
      opinion: opinion,
      title: title,
      content: content,
    });

    return res.status(200).send(result);
  },
  debatePostList: async (req, res) => {
    const opinion = req.query.opinion;
    const result = await Post.findAll({
      where: { opinion: opinion },
      order: [["id", "DESC"]],
    });
    if (result === null) {
      throw new CustomError(
        "아직 포스트가 존재하지 않습니다.",
        StatusCodes.NOT_FOUND
      );
    }
    return res.status(200).send(result);
  },
};
