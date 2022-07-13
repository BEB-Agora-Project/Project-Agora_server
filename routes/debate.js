const router = require("express").Router();
const {
  debateCommentWrite,
  debateCommentVote,
  debateCommentEdit,
  debatePostComments,
} = require("../controllers/debateComment");
const {
  debatePostWrite,
  debatePostVote,
  debatePostEdit,
  debatePostList,
} = require("../controllers/debatePost");

const {
  archiveList,
  currentDebate,
  newDebatePush,
  test,
} = require("../controllers/debate");

//comment
router.post("/post/:id", debateCommentWrite);
router.post("/comment/:id", debateCommentVote); //up,down vote 인지 확인 ?vote=up
router.put("/comment/:id", debateCommentEdit);
router.get("/post/:id", debatePostComments); // post의 커멘트 get

//post
router.post("/post", debatePostWrite); // ?opinion=1  query 로 가져오기
router.post("/post/:id", debatePostVote); //up,down vote 인지 확인 ?vote=up
router.put("/post/:id", debatePostEdit);
router.get("/post", debatePostList); //?opinion 에 따라 해당 포스트 리턴

//debate
router.get("/archive", archiveList);
router.get("/", currentDebate);
router.post("/newDebate", newDebatePush); //새 예정 토론 등록, 개발용입니다
router.post("/test", test);

module.exports = router;
