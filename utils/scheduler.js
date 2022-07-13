
const { Op } = require("sequelize");
const User = require("../models/user");
const Debate = require("../models/debate");
const Post = require("../models/comment");
const Post = require("../models/post")
const cron = require("node-cron");
const { archiveDebate, tokenSettlement } = require("./transactions");
const {winFactor} = require("../config/rewardConfig");
const timezone = { timezone: "Asia/Tokyo" };
const debateList = require("./debateList");

module.exports = {
  scheduleArchive: async () => {
    cron.schedule("3 * * *", () => {
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
        order: [["created_at", "DESC"]],
      });
      const winAgreePost = await Post.findOne({order : [["up", "DESC"]],where : {opinion : 0}});
      const winNeutralPost = await Post.findOne({order : [["up", "DESC"]],where : {opinion : 1}});
      const winDisagreePost = await Post.findOne({order : [["up", "DESC"]],where : {opinion : 2}});

      const archivePost = [recentDebate.id, recentDebate.title, winAgreePost.content, winNeutralPost.content, winDisagreePost.content]

  
      //스마트컨트랙트 스트링받도록 수정
      const archiveResult = await archiveDebate(archivePost); 
      console.log("succesfully archived", result);

      //코멘트 우승자에게 토큰보상 DB로 기록해주기


      const agreeReward = (winAgreePost.up - winAgreePost.down) * winFactor;
      const neutralReward = (winNeutralPost.up - winNeutralPost.down) * winFactor;
      const disagreeReward = (winDisagreePost.up - winDisagreePost.down) * winFactor;

      const agreeUserId = winAgreePost.user_id;
      const neutralUserId = winNeutralPost.user_id;
      const disagreeUserId = winDisagreePost.user_id;

      let agreeUser = await User.findByPk(agreeUserId);
      let neutralUser = await User.findByPk(neutralUserId);
      let disagreeUser = await User.findByPk(disagreeUserId);

      agreeUser.expected_token += agreeReward;
      neutralUser.expected_token += neutralReward;
      disagreeUser.expected_token += disagreeReward;

      await agreeUser.save();
      await neutralUser.save();
      await disagreeUser.save();
      //DB Reward Done

      //새 토론 주제 설정, 걍 DB에 debateList.js에서 꺼내온담에 제일 최신으로 넣어주기.
      //newDebate는 쓰윽 가져오기

      let title = "TEST 게시 예정인 토론이 없습니다. TEST"
      let content = "TEST 게시 예정인 토론이 없습니다. TEST"

      if(debateList.length !== 0){
        //DB 뽑아와서 title, content 재할당
      }
      const newDebate = { 
        title : title,
        content : content,
      };

      
        const newDebateResult = await Debate.create(newDebate)
        console.log(newDebateResult);
      //토론으로 접근 허용
    },timezone);
  },
  
  tokenSettlement: async () => {
    cron.schedule("10 3 * * *", () => {
      //토큰 정산 시작
      //DB에서 정산 리스트 만들기
      //정산후 DB업데이트

      //어차피 나중에 업데이트할거니까 싹다 가져옴
      const attributes = ["address", "expected_token"];
        const mintList = await User.findAll({where : {expected_token : {[Op.gt]: 0}}, attributes : attributes});
        const burnList = await User.findAll({where : {expected_token : {[Op.lt]: 0}}, attributes : attributes});
        //DB에서 어떻게 돌아오는지 확인하고 트랜잭션 모듈에서 바로 쓸수있게 바꾸기
        let mintUserList = [[],[]];
        mintList.forEach(el => {
          mintUserList[0].push(el.address);
          mintUserList[1].push(el.expected_token);
        })
        let burnUserList = [[],[]];
        burnList.forEach(el => {
          burnUserList[0].push(el.address);
          burnUserList[1].push(el.expected_token);
        })


       const tokenResult =  await tokenSettlement(mintUserList, burnUserList);
       console.log("tokenSettlement", tokenResult);

      
        //update DB expectedToken + currentToken => currentToken, expectedToken = 0, 모든 유저에 대해
        let allUser = await User.findAll();
        for(let i = 0 ; i < allUser.length ; i++ ) {
          let user = allUser[i];
          let settledToken = user.current_token + user.expected_token;
          user.current_token = settledToken;
          user.expected_token = 0;
          await user.save();
        }

    },timezone);
  },
};
