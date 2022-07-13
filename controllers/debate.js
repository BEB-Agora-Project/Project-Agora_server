require("dotenv").config();
const Debate = require("../models/debate");
const { debateList } = require("../utils/debateList");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");

module.exports = {
  archiveList: async (req, res) => {
    //DB Query, 진행중인 토론 제외하는 기능 추가, 또는 프론트에서 하나만 제외하고 표시
    const allPost = await Debate.findAll();
    //allPost의 정렬순이 최신순인지 오래된순인지 확인하고 pop()
    //걍 프론트에서 제일 최신 포스트 제외하고 보여주면됨
    return res.send(allPost);
  },
  currentDebate: async (req, res) => {
    const recentPost = await Debate.findOne({
      order: [["id", "DESC"]],
    });
    //어떻게 코멘트를 같이 가져오지? 커멘트 가져오는게아니라 대표 포스트들만
    const postId = recentPost.id;
    //foreignKey를 이렇게 쓰는건지 모르겠음
    const agreePost = await Post.findOne({
      where: { opinion: 0 },
      order: [["up", "DESC"]],
    });
    const neutralPost = await Post.findOne({
      where: { opinion: 1 },
      order: [["up", "DESC"]],
    });
    const disagreePost = await Post.findOne({
      where: { opinion: 2 },
      order: [["up", "DESC"]],
    });

    //대표포스트만 가져와서 붙여넣기
    const result = {
      post: recentPost,
      agreePost: agreePost,
      neutralPost: neutralPost,
      disagreePost: disagreePost,
    };

    return res.send(result);
  },
  newDebatePush: (req, res) => {
    const { title, content } = req.body;
    const obj = { title: title, content: content };
    debateList.push(obj);
    return res.json(debateList);
  },
};
