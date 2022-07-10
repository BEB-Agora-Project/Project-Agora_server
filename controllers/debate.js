require("dotenv").config();

const { combineTableNames } = require("sequelize/types/utils");
const Comment = require("../models/comment");
const User = require("../models/user");
const Debate = require("../models/debate");
const getUserId = require("../utils/getUserId");
const balanceCheck = require("../utils/balanceCheck");
const {
  debateCommentReward,
  upVotePrice,
  downVotePrice,
} = require("../config/rewardConfig");

//로그인 상태이므로 유저 Id알 수 있음
//유저 Id로 코멘트에 조인시키기

module.exports = {
  commentWrite: async (req, res) => {
    // comment 테이블에 작성하고 debate table에 연결
    // 찬성/중립/반대 명시
    // 작성하면 토큰 보상 지급

    const { debateId, content, category } = req.body;
    const userId = await getUserId(req);
    //쓴 유저 아이디와 토론 아이디를 가져왔음, 이걸로 코멘트에 연결
    //category 변수는 찬성/중립/반대 또는 일반 게시판을 나타냄, 각각 0/1/2 또는 3

    await Comment.create({
      category: category,
      content: content,
      debateId: debateId,
      userId: userId,
    });
    //user,debate에 연결시켜 코멘트 작성

    const userInfo = await User.findByPk(userId);
    let curTokenBalance = userInfo.expectedToken;
    const rewardedTokenBalance = curTokenBalance + debateCommentReward;
    userInfo.expectedToken = rewardedTokenBalance;

    await userInfo.save();
    //DB에 토큰 보상 지급

    return res.send("OK");
  },
  commentVote: async (req, res) => {
    // 토론 영역 코멘트 추천
    // 횟수에따라 지수적으로 비용 증가

    const { commentId, upOrDown } = req.body;
    const userId = await getUserId(req);

    const commentInfo = await Comment.findByPk(commentId);
    const userInfo = await User.findByPk(userId);

    let curUpVote = commentInfo.up;
    let todayVoteCount = userInfo.todayVote;
    let expectedToken = userInfo.expectedToken;

    const votePrice = upVotePrice ** todayVoteCount;
    //오늘 투표한 횟수에따라 지수적으로 비용 증가

    const curBalance = await balanceCheck(userId);
    if (curBalance < votePrice) return res.send("Not enough balance");
    //현재 토큰 보유량 확인하고 부족하면 거절

    if (upOrDown === "up") {
      commentInfo.up = ++curUpVote;
      commentInfo.save();
      //upVote 반영
    } else {
      commentInfo.up = --curUpVote;
      commentInfo.save();
      //upVote 반영
    }

    todayVoteCount++;
    userInfo.todayVoteCount = todayVoteCount;
    //유저의 오늘 투표횟수 증가

    let reducedToken = expectedToken - votePrice;
    userInfo.expectedToken = reducedToken;
    userInfo.save();
    //소모한 토큰 반영, 음수로 갈 수 있음

    return res.send("OK");
  },
  archiveList: async (req, res) => {
    //DB Query, 진행중인 토론 제외하는 기능 추가, 또는 프론트에서 하나만 제외하고 표시
    const allPost = await Debate.findAll();
    return res.send(allPost);
  },
  currentDebate: async (req, res) => {
    const recentPost = await Debate.findAll({
      limit: 1,
      order: [["createdAt", "DESC"]],
    });
    //어떻게 코멘트를 같이 가져오지?

    return res.send(recentPost);
  },
};
