const { Post, Debate, User, Comment } = require("../models");
const { balanceCheck } = require("../utils/balanceCheck");
const { asyncWrapper } = require("../errors/async");
const { pagingSize } = require("../config/pagingConfig");
const { paging, postSize } = require("../utils/paging");
const sequelize = require("sequelize");
const Op = sequelize.Op;

const { getUserId } = require("../utils/getUserId");
const { textFilter } = require("../utils/filtering");

const { debatePostReward, VotePrice } = require("../config/rewardConfig");
module.exports = {
  writeDebatePost: asyncWrapper(async (req, res) => {
    const { opinion, title, content } = req.body;
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).send("로그인하지 않은 사용자입니다");
    }

    if (await textFilter(title)) {
      return res
        .status(400)
        .send("게시글 제목에 사용할 수 없는 문자열이 포함되어 있습니다.");
    }

    if (await textFilter(content)) {
      return res
        .status(400)
        .send("게시글 내용에 사용할 수 없는 문자열이 포함되어 있습니다.");
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
  voteDebatePost: async (req, res) => {
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
    console.log(curBalance);
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
  editDebatePost: async (req, res) => {
    //response에 수정된 updatedAt 첨부
    const userId = await getUserId(req);
    if (!userId) return res.status(401).send("로그인하지 않은 사용자입니다");

    const postId = req.params.post_id;

    const { opinion, title, content } = req.body;

    if (await textFilter(title)) {
      return res
        .status(400)
        .send("게시글 제목에 사용할 수 없는 문자열이 포함되어 있습니다.");
    }

    if (await textFilter(content)) {
      return res
        .status(400)
        .send("게시글 내용에 사용할 수 없는 문자열이 포함되어 있습니다.");
    }
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
  getDebatePostList: async (req, res) => {
    const opinion = req.query.opinion;
    const page = req.query.page;
    const keyword = req.query.keyword;
    let result;

    if (!keyword) {
      result = await Post.findAll({
        where: { opinion: opinion },
        order: [["id", "DESC"]],
        include: [
          { model: User, attributes: ["username"] },
          { model: Comment, attributes: ["id"] },
        ],
        offset: paging(page, pagingSize),
        limit: pagingSize,
      });
    } else {
      result = await Post.findAll({
        where: { opinion: opinion, title: { [Op.like]: "%" + keyword + "%" } },
        order: [["id", "DESC"]],
        include: [
          { model: User, attributes: ["username", "profile_image", "badge"] },
          { model: Comment, attributes: ["id"] },
        ],
        offset: paging(page, pagingSize),
        limit: pagingSize,
      });
    }

    if (result === null) {
      return res.status(204).send("아직 포스트가 존재하지 않습니다");
    }
    return res.status(200).send(result);
  },
  getDebatePost: async (req, res) => {
    const postId = req.params.post_id;
    if (!postId) return res.status(400).send("올바른 파라미터가 아닙니다");
    const postData = await Post.findByPk(postId, {
      include: [{ model: User, attributes: ["username"] }],
    });
    if (!postData) return res.status(404).send("해당 게시글이 없습니다.");

    await postData.increment("hit");

    return res.status(200).send(postData);
  },
  getPopularDebatePostList: async (req, res) => {
    const opinion = req.query.opinion;
    const page = req.query.opinion;

    const recentDebate = await Debate.findOne({
      order: [["id", "DESC"]],
    });
    const debateId = recentDebate.id;
    let count = await Post.count({ where: { board_id: boardId } });

    const result = await Post.findAll({
      where: { opinion: opinion, debate_id: debateId, up: { [Op.gte]: 10 } },
      order: [
        ["id", "DESC"],
        ["up", "DESC"],
      ],
      include: [
        { model: User, attributes: ["username", "profile_image", "badge"] },
        { model: Comment, attributes: ["id"] },
      ],
      offset: paging(page, pagingSize),
      limit: pagingSize,
    });

    return res.status(200).send({ data: result, count: count });
  },
};
