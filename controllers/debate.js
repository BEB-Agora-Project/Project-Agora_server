require("dotenv").config();
const { Debate, Post } = require("../models");
const { debateQueue } = require("../utils/debateQueue");

module.exports = {
  getArchiveList: async (req, res) => {
    //DB Query, 진행중인 토론 제외하는 기능 추가, 또는 프론트에서 하나만 제외하고 표시
    const allPost = await Debate.findAll();
    //allPost의 정렬순이 최신순인지 오래된순인지 확인하고 pop()
    //걍 프론트에서 제일 최신 포스트 제외하고 보여주면됨
    return res.status(200).send(allPost);
  },
  getCurrentDebate: async (req, res) => {
    const recentDebate = await Debate.findOne({
      order: [["id", "DESC"]],
    });
    const debateId = recentDebate.id;

    const agreePostCount = await Post.count({
      where: { opinion: 0, debate_id: debateId },
    });
    const agreePost = await Post.findAll({
      where: { opinion: 0, debate_id: debateId },
      order: [["up", "DESC"]],
      limit: 5,
    });
    const neutralPostCount = await Post.count({
      where: { opinion: 1, debate_id: debateId },
    });
    const neutralPost = await Post.findAll({
      where: { opinion: 1, debate_id: debateId },
      order: [["up", "DESC"]],
      limit: 5,
    });
    const disagreePostCount = await Post.count({
      where: { opinion: 2, debate_id: debateId },
    });
    const disagreePost = await Post.findAll({
      where: { opinion: 2, debate_id: debateId },
      order: [["up", "DESC"]],
      limit: 5,
    });

    //대표포스트만 가져와서 붙여넣기
    const result = {
      debate: recentDebate,
      agreePost: agreePost,
      agreePostCount: agreePostCount,
      neutralPost: neutralPost,
      neutralPostCount: neutralPostCount,
      disagreePost: disagreePost,
      disagreePostCount: disagreePostCount,
    };

    return res.status(200).send(result);
  },
  pushNewDebateQueue: async (req, res) => {
    //debateList 대기열에 추가
    const { title, content } = req.body;
    const obj = { title: title, content: content };
    debateQueue.push(obj);
    return res.json(debateQueue);
  },
  pushNewDebateDB: async (req, res) => {
    //DB에 추가
    let newDebate =
      debateQueue.length !== 0
        ? debateQueue.shift()
        : {
            title: "TEST 게시 예정인 토론이 없습니다. TEST",
            content: "TEST 게시 예정인 토론이 없습니다. TEST",
          };
    const result = await Debate.create(newDebate);
    return res.send(result);
  },
};
