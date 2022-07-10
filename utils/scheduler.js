//토론종료 후 아카이브화 하는 과정 모듈화 다음을 포함한다 ->
/*토큰 정산(트랜잭션), 토론 아카이브화(트랜잭션, DB에 저장)
진행중인 토론 변경하기(로컬 fs에서 다음 토론 읽어와서 DB 에 저장, 진행중인 토론은 DB에서 가장 최신 아이템이고, fs에 큐로 저장해놓음
*/
const { Op } = require("sequelize");
const User = require("../models/user");
const Debate = require("../models/debate");
const cron = require("node-cron");
const { archiveDebate, tokenSettlement } = require("./transactions");

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
      const archiveResult = await archiveDebate(archivePost); 
      console.log("succesfully archived", result);

      //코멘트 우승자에게 토큰보상 DB로 기록해주기

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
      const attributes = ["address", "currentToken", "expectedToken"];
        const mintList = await User.findAll({where : {expectedToken : {[Op.gt]: 0}}, attributes: attributes});
        const burnList = await User.findAll({where : {expectedToken : {[Op.lt]: 0}}, attributes :attributes});
        //DB에서 어떻게 돌아오는지 확인하고 트랜잭션 모듈에서 바로 쓸수있게 바꾸기

       const tokenResult =  await tokenSettlement(mintList, burnList);
       console.log("tokenSettlement", tokenResult);
        //update DB expectedToken + currentToken => currentToken, expectedToken = 0

    });
  },
};
