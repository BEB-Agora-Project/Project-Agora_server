
const { Op } = require("sequelize");
const User = require("../models/user");
const Debate = require("../models/debate");
const Comment = require("../models/comment");
const cron = require("node-cron");
const { archiveDebate, tokenSettlement } = require("./transactions");
const {winFactor} = require("../config/rewardConfig");

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
      const recentPost = await Debate.findAll({
        limit: 1,
        order: [["createdAt", "DESC"]],
      });
      const winAgreeComments = (await Comment.findAll({limit : 1, order : [["up", "DESC"]],where : {category : 0}}))[0];
      const winNeutralComments = (await Comment.findAll({limit : 1, order : [["up", "DESC"]],where : {category : 1}}))[0];
      const winDisagreeComments = (await Comment.findAll({limit : 1, order : [["up", "DESC"]],where : {category : 2}}))[0];

      const archivePost = [recentPost.id, recentPost.title, winAgreeComments.content, winNeutralComments.content, winDisagreeComments.content]

  

      const archiveResult = await archiveDebate(archivePost); 
      console.log("succesfully archived", result);

      //코멘트 우승자에게 토큰보상 DB로 기록해주기


      const agreeReward = (winAgreeComments.up - winAgreeComments.down) * winFactor;
      const neutralReward = (winNeutralComments.up - winNeutralComments.down) * winFactor;
      const disagreeReward = (winDisagreeComments.up - winDisagreeComments.down) * winFactor;

      const agreeUserId = winAgreeComments.userId;
      const neutralUserId = winNeutralComments.userId;
      const disagreeUserId = winDisagreeComments.userId;

      let agreeUser = await User.findByPk(agreeUserId);
      let neutralUser = await User.findByPk(neutralUserId);
      let disagreeUser = await User.findByPk(disagreeUserId);

      agreeUser.expectedToken += agreeReward;
      neutralUser.expectedToken += neutralReward;
      disagreeUser.expectedToken += disagreeReward;

      agreeUser.save();
      neutralUser.save();
      disagreeUser.save();
      //DB Reward Done

      //새 토론 주제 설정, 걍 DB에 debateList.js에서 꺼내온담에 제일 최신으로 넣어주기.
      //newDebate는 쓰윽 가져오기
      const newDebate = { 
        title : title,
        content : content,
      };
        const newDebateResult = await Debate.create(newDebate)
        console.log(newDebateResult);
      //토론으로 접근 허용
    });
  },
  
  tokenSettlement: async () => {
    cron.schedule("10 3 * * *", () => {
      //토큰 정산 시작
      //DB에서 정산 리스트 만들기
      //정산후 DB업데이트

      //어차피 나중에 업데이트할거니까 싹다 가져옴
      const attributes = ["address", "expectedToken"];
        const mintList = await User.findAll({where : {expectedToken : {[Op.gt]: 0}}, attributes : attributes});
        const burnList = await User.findAll({where : {expectedToken : {[Op.lt]: 0}}, attributes : attributes});
        //DB에서 어떻게 돌아오는지 확인하고 트랜잭션 모듈에서 바로 쓸수있게 바꾸기
        let mintUserList = [[],[]];
        mintList.forEach(el => {
          mintUserList[0].push(el.address);
          mintUserList[1].push(el.expectedToken);
        })
        let burnUserList = [[],[]];
        burnList.forEach(el => {
          burnUserList[0].push(el.address);
          burnUserList[1].push(el.expectedToken);
        })


       const tokenResult =  await tokenSettlement(mintUserList, burnUserList);
       console.log("tokenSettlement", tokenResult);

      
        //update DB expectedToken + currentToken => currentToken, expectedToken = 0, 모든 유저에 대해
        let allUser = await User.findAll();
        for(let i = 0 ; i < allUser.length ; i++ ) {
          let user = allUser[i];
          let settledToken = user.currentToken + user.expectedToken;
          user.currentToken = settledToken;
          user.expectedToken = 0;
          user.save();
        }

    });
  },
};
