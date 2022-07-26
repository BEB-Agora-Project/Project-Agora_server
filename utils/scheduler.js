const { Op } = require("sequelize");
const models = require("../models");
const User = models.User;
const Debate = models.Debate;
const Post = models.Post;
const { archiveDebate, tokenSettlement } = require("./transactions");
const { winFactor } = require("../config/rewardConfig");
const { debateQueue } = require("./debateQueue");

module.exports = {
  scheduleArchive: async () => {
    console.log("아카이브 시작");
    //토론 으로 접근 차단
    //아카이브화 진행
    // DB에서 제일 최신(아카이브화 할 포스트) 쿼리해서 다음 형태로 파라미터 만들어서 넣어주기.
    // const archivePost = [
    //   id,
    //   title,
    //   agreeComment,
    //   neutralComment,
    //   disagreeComment,
    // ];
    //우승댓글, 토론 가져오기
    const recentDebate = await Debate.findOne({
      order: [["id", "DESC"]],
    });
    const winAgreePost = await Post.findOne({
      order: [["up", "DESC"]],
      where: { opinion: 0 },
    });
    const winNeutralPost = await Post.findOne({
      order: [["up", "DESC"]],
      where: { opinion: 1 },
    });
    const winDisagreePost = await Post.findOne({
      order: [["up", "DESC"]],
      where: { opinion: 2 },
    });

    let newDebate =
      debateQueue.length !== 0
        ? debateQueue.shift()
        : {
            title: "TEST 게시 예정인 토론이 없습니다. TEST",
            content: "TEST 게시 예정인 토론이 없습니다. TEST",
          };

    const newDebateResult = await Debate.create(newDebate);

    if (
      winAgreePost === null ||
      winNeutralPost === null ||
      winDisagreePost === null
    ) {
      console.log("not a proper debate");
      return;
    }

    const archivePost = [
      recentDebate.id,
      recentDebate.title,
      winAgreePost.content,
      winNeutralPost.content,
      winDisagreePost.content,
    ];

    //스마트컨트랙트 스트링받도록 수정
    const archiveResult = await archiveDebate(archivePost);
    console.log("succesfully archived", archiveResult);

    //코멘트 우승자에게 토큰보상 DB로 기록해주기

    const agreeReward = (winAgreePost.up - winAgreePost.down) * winFactor;
    const neutralReward = (winNeutralPost.up - winNeutralPost.down) * winFactor;
    const disagreeReward =
      (winDisagreePost.up - winDisagreePost.down) * winFactor;

    const agreeUserId = winAgreePost.user_id;
    const neutralUserId = winNeutralPost.user_id;
    const disagreeUserId = winDisagreePost.user_id;

    const agreeUserInfo = await User.findByPk(agreeUserId);
    const neutralUserInfo = await User.findByPk(neutralUserId);
    const disagreeUserInfo = await User.findByPk(disagreeUserId);

    agreeExpectedToken = agreeUserInfo.expected_token;
    neutralExpectedToken = neutralUserInfo.expected_token;
    disagreeExpectedToken = disagreeUserInfo.expected_token;

    agreeExpectedToken += agreeReward;
    neutralExpectedToken += neutralReward;
    disagreeExpectedToken += disagreeReward;

    await agreeUserInfo.update({ expected_token: agreeExpectedToken });
    await neutralUserInfo.update({ expected_token: neutralExpectedToken });
    await disagreeUserInfo.update({
      expected_token: disagreeExpectedToken,
    });

    //DB Reward Done

    //새 토론 주제 설정, 걍 DB에 debateList.js에서 꺼내온담에 제일 최신으로 넣어주기.
    //newDebate는 쓰윽 가져오기

    console.log(newDebateResult);
    //토론으로 접근 허용

    return;
  },

  scheduleSettlement: async () => {
    console.log("토큰 정산 시작");
    //토큰 정산 시작
    //DB에서 정산 리스트 만들기
    //정산후 DB업데이트
    //정산동안 사이트 내리기.

    //어차피 나중에 업데이트할거니까 싹다 가져옴
    const mintList = await User.findAll({
      where: { expected_token: { [Op.gt]: 0 } },
    });
    const burnList = await User.findAll({
      where: { expected_token: { [Op.lt]: 0 } },
    });

    if (mintList === null && burnList === null) {
      console.log("No mint List");
      return;
    }

    //DB에서 어떻게 돌아오는지 확인하고 트랜잭션 모듈에서 바로 쓸수있게 바꾸기
    let mintUserList = [];
    let mintAddressList = [];
    let mintTokenList = [];
    mintList.forEach((el) => {
      mintAddressList.push(el.address);
      mintTokenList.push(el.expected_token);
    });
    mintUserList.push(mintAddressList);
    mintUserList.push(mintTokenList);

    let burnUserList = [];
    let burnAddressList = [];
    let burnTokenList = [];
    burnList.forEach((el) => {
      burnAddressList.push(el.address);
      burnTokenList.push(-el.expected_token);
    });
    burnUserList.push(burnAddressList);
    burnUserList.push(burnTokenList);

    const tokenResult = await tokenSettlement(mintUserList, burnUserList);
    console.log("tokenSettlement", tokenResult);

    //update DB expectedToken + currentToken => currentToken, expectedToken = 0, 모든 유저에 대해
    let allUser = await User.findAll();
    let settledToken;
    for await (const user of allUser) {
      settledToken = user.current_token + user.expected_token;

      user.current_token = settledToken;
      user.expected_token = 0;
      user.today_vote_count = 0;
      user.today_login = false;

      await user.save();
    }

    return;
  },
};
